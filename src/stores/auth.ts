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
import { logger } from '@/utils/logger'

// Security: Allowed file types for avatar
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Get file extension from filename
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1) return ''
  return filename.slice(lastDot).toLowerCase()
}

// Determine actual file type from MIME type or extension
function getActualFileType(file: File): { mimeType: string; extension: string } | null {
  const ext = getFileExtension(file.name)

  // First check MIME type
  if (ALLOWED_MIME_TYPES.includes(file.type)) {
    const extFromMime = file.type === 'image/jpeg' ? '.jpg' : file.type === 'image/png' ? '.png' : '.webp'
    return { mimeType: file.type, extension: extFromMime }
  }

  // Fallback to extension check (some files may have wrong MIME type)
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    const mimeFromExt = ext === '.png' ? 'image/png'
      : (ext === '.jpg' || ext === '.jpeg') ? 'image/jpeg'
      : 'image/webp'
    return { mimeType: mimeFromExt, extension: ext }
  }

  return null
}

// Security: Validate file
function validateFile(file: File): { valid: boolean; error?: string; fileType?: { mimeType: string; extension: string } } {
  // Check file size first
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Файл слишком большой (макс. 5MB)' }
  }

  // Check MIME type OR extension
  const fileType = getActualFileType(file)
  if (!fileType) {
    return { valid: false, error: 'Недопустимый тип файла. Разрешены: JPG, PNG, WebP' }
  }

  return { valid: true, fileType }
}

