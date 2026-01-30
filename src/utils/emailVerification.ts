import { supabase } from '../services/supabase'
import { DISABLE_EMAIL } from './env'
import { logger } from './logger'

export interface VerificationCode {
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
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode(): string {
  // Generate a number between 100000 and 999999
  const code = Math.floor(100000 + Math.random() * 900000)
  return code.toString()
}

/**
 * Create and store a new verification code
 * @param email - User's email address
 * @returns The generated code and expiration time
 */
export async function createVerificationCode(email: string): Promise<{
  success: boolean
  code?: string
  expiresAt?: Date
  error?: string
}> {
  try {
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now

    const { data, error } = await supabase
      .from('email_verification_codes')
      .insert({
        email: email.toLowerCase(),
        code,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating verification code:', error)
      return { success: false, error: 'Не удалось создать код подтверждения' }
    }

    return {
      success: true,
      code,
      expiresAt
    }
  } catch (err: any) {
    logger.error('Exception creating verification code:', err)
    return { success: false, error: err.message || 'Неизвестная ошибка' }
  }
}

/**
 * Verify a code entered by the user
 * @param email - User's email address
 * @param code - 6-digit code entered by user
 * @returns Success status and error message if any
 */
export async function verifyCode(email: string, code: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // STRATEGY 1: Try our custom verification code system first
    const { data: codes, error: fetchError } = await supabase
      .from('email_verification_codes')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)

    if (!fetchError && codes && codes.length > 0) {
      const verificationRecord = codes[0] as VerificationCode

      // Check if code has expired
      if (new Date(verificationRecord.expires_at) < new Date()) {
        logger.log('Custom code expired, will try Supabase OTP fallback')
        // Don't return yet, try Supabase OTP as fallback
      }
      // Check if too many attempts
      else if (verificationRecord.attempts >= 3) {
        logger.log('Too many attempts on custom code, will try Supabase OTP fallback')
        // Don't return yet, try Supabase OTP as fallback
      }
      // Check if code matches our custom code
      else if (verificationRecord.code === code) {
        // Code is correct! Mark as used
        const { error: updateError } = await supabase
          .from('email_verification_codes')
          .update({
            used: true,
            verified_at: new Date().toISOString()
          })
          .eq('id', verificationRecord.id)

        if (updateError) {
          logger.error('Error updating verification code:', updateError)
        }

        logger.log('✅ Verified using custom code')
        return { success: true }
      } else {
        // Increment attempts for wrong custom code
        await supabase
          .from('email_verification_codes')
          .update({ attempts: verificationRecord.attempts + 1 })
          .eq('id', verificationRecord.id)

        logger.log('Custom code mismatch, will try Supabase OTP fallback')
        // Continue to Supabase OTP fallback
      }
    }

    // STRATEGY 2: Fallback to Supabase's built-in OTP verification
    // This handles codes sent by Supabase's automatic email system
    logger.log('Trying Supabase OTP verification as fallback...')

    try {
      const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
        email: email.toLowerCase(),
        token: code,
        type: 'email'
      })

      if (!otpError && otpData?.user) {
        logger.log('✅ Verified using Supabase OTP')
        return { success: true }
      } else {
        logger.log('Supabase OTP verification failed:', otpError?.message)
      }
    } catch (otpException: any) {
      logger.log('Exception during Supabase OTP verification:', otpException.message)
    }

    // Both strategies failed
    return {
      success: false,
      error: 'Неверный код. Проверьте код из письма или запросите новый.'
    }
  } catch (err: any) {
    logger.error('Exception verifying code:', err)
    return { success: false, error: err.message || 'Неизвестная ошибка' }
  }
}

/**
 * Send verification code via email
 * Note: This requires a backend endpoint to actually send emails
 * In development mode, the code is only logged to console
 */
export async function sendVerificationEmail(email: string, code: string): Promise<{
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
      console.log('%c🔑 КОД ПОДТВЕРЖДЕНИЯ:', 'color: #22c55e; font-size: 20px; font-weight: bold;', code)
      console.log('%c⏰ Действителен:', 'color: #fbbf24; font-weight: bold;', '15 минут')
      console.log('%c💡 Инструкция:', 'color: #60a5fa; font-weight: bold;', 'Скопируйте код выше и вставьте на странице подтверждения')
      console.log(separator + '\n')

      // Also log to internal logger
      logger.log('[DEV MODE] Verification code for ' + email + ': ' + code)

      return { success: true }
    }

    // PRODUCTION MODE: Use Supabase Edge Function to send email
    const { data, error } = await supabase.functions.invoke('send-verification-email', {
      body: {
        email,
        code
      }
    })

    if (error) {
      logger.error('Error sending verification email:', error)

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
    logger.error('Exception sending verification email:', err)

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
 * Invalidate all unused codes for an email (when requesting a new code)
 */
export async function invalidateOldCodes(email: string): Promise<void> {
  await supabase
    .from('email_verification_codes')
    .update({ used: true })
    .eq('email', email.toLowerCase())
    .eq('used', false)
}
