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
 * Generate a cryptographically secure random 6-digit verification code
 */
export function generateVerificationCode(): string {
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

    // NOTE: Do NOT chain .select().single() here — the user is not authenticated
    // yet during registration, so the SELECT policy blocks the read and returns
    // a 500 (infinite recursion in RLS). We only need to know if INSERT succeeded.
    const { error } = await supabase
      .from('email_verification_codes')
      .insert({
        email: email.toLowerCase(),
        code,
        expires_at: expiresAt.toISOString()
      })

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
    // STRATEGY 0: Preferred secure path via RPC function on backend.
    // verify_email_code() should validate code, rate-limit attempts,
    // mark code as used and set users.email_verified in one transaction.
    try {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('verify_email_code', {
          p_email: email.toLowerCase(),
          p_code: code
        })

      if (!rpcError && rpcData) {
        const row = Array.isArray(rpcData) ? rpcData[0] : rpcData
        if (row?.is_valid === true) {
          logger.log('✅ Verified using secure RPC verify_email_code')
          return { success: true }
        }

        if (row?.is_valid === false) {
          return {
            success: false,
            error: row?.message || 'Неверный или истекший код'
          }
        }
      }

      if (rpcError) {
        logger.log('verify_email_code RPC unavailable, falling back:', rpcError.message)
      }
    } catch (rpcException: any) {
      logger.log('verify_email_code RPC exception, falling back:', rpcException?.message)
    }

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
        // Code is correct! Mark as used and set email_verified in one go
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

        // CRITICAL: Also update users.email_verified so auth guards work correctly.
        // The RPC (strategy 0) does this atomically; we must do it explicitly in the fallback.
        const { error: userUpdateError } = await supabase
          .from('users')
          .update({ email_verified: true, email_verified_at: new Date().toISOString() })
          .eq('email', email.toLowerCase())

        if (userUpdateError) {
          logger.error('Strategy 1: failed to set email_verified:', userUpdateError)
          // Not a fatal error — code is marked used, RLS will catch bad access
        }

        logger.log('✅ Verified using custom code (strategy 1)')
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
        // Ensure our own email_verified flag is set so auth guards work correctly.
        // These updates are best-effort: if they fail the user is still considered
        // verified (Supabase Auth has already confirmed ownership).
        try {
          await supabase
            .from('email_verification_codes')
            .update({ used: true, verified_at: new Date().toISOString() })
            .eq('email', email.toLowerCase())
            .eq('used', false)
          const { error: userUpdateError } = await supabase
            .from('users')
            .update({ email_verified: true, email_verified_at: new Date().toISOString() })
            .eq('email', email.toLowerCase())
          if (userUpdateError) {
            logger.error('OTP fallback: failed to set email_verified:', userUpdateError)
          }
        } catch (updateErr: any) {
          logger.error('OTP fallback: error updating verification state:', updateErr)
        }
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

    // PRODUCTION MODE: Use direct fetch to Supabase Edge Function (faster than SDK invoke)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    let fetchResponse: Response
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || supabaseAnonKey

      fetchResponse = await fetch(`${supabaseUrl}/functions/v1/send-verification-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({ email, code })
      })
    } catch (netErr: any) {
      logger.error('Network error sending verification email:', netErr)
      return {
        success: false,
        error: 'Сетевая ошибка при отправке письма'
      }
    }

    // Parse response
    const responseData = await fetchResponse.json().catch(() => ({}))
    const error: any = fetchResponse.ok ? null : responseData

    if (error) {
      logger.error('Error sending verification email:', error)

      const isRateLimit =
        fetchResponse.status === 429 ||
        (responseData.message && (
          responseData.message.includes('rate limit') ||
          responseData.message.includes('too many') ||
          responseData.message.includes('Email rate limit exceeded')
        ))

      if (isRateLimit) {
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

    // Check if it's a rate limit error.
    // FunctionsHttpError stores the HTTP response in .context, so check status 429 first.
    const isRateLimit =
      err?.context?.status === 429 ||
      (err.message && (
        err.message.includes('rate limit') ||
        err.message.includes('too many') ||
        err.message.includes('Email rate limit exceeded')
      ))

    if (isRateLimit) {
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