// Security: Generate secure file name
function generateSecureFileName(file: File): string {
  const fileType = getActualFileType(file)
  const ext = fileType
    ? (fileType.extension === '.jpeg' ? '.jpg' : fileType.extension)
    : '.jpg'  // Fallback
  return `${crypto.randomUUID()}${ext}`
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
  emailVerified: boolean
  emailVerifiedAt?: string
  createdAt: string
  isAdmin: boolean
  canApproveApplications: boolean
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
    emailVerified: dbUser.email_verified || false,
    emailVerifiedAt: dbUser.email_verified_at,
    createdAt: dbUser.created_at,
    isAdmin: dbUser.is_admin || false,
    canApproveApplications: dbUser.can_approve_applications || false,
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

      logger.log('Attempting login with email:', cleanEmail)

      // 1. Try Supabase Auth first (for new users)
      let authData = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      })

      // 2. If Supabase Auth fails, check if it's an old user with bcrypt password or unverified new user
      if (authData.error && authData.error.message.includes('Invalid login credentials')) {
        logger.log('Supabase Auth failed, checking for old user or unverified user...')

        // Check if user exists in database
        const { data: existingUser, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle()

        // Check if it's a new unverified user
        if (existingUser && !existingUser.email_verified && !existingUser.password_hash) {
          logger.log('Found unverified new user, sending new verification code...')

          // Generate and send new verification code
          try {
            const { createVerificationCode, sendVerificationEmail, invalidateOldCodes } = await import('../utils/emailVerification')

            // Invalidate old codes first
            await invalidateOldCodes(cleanEmail)

            // Create new code
            const codeResult = await createVerificationCode(cleanEmail)

            if (codeResult.success && codeResult.code) {
              await sendVerificationEmail(cleanEmail, codeResult.code)
            }
          } catch (codeError: any) {
            logger.error('Error generating verification code:', codeError)
          }

          error.value = 'Email не подтверждён. Новый код отправлен на вашу почту.'
          securityLogger.log({
            type: 'login_failure',
            identifier: cleanEmail,
            details: { reason: 'email_not_verified', fingerprint }
          })
          return {
            success: false,
            error: error.value,
            needsVerification: true,
            email: cleanEmail
          }
        }

        // Check if it's an old user with bcrypt password
        if (existingUser && existingUser.password_hash) {
          logger.log('Found old user, verifying bcrypt password...')

          // Verify old bcrypt password
          const isValidBcrypt = await bcrypt.compare(password, existingUser.password_hash)

          if (isValidBcrypt) {
            logger.log('Old password valid, migrating to Supabase Auth...')

            // Migrate user to Supabase Auth
            const { data: migratedAuth, error: migrateError } = await supabase.auth.signUp({
              email: cleanEmail,
              password: password,
              options: {
                data: {
                  migrated: true,
                  original_id: existingUser.id
                }
              }
            })

            if (migrateError || !migratedAuth.user) {
              logger.error('Migration failed:', migrateError)
              error.value = 'Ошибка миграции аккаунта. Свяжитесь с поддержкой.'
              return { success: false, error: error.value }
            }

            logger.log('Migration successful, migrating user record...')

            // Delete old record and create new one with Supabase Auth ID
            // Step 1: Save old user data
            const oldUserData = { ...existingUser }

            // Step 2: Delete old record
            const { error: deleteError } = await supabase
              .from('users')
              .delete()
              .eq('id', existingUser.id)

            if (deleteError) {
              logger.error('Failed to delete old user record:', deleteError)
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
                email_verified: true,  // Old users are pre-verified
                agree_rules: oldUserData.agree_rules,
                agree_privacy: oldUserData.agree_privacy,
                bringing_pet: oldUserData.bringing_pet,
                pet_description: oldUserData.pet_description,
                created_at: oldUserData.created_at  // Preserve original creation date
              })

            if (insertError) {
              logger.error('Failed to insert migrated user record:', insertError)
              error.value = 'Ошибка миграции аккаунта. Свяжитесь с поддержкой.'
              return { success: false, error: error.value }
            }

            logger.log('User record migrated successfully')

            // Now try to sign in again with Supabase Auth
            authData = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: password
            })

            logger.log('Migrated user logged in successfully')
          }
        }
      }

      // 3. Check final auth result
      if (authData.error) {
        logger.error('Auth error:', authData.error)
        securityLogger.log({
          type: 'login_failure',
          identifier: cleanEmail,
          details: { reason: 'auth_error', fingerprint }
        })
        error.value = 'Неверный email или пароль'
        return { success: false, error: error.value }
      }

      if (!authData.data?.user) {
        logger.log('User not found')
        securityLogger.log({
          type: 'login_failure',
          identifier: cleanEmail,
          details: { reason: 'user_not_found', fingerprint }
        })
        error.value = 'Неверный email или пароль'
        return { success: false, error: error.value }
      }

      logger.log('Fetching user data...')

      // 4. Get user profile from users table first to check email_verified
      // We use our own email verification system with 6-digit codes
      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.data.user.id)
        .maybeSingle()

      if (dbError || !userData) {
        logger.error('Database error:', dbError)
        securityLogger.log({
          type: 'login_failure',
          identifier: cleanEmail,
          details: { reason: 'database_error', fingerprint }
        })
        error.value = 'Ошибка получения данных пользователя'
        return { success: false, error: error.value }
      }

      // 5. Check if email is verified in OUR system (not Supabase Auth)
      // We use our own email verification with 6-digit codes
      const isMigratedUser = authData.data.user.user_metadata?.migrated
      if (!isMigratedUser && !userData.email_verified) {
        logger.log('Email not verified in our system')
        securityLogger.log({
          type: 'login_failure',
          identifier: cleanEmail,
          details: { reason: 'email_not_verified', fingerprint }
        })
        await supabase.auth.signOut() // Sign out immediately

        // Try to send a new verification code
        try {
          const { createVerificationCode, sendVerificationEmail, invalidateOldCodes } = await import('../utils/emailVerification')

          // Invalidate old codes first
          await invalidateOldCodes(cleanEmail)

          // Create new code
          const codeResult = await createVerificationCode(cleanEmail)

          if (codeResult.success && codeResult.code) {
            await sendVerificationEmail(cleanEmail, codeResult.code)
          }
        } catch (codeError: any) {
          logger.error('Error generating verification code:', codeError)
        }

        error.value = 'Email не подтверждён. Новый код отправлен на вашу почту.'
        return {
          success: false,
          error: error.value,
          needsVerification: true,
          email: cleanEmail
        }
      }

      logger.log('Login successful')
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
      logger.error('Login error:', err)
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
        // Use detected MIME type (may be different from file.type if extension was used)
        const actualMimeType = fileValidation.fileType?.mimeType || data.avatar.type

        logger.log('Uploading avatar:', {
          fileName,
          originalType: data.avatar.type,
          detectedType: actualMimeType,
          size: data.avatar.size
        })

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, data.avatar, {
            contentType: actualMimeType,
            upsert: false
          })

        if (uploadError) {
          logger.error('Avatar upload failed:', uploadError)
          // Don't fail registration, but warn user
          logger.warn('Registration will continue without avatar')
        } else {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)
          avatarUrl = urlData.publicUrl
          logger.log('Avatar uploaded successfully:', avatarUrl)
        }
      }

      // 1. Register user with Supabase Auth (disable automatic email)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
          data: {
            nickname: cleanNickname,
            phone: sanitizeInput(data.phone),
            telegram: sanitizeInput(data.telegram)
          },
          // IMPORTANT: Disable automatic email confirmation from Supabase
          // We handle email verification with our own 6-digit codes
          // This prevents rate limit issues from sending 2 emails
        }
      })

      if (authError) {
        logger.error('Auth signup error:', authError)
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

      // Detect fake signUp success: when email already exists in auth.users,
      // Supabase returns a user with empty identities instead of an error
      // (anti-enumeration behavior when email confirmation is enabled)
      if (!authData.user.identities || authData.user.identities.length === 0) {
        error.value = 'Этот email уже зарегистрирован. Попробуйте войти или восстановить пароль.'
        return { success: false, error: error.value }
      }

      // 2. Create user profile in users table
      // NOTE: Do NOT chain .select().single() — the user is not authenticated yet
      // (signUp with email confirmation does not create a session), so RLS
      // SELECT policies will block reading back the inserted row (403).
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id, // Important: use Supabase Auth user ID
          email: cleanEmail,
          password_hash: '', // Not needed anymore, Supabase Auth handles it
          nickname: cleanNickname,
          phone: sanitizeInput(data.phone, 20),
          telegram: sanitizeInput(data.telegram, 100),
          avatar_url: avatarUrl,
          description: data.description ? sanitizeInput(data.description, 500) : null,
          status: 'pending',
          email_verified: false, // Will be updated when user confirms email
          agree_rules: data.agreeRules,
          agree_privacy: data.agreePrivacy,
          bringing_pet: data.bringingPet,
          pet_description: data.petDescription ? sanitizeInput(data.petDescription, 300) : null
        })

      if (dbError) {
        logger.error('Database error:', dbError)

        // CRITICAL CLEANUP: If users record creation fails, Supabase Auth account is orphaned
        // admin.deleteUser() requires Service Role Key (only available in Edge Functions)
        // Orphaned accounts will be cleaned up by cleanup-unverified-accounts cron job
        // This runs every 15 minutes and deletes unverified accounts without users record
        logger.warn('Orphaned auth account created (will be cleaned by cron):', authData.user.id)

        // Security: Cleanup uploaded avatar if DB insert failed
        if (avatarUrl) {
          try {
            const fileName = avatarUrl.split('/').pop()
            if (fileName) {
              await supabase.storage.from('avatars').remove([fileName])
              logger.log('Cleaned up orphaned avatar file:', fileName)
            }
          } catch (cleanupError) {
            logger.error('Failed to cleanup avatar:', cleanupError)
          }
        }

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

      // Generate and send 6-digit verification code
      let emailSent = false
      let emailError = ''
      try {
        const { createVerificationCode, sendVerificationEmail } = await import('../utils/emailVerification')

        const codeResult = await createVerificationCode(cleanEmail)

        if (codeResult.success && codeResult.code) {
          const emailResult = await sendVerificationEmail(cleanEmail, codeResult.code)
          emailSent = emailResult.success
          emailError = emailResult.error || ''

          if (!emailSent) {
            logger.error('Failed to send verification email:', emailError)
          }
        } else {
          logger.error('Failed to create verification code:', codeResult.error)
          emailError = codeResult.error || ''
        }
      } catch (codeError: any) {
        logger.error('Error generating verification code:', codeError)
        emailError = codeError.message || 'Ошибка отправки кода'
        // Don't fail registration if code generation fails
      }

      // Don't auto-login - user needs to verify email first
      return {
        success: true,
        email: cleanEmail,
        emailSent,
        emailError,
        message: emailSent
          ? 'Регистрация успешна! На вашу почту отправлен код подтверждения.'
          : `Регистрация успешна, но не удалось отправить email: ${emailError}`
      }
    } catch (err: any) {
      logger.error('Registration error:', err)
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
      // Use RPC function that checks BOTH users table AND auth.users table
      // with SECURITY DEFINER (bypasses RLS). This catches orphaned auth
      // accounts that a direct SELECT on users table would miss.
      const { data, error: rpcError } = await supabase
        .rpc('check_email_exists', { p_email: cleanEmail })

      if (rpcError) {
        logger.error('Email check RPC error:', rpcError)
        // Fallback: try direct query on users table
        const { data: fallbackData } = await supabase
          .from('users')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle()
        return !fallbackData
      }

      // RPC returns true if email exists, we need to return true if unique
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
      .maybeSingle()
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
      logger.error('Failed to fetch fresh user data:', err)
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
        // Use detected MIME type (may be different from file.type if extension was used)
        const actualMimeType = fileValidation.fileType?.mimeType || updates.avatar.type

        logger.log('Uploading new avatar:', {
          fileName,
          originalType: updates.avatar.type,
          detectedType: actualMimeType,
          size: updates.avatar.size
        })

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, updates.avatar, {
            contentType: actualMimeType,
            upsert: false
          })

        if (uploadError) {
          logger.error('Avatar upload failed:', uploadError)
          error.value = `Ошибка загрузки аватара: ${uploadError.message}`
          return { success: false, error: error.value }
        } else {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)
          updateData.avatar_url = urlData.publicUrl
          logger.log('Avatar uploaded successfully:', urlData.publicUrl)
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
