import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../services/supabase'
import bcrypt from 'bcryptjs'
import {
  rateLimiter,
  RATE_LIMITS,
  sanitizeInput,
  isValidEmail,
  checkPasswordStrength,
  detectSuspiciousActivity,
  securityLogger,
  getClientFingerprint
} from '@/utils/security'

// Security: Allowed file types for avatar
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Security: Validate file
function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Недопустимый тип файла' }
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Файл слишком большой (макс. 5MB)' }
  }
  return { valid: true }
}

// Security: Generate secure file name
function generateSecureFileName(file: File): string {
  const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp'
  return `${crypto.randomUUID()}.${ext}`
}

// Security: Safe JSON parse
function safeJsonParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

export interface User {
  id: string
  email: string
  nickname: string
  phone: string
  telegram: string
  avatar?: string
  description?: string
  status: 'pending' | 'approved' | 'rejected'
  emailSubscribed: boolean
  emailVerified: boolean
  emailVerifiedAt?: string
  createdAt: string
  isAdmin: boolean
  hasAllergies: boolean
  allergiesDescription?: string
  bringingPet: boolean
  petDescription?: string
}

export interface RegisterData {
  email: string
  password: string
  nickname: string
  phone: string
  telegram: string
  avatar?: File
  description?: string
  agreeRules: boolean
  agreePrivacy: boolean
  emailSubscribed: boolean
  hasAllergies: boolean
  allergiesDescription?: string
  bringingPet: boolean
  petDescription?: string
}

