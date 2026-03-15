import { supabase } from '../services/supabase'
import { logger } from './logger'
import { DISABLE_EMAIL } from './env'

export type PasswordResetCode = {
  id: string; email: string; used: boolean; expires_at: string
  attempts: number; code: string; created_at: string
}

/**
 * Запрашиваем сброс пароля через Supabase Auth.
 * Supabase отправляет email с OTP через настроенный SMTP (Gmail).
 */
export async function createPasswordResetCode(email: string): Promise<{
  success: boolean
  expiresAt?: Date
  error?: string
}> {
  try {
    if (DISABLE_EMAIL) {
      logger.log('DEV: Password reset email disabled. Use Supabase dashboard to get OTP.')
      return { success: true, expiresAt: new Date(Date.now() + 15 * 60 * 1000) }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase(),
      { redirectTo: `${window.location.origin}/auth/verify-reset-code` }
    )

    if (error) {
      if (error.status === 429 || error.message.toLowerCase().includes('rate limit')) {
        return { success: false, error: 'Слишком много запросов. Подождите и попробуйте снова.' }
      }
      logger.error('resetPasswordForEmail error:', error)
      return { success: false, error: 'Не удалось отправить письмо. Попробуйте позже.' }
    }

    logger.log('Password reset email sent via Supabase Auth (Gmail SMTP)')
    return { success: true, expiresAt: new Date(Date.now() + 15 * 60 * 1000) }
  } catch (err: any) {
    logger.error('Exception requesting password reset:', err)
    return { success: false, error: err.message || 'Неизвестная ошибка' }
  }
}

/**
 * Проверяем OTP-код сброса пароля через Supabase Auth.
 */
export async function verifyResetCode(email: string, code: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase.auth.verifyOtp({
      email: email.toLowerCase(),
      token: code,
      type: 'recovery'
    })
    if (error) {
      logger.error('Reset OTP verification failed:', error)
      return {
        success: false,
        error: 'Неверный или истёкший код. Проверьте письмо или запросите новый.'
      }
    }
    logger.log('Password reset OTP verified')
    return { success: true }
  } catch (err: any) {
    logger.error('Exception verifying reset code:', err)
    return { success: false, error: err.message || 'Неизвестная ошибка' }
  }
}

/** @deprecated No-op для совместимости */
export async function sendPasswordResetEmail(_email: string, _code?: string): Promise<{
  success: boolean; error?: string
}> {
  return { success: true }
}

/** @deprecated No-op для совместимости */
export async function invalidateOldResetCodes(_email: string): Promise<void> {}
