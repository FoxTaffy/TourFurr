import { supabase } from '../services/supabase'
import { logger } from './logger'
import { GRACE_PERIOD_MINUTES } from './env'

/**
 * Результат проверки grace period
 */
export interface GracePeriodStatus {
  isExpired: boolean
  minutesRemaining: number | null
  secondsRemaining: number | null
  willBeDeletedAt: Date | null
  exists: boolean
}

/**
 * Проверяет статус grace period для пользователя
 * Использует SECURITY DEFINER RPC — доступна без аутентификации.
 * Прямые SELECT от анонимного пользователя блокируются RLS.
 * @param email Email пользователя
 * @returns Статус grace period
 */
export async function checkGracePeriodStatus(email: string): Promise<GracePeriodStatus> {
  try {
    // Используем SECURITY DEFINER RPC, которая обходит RLS и работает без авторизации
    const { data, error } = await supabase
      .rpc('get_grace_period_status', { p_email: email.toLowerCase() })

    // Пользователь не найден (RPC вернула пустой массив)
    if (error || !data || (Array.isArray(data) && data.length === 0)) {
      return {
        isExpired: true,
        minutesRemaining: null,
        secondsRemaining: null,
        willBeDeletedAt: null,
        exists: false
      }
    }

    const row = Array.isArray(data) ? data[0] : data

    // Пользователь уже подтверждён
    if (row.is_verified) {
      return {
        isExpired: false,
        minutesRemaining: null,
        secondsRemaining: null,
        willBeDeletedAt: null,
        exists: true
      }
    }

    // Вычислить оставшееся время
    const createdAt = new Date(row.created_at_ts)
    const deletionTime = new Date(createdAt.getTime() + GRACE_PERIOD_MINUTES * 60 * 1000)
    const now = new Date()
    const remainingMs = deletionTime.getTime() - now.getTime()
    const remainingSeconds = Math.floor(remainingMs / 1000)
    const remainingMinutes = Math.floor(remainingSeconds / 60)

    if (remainingMs <= 0) {
      return {
        isExpired: true,
        minutesRemaining: 0,
        secondsRemaining: 0,
        willBeDeletedAt: deletionTime,
        exists: true
      }
    }

    return {
      isExpired: false,
      minutesRemaining: remainingMinutes,
      secondsRemaining: remainingSeconds,
      willBeDeletedAt: deletionTime,
      exists: true
    }
  } catch (err) {
    logger.error('Error checking grace period:', err)
    return {
      isExpired: true,
      minutesRemaining: null,
      secondsRemaining: null,
      willBeDeletedAt: null,
      exists: false
    }
  }
}

/**
 * Форматирует оставшееся время в читаемый вид
 * @param seconds Количество секунд
 * @returns Форматированная строка (например, "14:23")
 */
export function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) return '00:00'

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60

  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Проверяет, является ли пользователь неподтвержденным
 * @param email Email пользователя
 * @returns true если пользователь существует но не подтвержден
 */
export async function isUnverifiedUser(email: string): Promise<boolean> {
  try {
    // Используем RPC для обхода RLS
    const { data, error } = await supabase
      .rpc('get_grace_period_status', { p_email: email.toLowerCase() })
    if (error || !data || (Array.isArray(data) && data.length === 0)) return false
    const row = Array.isArray(data) ? data[0] : data
    return row.user_exists && !row.is_verified
  } catch {
    return false
  }
}

/**
 * Получает время создания аккаунта пользователя
 * @param email Email пользователя
 * @returns Дата создания или null
 */
export async function getUserCreatedAt(email: string): Promise<Date | null> {
  try {
    // Используем RPC для обхода RLS
    const { data, error } = await supabase
      .rpc('get_grace_period_status', { p_email: email.toLowerCase() })
    if (error || !data || (Array.isArray(data) && data.length === 0)) return null
    const row = Array.isArray(data) ? data[0] : data
    return row.created_at_ts ? new Date(row.created_at_ts) : null
  } catch {
    return null
  }
}