// Map database row to User interface
function mapDbUserToUser(dbUser: any): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    nickname: dbUser.nickname,
    phone: dbUser.phone,
    telegram: dbUser.telegram,
    avatar: dbUser.avatar_url,
    description: dbUser.description,
    status: dbUser.status,
    emailSubscribed: dbUser.email_subscribed,
    emailVerified: dbUser.email_verified || false,
    emailVerifiedAt: dbUser.email_verified_at,
    createdAt: dbUser.created_at,
    isAdmin: dbUser.is_admin || false,
    hasAllergies: dbUser.has_allergies || false,
    allergiesDescription: dbUser.allergies_description,
    bringingPet: dbUser.bringing_pet || false,
    petDescription: dbUser.pet_description
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const userStatus = computed(() => user.value?.status || null)

  // Load user from localStorage on init
  if (token.value) {
    const storedUser = localStorage.getItem('current_user')
    user.value = safeJsonParse<User | null>(storedUser, null)
  }

  async function login(email: string, password: string) {
    isLoading.value = true
    error.value = null

    try {
      // Security: Sanitize and validate email
      const cleanEmail = sanitizeInput(email.toLowerCase())
      const fingerprint = getClientFingerprint()

      // Security: Rate limiting - prevent brute force attacks
      if (!rateLimiter.isAllowed(cleanEmail, RATE_LIMITS.LOGIN)) {
        const blockedTime = rateLimiter.getBlockedTime(cleanEmail)
        securityLogger.log({
          type: 'rate_limit',
          identifier: cleanEmail,
          details: { action: 'login', fingerprint }
        })
        error.value = `Слишком много попыток входа. Попробуйте через ${Math.ceil(blockedTime / 60)} минут`
        return { success: false, error: error.value }
      }

      // Security: Email validation
      if (!isValidEmail(cleanEmail)) {
        error.value = 'Неверный формат email'
        return { success: false, error: error.value }
      }

      // Security: Detect suspicious activity (XSS, SQL injection attempts)
      if (detectSuspiciousActivity(email) || detectSuspiciousActivity(password)) {
        securityLogger.log({
          type: 'suspicious_activity',
          identifier: cleanEmail,
          details: { action: 'login', fingerprint }
        })
        error.value = 'Обнаружена подозрительная активность'
        return { success: false, error: error.value }
      }

      // Security: Log login attempt
      securityLogger.log({
        type: 'login_attempt',
        identifier: cleanEmail,
        details: { fingerprint }
      })

      console.log('Attempting login with email:', cleanEmail)

      // 1. Try Supabase Auth first (for new users)
      let authData = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      })

      // 2. If Supabase Auth fails, check if it's an old user with bcrypt password
      if (authData.error && authData.error.message.includes('Invalid login credentials')) {
        console.log('Supabase Auth failed, checking for old user with bcrypt...')

        // Check if user exists in database with old bcrypt password
        const { data: oldUser, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle()

        if (oldUser && oldUser.password_hash) {
          console.log('Found old user, verifying bcrypt password...')

          // Verify old bcrypt password
          const isValidBcrypt = await bcrypt.compare(password, oldUser.password_hash)

          if (isValidBcrypt) {
            console.log('Old password valid, migrating to Supabase Auth...')

            // Migrate user to Supabase Auth
            const { data: migratedAuth, error: migrateError } = await supabase.auth.signUp({
              email: cleanEmail,
              password: password,
              options: {
                data: {
                  migrated: true,
                  original_id: oldUser.id
                }
              }
            })

            if (migrateError || !migratedAuth.user) {
              console.error('Migration failed:', migrateError)
              error.value = 'Ошибка миграции аккаунта. Свяжитесь с поддержкой.'
              return { success: false, error: error.value }
            }

            console.log('Migration successful, migrating user record...')

            // Delete old record and create new one with Supabase Auth ID
            // Step 1: Save old user data
            const oldUserData = { ...oldUser }

            // Step 2: Delete old record
            const { error: deleteError } = await supabase
              .from('users')
              .delete()
              .eq('id', oldUser.id)

            if (deleteError) {
              console.error('Failed to delete old user record:', deleteError)
              error.value = 'Ошибка миграции аккаунта. Свяжитесь с поддержкой.'
              return { success: false, error: error.value }
            }

            // Step 3: Insert new record with new Supabase Auth ID
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: migratedAuth.user.id,  // New Supabase Auth ID
                email: oldUserData.email,
                password_hash: '',  // Clear old password (now managed by Supabase Auth)
                nickname: oldUserData.nickname,
                phone: oldUserData.phone,
                telegram: oldUserData.telegram,
                avatar_url: oldUserData.avatar_url,
                description: oldUserData.description,
                status: oldUserData.status,
                email_subscribed: oldUserData.email_subscribed,
                email_verified: true,  // Old users are pre-verified
                agree_rules: oldUserData.agree_rules,
                agree_privacy: oldUserData.agree_privacy,
                has_allergies: oldUserData.has_allergies,
                allergies_description: oldUserData.allergies_description,
                bringing_pet: oldUserData.bringing_pet,
                pet_description: oldUserData.pet_description,
                created_at: oldUserData.created_at  // Preserve original creation date
              })

            if (insertError) {
              console.error('Failed to insert migrated user record:', insertError)
              error.value = 'Ошибка миграции аккаунта. Свяжитесь с поддержкой.'
              return { success: false, error: error.value }
            }

            console.log('User record migrated successfully')

            // Now try to sign in again with Supabase Auth
            authData = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: password
            })

            console.log('Migrated user logged in successfully')
          }
        }
      }

      // 3. Check final auth result
      if (authData.error) {
        console.error('Auth error:', authData.error)
        securityLogger.log({
          type: 'login_failure',
          identifier: cleanEmail,
          details: { reason: 'auth_error', fingerprint }
        })
        error.value = 'Неверный email или пароль'
        return { success: false, error: error.value }
      }

      if (!authData.data?.user) {
        console.log('User not found')
        securityLogger.log({
          type: 'login_failure',
          identifier: cleanEmail,
          details: { reason: 'user_not_found', fingerprint }
        })
        error.value = 'Неверный email или пароль'
        return { success: false, error: error.value }
      }

      // 4. Check if email is verified (skip for migrated old users)
      const isMigratedUser = authData.data.user.user_metadata?.migrated
      if (!isMigratedUser && !authData.data.user.email_confirmed_at) {
        console.log('Email not confirmed')
        securityLogger.log({
          type: 'login_failure',
          identifier: cleanEmail,
          details: { reason: 'email_not_verified', fingerprint }
        })
        await supabase.auth.signOut() // Sign out immediately
        error.value = 'Пожалуйста, подтвердите ваш email. Проверьте вашу почту.'
        return { success: false, error: error.value }
      }

      console.log('Email verified, fetching user data...')

      // 5. Get user profile from users table
      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.data.user.id)
        .maybeSingle()

      if (dbError || !userData) {
        console.error('Database error:', dbError)
        securityLogger.log({
          type: 'login_failure',
          identifier: cleanEmail,
          details: { reason: 'database_error', fingerprint }
        })
        error.value = 'Ошибка получения данных пользователя'
        return { success: false, error: error.value }
      }

      console.log('Login successful')
      const mappedUser = mapDbUserToUser(userData)

      // Use Supabase session token
      token.value = authData.data.session?.access_token || crypto.randomUUID()
      user.value = mappedUser
      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('current_user', JSON.stringify(mappedUser))

      // Security: Reset rate limit on successful login
      rateLimiter.reset(cleanEmail)

      return { success: true }
    } catch (err: any) {
      console.error('Login error:', err)
      const cleanEmail = sanitizeInput(email.toLowerCase())
      securityLogger.log({
        type: 'login_failure',
        identifier: cleanEmail,
        details: { error: err.message, fingerprint: getClientFingerprint() }
      })
      error.value = err.message || 'Ошибка входа'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function register(data: RegisterData) {
    isLoading.value = true
    error.value = null

    try {
      // Security: Sanitize and validate email
      const cleanEmail = sanitizeInput(data.email.toLowerCase())
      const cleanNickname = sanitizeInput(data.nickname)
      const fingerprint = getClientFingerprint()

      // Security: Rate limiting - prevent mass registration attacks
      if (!rateLimiter.isAllowed(cleanEmail, RATE_LIMITS.REGISTER)) {
        const blockedTime = rateLimiter.getBlockedTime(cleanEmail)
        error.value = `Слишком много попыток регистрации. Попробуйте через ${Math.ceil(blockedTime / 60)} минут`
        return { success: false, error: error.value }
      }

      // Security: Email validation
      if (!isValidEmail(cleanEmail)) {
        error.value = 'Неверный формат email'
        return { success: false, error: error.value }
      }

      // Security: Password strength check
      const passwordCheck = checkPasswordStrength(data.password)
      if (!passwordCheck.isStrong) {
        error.value = `Пароль недостаточно надежный: ${passwordCheck.feedback.join(', ')}`
        return { success: false, error: error.value }
      }

      // Security: Detect suspicious activity in all text inputs
      const allInputs = [
        data.email,
        data.nickname,
        data.phone,
        data.telegram,
        data.description || '',
        data.allergiesDescription || '',
        data.petDescription || ''
      ]

      if (allInputs.some(input => detectSuspiciousActivity(input))) {
        securityLogger.log({
          type: 'suspicious_activity',
          identifier: cleanEmail,
          details: { action: 'register', fingerprint }
        })
        error.value = 'Обнаружена подозрительная активность в данных'
        return { success: false, error: error.value }
      }

      // Security: Log registration attempt
      securityLogger.log({
        type: 'registration',
        identifier: cleanEmail,
        details: { fingerprint }
      })

      // Upload avatar if provided (before Supabase Auth signup)
      let avatarUrl: string | null = null
      if (data.avatar) {
        // Security: Validate file type and size
        const fileValidation = validateFile(data.avatar)
        if (!fileValidation.valid) {
          error.value = fileValidation.error!
          return { success: false, error: error.value }
        }

        // Security: Generate secure filename based on MIME type
        const fileName = generateSecureFileName(data.avatar)

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, data.avatar, {
            contentType: data.avatar.type,
            upsert: false
          })

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)
          avatarUrl = urlData.publicUrl
        }
      }

      // 1. Register user with Supabase Auth (sends email verification)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            nickname: cleanNickname,
            phone: sanitizeInput(data.phone),
            telegram: sanitizeInput(data.telegram)
          }
        }
      })

      if (authError) {
        console.error('Auth signup error:', authError)
        if (authError.message.includes('already registered')) {
          error.value = 'Этот email уже зарегистрирован'
        } else {
          error.value = authError.message
        }
        return { success: false, error: error.value }
      }

      if (!authData.user) {
        error.value = 'Ошибка создания пользователя'
        return { success: false, error: error.value }
      }

      // 2. Create user profile in users table
      const { data: newUser, error: dbError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id, // Important: use Supabase Auth user ID
          email: cleanEmail,
          password_hash: '', // Not needed anymore, Supabase Auth handles it
          nickname: cleanNickname,
          phone: sanitizeInput(data.phone),
          telegram: sanitizeInput(data.telegram),
          avatar_url: avatarUrl,
          description: data.description ? sanitizeInput(data.description) : null,
          status: 'pending',
          email_subscribed: data.emailSubscribed,
          email_verified: false, // Will be updated when user confirms email
          agree_rules: data.agreeRules,
          agree_privacy: data.agreePrivacy,
          has_allergies: data.hasAllergies,
          allergies_description: data.allergiesDescription ? sanitizeInput(data.allergiesDescription) : null,
          bringing_pet: data.bringingPet,
          pet_description: data.petDescription ? sanitizeInput(data.petDescription) : null
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        if (dbError.code === '23505') {
          if (dbError.message.includes('nickname')) {
            error.value = 'Этот никнейм уже занят'
          } else {
            error.value = 'Пользователь уже существует'
          }
        } else {
          error.value = dbError.message
        }
        return { success: false, error: error.value }
      }

      // Security: Reset rate limit on successful registration
      rateLimiter.reset(cleanEmail)

      // Don't auto-login - user needs to verify email first
      return {
        success: true,
        message: 'Регистрация успешна! Проверьте вашу почту для подтверждения email.'
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      error.value = err.message || 'Ошибка регистрации'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function checkEmailUnique(email: string): Promise<boolean> {
    // Security: Sanitize and validate email
    const cleanEmail = sanitizeInput(email.toLowerCase())

    // Security: Rate limiting to prevent email enumeration attacks
    if (!rateLimiter.isAllowed(`email_check_${cleanEmail}`, RATE_LIMITS.EMAIL_CHECK)) {
      // Return true to not reveal information when rate limited
      return true
    }

    // Security: Email format validation
    if (!isValidEmail(cleanEmail)) {
      return true
    }

    try {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle()

      return !data
    } catch {
      // Return true to not reveal information on error
      return true
    }
  }

  async function checkNicknameUnique(nickname: string): Promise<boolean> {
    // Security: Sanitize input
    const sanitizedNickname = sanitizeInput(nickname)
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('nickname', sanitizedNickname)
      .single()
    return !data
  }

  async function fetchUser() {
    if (!token.value) return

    const storedUser = localStorage.getItem('current_user')
    const cachedUser = safeJsonParse<User | null>(storedUser, null)

    if (!cachedUser) {
      logout()
      return
    }

    user.value = cachedUser

    // Fetch fresh data from database to get updated status
    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id', cachedUser.id)
        .single()

      if (!dbError && data) {
        const freshUser = mapDbUserToUser(data)
        user.value = freshUser
        localStorage.setItem('current_user', JSON.stringify(freshUser))
      }
    } catch (err) {
      // Keep cached user if fetch fails
      console.error('Failed to fetch fresh user data:', err)
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('current_user')
  }

  function clearError() {
    error.value = null
  }

  async function updateProfile(updates: {
    nickname?: string
    phone?: string
    telegram?: string
    description?: string
    avatar?: File
    hasAllergies?: boolean
    allergiesDescription?: string
    bringingPet?: boolean
    petDescription?: string
    emailSubscribed?: boolean
  }) {
    if (!user.value) return { success: false, error: 'Не авторизован' }

    isLoading.value = true
    error.value = null

    try {
      const updateData: any = {}

      // Security: Sanitize all inputs
      if (updates.nickname) updateData.nickname = sanitizeInput(updates.nickname)
      if (updates.phone) updateData.phone = sanitizeInput(updates.phone)
      if (updates.telegram) updateData.telegram = sanitizeInput(updates.telegram)
      if (updates.description !== undefined) {
        updateData.description = updates.description ? sanitizeInput(updates.description) : null
      }
      if (updates.hasAllergies !== undefined) {
        updateData.has_allergies = updates.hasAllergies
      }
      if (updates.allergiesDescription !== undefined) {
        updateData.allergies_description = updates.allergiesDescription ? sanitizeInput(updates.allergiesDescription) : null
      }
      if (updates.bringingPet !== undefined) {
        updateData.bringing_pet = updates.bringingPet
      }
      if (updates.petDescription !== undefined) {
        updateData.pet_description = updates.petDescription ? sanitizeInput(updates.petDescription) : null
      }
      if (updates.emailSubscribed !== undefined) {
        updateData.email_subscribed = updates.emailSubscribed
      }

      // Handle avatar upload
      if (updates.avatar) {
        // Security: Validate file type and size
        const fileValidation = validateFile(updates.avatar)
        if (!fileValidation.valid) {
          error.value = fileValidation.error!
          return { success: false, error: error.value }
        }

        // Delete old avatar if exists
        if (user.value.avatar) {
          // Security: Extract filename safely using URL parsing
          try {
            const url = new URL(user.value.avatar)
            const oldFileName = url.pathname.split('/').pop()
            if (oldFileName && /^[a-f0-9-]+\.(jpg|png|webp)$/i.test(oldFileName)) {
              await supabase.storage.from('avatars').remove([oldFileName])
            }
          } catch {
            // Invalid URL, skip deletion
          }
        }

        // Security: Generate secure filename based on MIME type
        const fileName = generateSecureFileName(updates.avatar)

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, updates.avatar, {
            contentType: updates.avatar.type,
            upsert: false
          })

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)
          updateData.avatar_url = urlData.publicUrl
        }
      }

      const { data, error: dbError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.value.id)
        .select()
        .single()

      if (dbError) {
        if (dbError.code === '23505' && dbError.message.includes('nickname')) {
          error.value = 'Этот никнейм уже занят'
        } else {
          error.value = dbError.message
        }
        return { success: false, error: error.value }
      }

      const updatedUser = mapDbUserToUser(data)
      user.value = updatedUser
      localStorage.setItem('current_user', JSON.stringify(updatedUser))

      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Ошибка обновления'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function deleteAccount() {
    if (!user.value) return { success: false, error: 'Не авторизован' }

    isLoading.value = true
    error.value = null

    try {
      // Delete avatar from storage if exists
      if (user.value.avatar) {
        // Security: Extract filename safely using URL parsing
        try {
          const url = new URL(user.value.avatar)
          const fileName = url.pathname.split('/').pop()
          if (fileName && /^[a-f0-9-]+\.(jpg|png|webp)$/i.test(fileName)) {
            await supabase.storage.from('avatars').remove([fileName])
          }
        } catch {
          // Invalid URL, skip deletion
        }
      }

      // Delete user from database
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.value.id)

      if (dbError) {
        error.value = dbError.message
        return { success: false, error: error.value }
      }

      // Logout
      logout()

      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Ошибка удаления'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    userStatus,
    login,
    register,
    checkEmailUnique,
    checkNicknameUnique,
    fetchUser,
    logout,
    clearError,
    updateProfile,
    deleteAccount
  }
})
