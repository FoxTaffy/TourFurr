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

      const { data, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle()

      if (dbError) {
        console.error('Database error:', dbError)
        securityLogger.log({
          type: 'login_failure',
          identifier: cleanEmail,
          details: { reason: 'database_error', fingerprint }
        })
        error.value = 'Ошибка базы данных'
        return { success: false, error: error.value }
      }

      if (!data) {
        console.log('User not found with email:', cleanEmail)
        securityLogger.log({
          type: 'login_failure',
          identifier: cleanEmail,
          details: { reason: 'user_not_found', fingerprint }
        })
        error.value = 'Неверный email или пароль'
        return { success: false, error: error.value }
      }

      console.log('User found, verifying password...')
      // Verify password
      const isValid = await bcrypt.compare(password, data.password_hash)
      if (!isValid) {
        console.log('Password verification failed')
        securityLogger.log({
          type: 'login_failure',
          identifier: cleanEmail,
          details: { reason: 'invalid_password', fingerprint }
        })
        error.value = 'Неверный email или пароль'
        return { success: false, error: error.value }
      }

      console.log('Login successful')
      const mappedUser = mapDbUserToUser(data)
      // Security: Use cryptographically secure token
      token.value = crypto.randomUUID()
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

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 12)

      // Upload avatar if provided
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

      // Insert user with sanitized inputs
      const { data: newUser, error: dbError } = await supabase
        .from('users')
        .insert({
          email: sanitizeInput(data.email).toLowerCase(),
          password_hash: passwordHash,
          nickname: sanitizeInput(data.nickname),
          phone: sanitizeInput(data.phone),
          telegram: sanitizeInput(data.telegram),
          avatar_url: avatarUrl,
          description: data.description ? sanitizeInput(data.description) : null,
          status: 'pending',
          email_subscribed: data.emailSubscribed,
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
        if (dbError.code === '23505') {
          if (dbError.message.includes('email')) {
            error.value = 'Этот email уже зарегистрирован'
          } else if (dbError.message.includes('nickname')) {
            error.value = 'Этот никнейм уже занят'
          } else {
            error.value = 'Пользователь уже существует'
          }
        } else {
          error.value = dbError.message
        }
        return { success: false, error: error.value }
      }

      const mappedUser = mapDbUserToUser(newUser)
      // Security: Use cryptographically secure token
      token.value = crypto.randomUUID()
      user.value = mappedUser
      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('current_user', JSON.stringify(mappedUser))

      // Security: Reset rate limit on successful registration
      rateLimiter.reset(cleanEmail)

      return { success: true }
    } catch (err: any) {
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
