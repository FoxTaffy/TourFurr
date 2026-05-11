import { supabase } from '../services/supabase'
import { logger } from './logger'
import { DISABLE_EMAIL, getEdgeFunctionUrl } from './env'

export type PasswordResetCode = {
  id: string; email: string; used: boolean; expires_at: string
  attempts: number; code: string; created_at: string
}

/**
 * Запрашиваем сброс пароля через Edge Function.
 * Edge Function генерирует OTP через Supabase Admin API и отправляет через Resend.
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

    const url = getEdgeFunctionUrl('send-password-reset-email')
    logger.log('🔐 Password reset: calling Edge Function at:', url)

    // Prepare headers - only add Authorization if we have an active session
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token
    if (accessToken) {
      logger.log('🔐 Password reset: using access token')
      headers['Authorization'] = `Bearer ${accessToken}`
    } else {
      logger.log('🔐 Password reset: no access token (user not logged in)')
    }

    // Call the Edge Function to send password reset email
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email: email.toLowerCase() })
    })

    logger.log('🔐 Password reset: response status:', response.status)

    const data = await response.json()
    logger.log('🔐 Password reset: response data:', data)

    if (!response.ok) {
      const statusCode = response.status
      if (statusCode === 429) {
        logger.warn('🔐 Password reset: rate limited (429)')
        return { success: false, error: 'Слишком много запросов. Подождите и попробуйте снова.' }
      }
      logger.error('🔐 Password reset: error response', { status: statusCode, error: data })
    return { success: false, error: data.error || data.details || 'Не удалось отправить письмо. Попробуйте позже.' }
    }

    logger.log('✅ Password reset: email sent via Resend service, messageId:', data.messageId)
    return { success: true, expiresAt: new Date(Date.now() + 15 * 60 * 1000) }
  } catch (err: any) {
    logger.error('❌ Password reset: Exception during fetch/fetch processing:', {
      message: err.message,
      name: err.name,
      stack: err.stack
    })
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
    const { error, data } = await supabase.auth.verifyOtp({
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
    
    // Сохраняем информацию о восстановлении пароля
    if (data.session) {
      logger.log('Recovery session established:', {
        user_id: data.user?.id,
        email: data.user?.email
      })
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
