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
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.toLowerCase(),
      token: code,
      type: 'email'
    })

    if (!error && data?.user) {
      logger.log('✅ Email verified via Supabase Auth OTP')
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
 * Отправляем письмо подтверждения через Edge Function.
 * Для dev-режима выводит код в консоль.
 */
export async function sendVerificationEmail(email: string, code: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    if (DISABLE_EMAIL) {
      logger.log('='.repeat(60))
      logger.log('DEV: Отправка email отключена')
      logger.log('Email:', email)
      logger.log('КОД:', code || '(Supabase отправляет OTP автоматически)')
      logger.log('='.repeat(60))
      return { success: true }
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token || supabaseAnonKey

    const fetchResponse = await fetch(`${supabaseUrl}/functions/v1/send-verification-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({ email, code })
    })

    if (!fetchResponse.ok) {
      const data = await fetchResponse.json().catch(() => ({}))
      const isRateLimit = fetchResponse.status === 429 ||
        (data?.message || '').toLowerCase().includes('rate limit')

      if (isRateLimit) {
        return { success: false, error: 'Слишком много писем. Подождите и попробуйте снова.' }
      }
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