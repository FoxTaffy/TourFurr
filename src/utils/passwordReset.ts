import { supabase } from '../services/supabase'
import { DISABLE_EMAIL } from './env'
import { logger } from './logger'

export interface PasswordResetCode {
  id: string
  email: string
  code: string
  created_at: string
  expires_at: string
  attempts: number
  used: boolean
  verified_at?: string
}

/**
 * Generate a cryptographically secure random 6-digit reset code
 */
export function generateResetCode(): string {
  // Use CSPRNG with rejection sampling to avoid modulo bias
  const max = 900000 // range size (100000–999999)
  const cap = Math.floor(0x100000000 / max) * max // largest multiple of max within Uint32 range
  let value: number
  const array = new Uint32Array(1)
  do {
    crypto.getRandomValues(array)
    value = array[0]
  } while (value >= cap)
  return (100000 + (value % max)).toString()
}

/**
 * Hash a code using SHA-256 for secure storage
 * Only hashed codes are stored in the database
 */
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(code)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Create and store a new password reset code
 * @param email - User's email address
 * @returns The generated code (unhashed for email) and expiration time
 * Note: Only the hashed code is stored in the database
 */
export async function createPasswordResetCode(email: string): Promise<{
  success: boolean
  code?: string
  expiresAt?: Date
  error?: string
}> {
  try {
    const code = generateResetCode()
    const hashedCode = await hashCode(code)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now

    const { error } = await supabase
      .from('password_reset_codes')
      .insert({
        email: email.toLowerCase(),
        code: hashedCode, // Store hashed code
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating password reset code:', error)
      return { success: false, error: 'Не удалось создать код сброса пароля' }
    }

    return {
      success: true,
      code, // Return plain code for email
      expiresAt
    }
  } catch (err: any) {
    logger.error('Exception creating password reset code:', err)
    return { success: false, error: err.message || 'Неизвестная ошибка' }
  }
}

/**
 * Verify a reset code entered by the user
 * @param email - User's email address
 * @param code - 6-digit code entered by user
 * @returns Success status and error message if any
 * Note: The code is hashed before comparison with the stored hashed code
 */
export async function verifyResetCode(email: string, code: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { data: codes, error: fetchError } = await supabase
      .from('password_reset_codes')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)

    if (fetchError) {
      logger.error('Error fetching reset code:', fetchError)
      return { success: false, error: 'Ошибка проверки кода' }
    }

    if (!codes || codes.length === 0) {
      return {
        success: false,
        error: 'Код не найден. Запросите новый код сброса пароля.'
      }
    }

    const resetRecord = codes[0] as PasswordResetCode

    // Check if code has expired
    if (new Date(resetRecord.expires_at) < new Date()) {
      return {
        success: false,
        error: 'Код истёк. Запросите новый код сброса пароля.'
      }
    }

    // Check if too many attempts
    if (resetRecord.attempts >= 3) {
      return {
        success: false,
        error: 'Слишком много попыток. Запросите новый код сброса пароля.'
      }
    }

    // Hash the provided code and compare with stored hash
    const hashedProvidedCode = await hashCode(code)

    if (resetRecord.code !== hashedProvidedCode) {
      // Increment attempts for wrong code
      await supabase
        .from('password_reset_codes')
        .update({ attempts: resetRecord.attempts + 1 })
        .eq('id', resetRecord.id)

      return {
        success: false,
        error: 'Неверный код. Проверьте код из письма или запросите новый.'
      }
    }

    // Code is correct! Mark as used
    const { error: updateError } = await supabase
      .from('password_reset_codes')
      .update({
        used: true,
        verified_at: new Date().toISOString()
      })
      .eq('id', resetRecord.id)

    if (updateError) {
      logger.error('Error updating reset code:', updateError)
      return { success: false, error: 'Ошибка при обновлении кода' }
    }

    logger.log('✅ Password reset code verified successfully')
    return { success: true }
  } catch (err: any) {
    logger.error('Exception verifying reset code:', err)
    return { success: false, error: err.message || 'Неизвестная ошибка' }
  }
}

/**
 * Send password reset code via email
 * Note: This requires a backend endpoint to actually send emails
 * In development mode, the code is only logged to console
 */
export async function sendPasswordResetEmail(email: string, code: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // DEVELOPMENT MODE: Just log the code without sending email
    // This prevents rate limit issues during testing
    if (DISABLE_EMAIL) {
      // Output to console with highly visible styling
      const separator = '='.repeat(80)
      console.log('\n' + separator)
      console.log('%c🚀 РЕЖИМ РАЗРАБОТКИ: Email отправка отключена', 'color: #60a5fa; font-size: 16px; font-weight: bold;')
      console.log(separator)
      console.log('%c📧 Email:', 'color: #fbbf24; font-weight: bold;', email)
      console.log('%c🔑 КОД СБРОСА ПАРОЛЯ:', 'color: #ef4444; font-size: 20px; font-weight: bold;', code)
      console.log('%c⏰ Действителен:', 'color: #fbbf24; font-weight: bold;', '15 минут')
      console.log('%c💡 Инструкция:', 'color: #60a5fa; font-weight: bold;', 'Скопируйте код выше и вставьте на странице подтверждения')
      console.log(separator + '\n')

      // Also log to internal logger
      logger.log('[DEV MODE] Password reset code for ' + email + ': ' + code)

      return { success: true }
    }

    // PRODUCTION MODE: Use Supabase Edge Function to send email
    const { error } = await supabase.functions.invoke('send-password-reset-email', {
      body: {
        email,
        code
      }
    })

    if (error) {
      logger.error('Error sending password reset email:', error)

      // Check if it's a rate limit error
      if (error.message && (
        error.message.includes('rate limit') ||
        error.message.includes('too many') ||
        error.message.includes('Email rate limit exceeded')
      )) {
        return {
          success: false,
          error: 'Слишком много писем отправлено на этот адрес. Подождите 1 час и попробуйте снова.'
        }
      }

      return {
        success: false,
        error: 'Не удалось отправить email. Попробуйте позже или свяжитесь с поддержкой.'
      }
    }

    return { success: true }
  } catch (err: any) {
    logger.error('Exception sending password reset email:', err)

    // Check if it's a rate limit error
    if (err.message && (
      err.message.includes('rate limit') ||
      err.message.includes('too many') ||
      err.message.includes('Email rate limit exceeded')
    )) {
      return {
        success: false,
        error: 'Слишком много писем отправлено на этот адрес. Подождите 1 час и попробуйте снова.'
      }
    }

    return {
      success: false,
      error: 'Ошибка отправки email. Попробуйте позже или свяжитесь с поддержкой.'
    }
  }
}

/**
 * Invalidate all unused reset codes for an email (when requesting a new code)
 */
export async function invalidateOldResetCodes(email: string): Promise<void> {
  await supabase
    .from('password_reset_codes')
    .update({ used: true })
    .eq('email', email.toLowerCase())
    .eq('used', false)
}
