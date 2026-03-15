import { supabase } from '../services/supabase'
import { DISABLE_EMAIL } from './env'
import { logger } from './logger'

// Оставляем для обратной совместимости с пропсами которые импортируют этот тип
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
 * Generate a cryptographically secure random 6-digit code.
 * Теперь только для отображения в dev-режиме — в продакшн код приходит от Supabase Auth.
 */
export function generateVerificationCode(): string {
  const max = 900000
  const cap = Math.floor(0x100000000 / max) * max
  let value: number
  const array = new Uint32Array(1)
  do {
    crypto.getRandomValues(array)
    value = array[0]
  } while (value >= cap)
  return (100000 + (value % max)).toString()
}

/**
 * @deprecated Коды не хранятся в БД. Supabase Auth отправляет OTP сам.
 * Оставлена для обратной совместимости.
 */
export async function createVerificationCode(_email: string): Promise<{
  success: boolean
  code?: string
  expiresAt?: Date
  error?: string
}> {
  return { success: true, expiresAt: new Date(Date.now() + 15 * 60 * 1000) }
}

/**
 * Проверяем OTP-код через Supabase Auth. База данных не требуется.
 */
export async function verifyCode(email: string, code: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // type: 'email' — used for signInWithOtp codes (user exists, email already confirmed in auth,
    // but we still want them to validate the address via OTP to set email_verified in public.users)
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.toLowerCase(),
      token: code,
      type: 'email'
    })

    if (!error && data?.user) {
      // Mark email_verified = true in public.users so grace-period cleanup won't delete this account
      const { error: rpcError } = await supabase.rpc('mark_email_verified', { p_user_id: data.user.id })
      if (rpcError) {
        logger.error('mark_email_verified RPC error (non-fatal):', rpcError)
      }
      logger.log('✅ Email verified via OTP')
      return { success: true }
    }

    logger.log('OTP verification failed:', error?.message)
    return {
      success: false,
      error: 'Неверный или истёкший код. Проверьте письмо или запросите новый.'
    }
  } catch (err: any) {
    logger.error('Exception verifying code:', err)
    return { success: false, error: err.message || 'Неизвестная ошибка' }
  }
}

/**
 * Отправляем письмо подтверждения через Supabase Auth (resend).
 * Supabase использует настроенный SMTP (Gmail) для отправки OTP.
 */
export async function sendVerificationEmail(email: string, _code?: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    if (DISABLE_EMAIL) {
      logger.log('='.repeat(60))
      logger.log('DEV: Отправка email отключена')
      logger.log('Email:', email)
      logger.log('(Supabase отправляет OTP автоматически через Gmail SMTP)')
      logger.log('='.repeat(60))
      return { success: true }
    }

    // signInWithOtp sends a 6-digit OTP code to the email.
    // Works for confirmed users (unlike resend({ type:'signup' }) which fails when email_confirmed_at is already set).
    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/verify-email`
      }
    })

    if (error) {
      const isRateLimit = error.status === 429 ||
        error.message.toLowerCase().includes('rate limit')

      if (isRateLimit) {
        return { success: false, error: 'Слишком много писем. Подождите и попробуйте снова.' }
      }
      logger.error('signInWithOtp error:', error)
      return { success: false, error: 'Не удалось отправить письмо. Попробуйте позже.' }
    }

    return { success: true }
  } catch (err: any) {
    logger.error('Exception sending verification email:', err)
    return { success: false, error: 'Ошибка отправки письма.' }
  }
}

/**
 * @deprecated База данных не используется. No-op для совместимости.
 */
export async function invalidateOldCodes(_email: string): Promise<void> {
  // No-op: таблица email_verification_codes удалена
}