import { supabase } from '../services/supabase'

/**
 * Grace period для подтверждения email (в минутах)
 */
export const GRACE_PERIOD_MINUTES = 15

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
 * @param email Email пользователя
 * @returns Статус grace period
 */
export async function checkGracePeriodStatus(email: string): Promise<GracePeriodStatus> {
  try {
    // Получить информацию о пользователе
    const { data: user, error } = await supabase
      .from('users')
      .select('created_at, email_verified')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    // Пользователь не найден
    if (error || !user) {
      return {
        isExpired: true,
        minutesRemaining: null,
        secondsRemaining: null,
        willBeDeletedAt: null,
        exists: false
      }
    }

    // Пользователь уже подтвержден
    if (user.email_verified) {
      return {
        isExpired: false,
        minutesRemaining: null,
        secondsRemaining: null,
        willBeDeletedAt: null,
        exists: true
      }
    }

    // Вычислить оставшееся время
    const createdAt = new Date(user.created_at)
    const deletionTime = new Date(createdAt.getTime() + GRACE_PERIOD_MINUTES * 60 * 1000)
    const now = new Date()
    const remainingMs = deletionTime.getTime() - now.getTime()
    const remainingSeconds = Math.floor(remainingMs / 1000)
    const remainingMinutes = Math.floor(remainingSeconds / 60)

    if (remainingMs <= 0) {
      // Время истекло
      return {
        isExpired: true,
        minutesRemaining: 0,
        secondsRemaining: 0,
        willBeDeletedAt: deletionTime,
        exists: true
      }
    }

    // Время еще есть
    return {
      isExpired: false,
      minutesRemaining: remainingMinutes,
      secondsRemaining: remainingSeconds,
      willBeDeletedAt: deletionTime,
      exists: true
    }
  } catch (err) {
    console.error('Error checking grace period:', err)
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
    const { data: user } = await supabase
      .from('users')
      .select('email_verified')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    return !!user && !user.email_verified
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
    const { data: user } = await supabase
      .from('users')
      .select('created_at')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    return user ? new Date(user.created_at) : null
  } catch {
    return null
  }
}
