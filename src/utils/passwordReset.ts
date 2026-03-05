import { supabase } from '../services/supabase'
import { logger } from './logger'

// Оставляем для обратной совместимости с пропсами которые импортируют этот тип
export type PasswordResetCode = {
  id: string; email: string; used: boolean; expires_at: string
  attempts: number; code: string; created_at: string
}

/**
 * Запрашиваем сброс пароля через Supabase Auth.
 * Supabase сам отправляет письмо — ничего не хранится в БД.
 */
export async function createPasswordResetCode(email: string): Promise<{
  success: boolean
  code?: string
  expiresAt?: Date
  error?: string
}> {
  try {
    const redirectTo = `${window.location.origin}/update-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo
    })
    if (error) {
      logger.error('Error requesting password reset:', error)
    }
    // Не раскрываем существует ли email — всегда success
    logger.log('Password reset email sent via Supabase Auth')
    return { success: true, expiresAt: new Date(Date.now() + 15 * 60 * 1000) }
  } catch (err: any) {
    logger.error('Exception requesting password reset:', err)
    return { success: false, error: err.message || 'Неизвестная ошибка' }
  }
}

/**
 * Проверяем OTP-код сброса пароля через Supabase Auth.
 * Никаких обращений к БД.
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

/**
 * @deprecated Supabase Auth сам отправляет письмо в createPasswordResetCode.
 * No-op для совместимости с пропсами вью.
 */
export async function sendPasswordResetEmail(_email: string, _code?: string): Promise<{
  success: boolean
  error?: string
}> {
  return { success: true }
}

/**
 * @deprecated База данных не используется. No-op для совместимости.
 */
export async function invalidateOldResetCodes(_email: string): Promise<void> {
  // No-op: таблица password_reset_codes удалена
}