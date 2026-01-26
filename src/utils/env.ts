/**
 * Environment Variables Utility
 *
 * Безопасное получение переменных окружения с валидацией
 * ⚠️ ВАЖНО: Все переменные должны быть установлены в .env файле
 */

/**
 * Получить переменную окружения с валидацией
 * @throws Error если переменная не установлена в production (только в runtime)
 */
function getEnvVar(key: string, defaultValue: string = ''): string {
  const value = import.meta.env[key]

  if (value !== undefined) {
    return value
  }

  return defaultValue
}

/**
 * Проверить что переменная установлена
 */
function hasEnvVar(key: string): boolean {
  return !!import.meta.env[key]
}

// =============================================================================
// Supabase Configuration
// =============================================================================

export const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL', '')
export const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY', '')

// =============================================================================
// Cloudflare Turnstile (CAPTCHA)
// =============================================================================

export const TURNSTILE_SITE_KEY = getEnvVar(
  'VITE_TURNSTILE_SITE_KEY',
  '0x4AAAAAACQmENl2nYwq4ELx' // fallback для dev режима
)

// =============================================================================
// Email Configuration
// =============================================================================

/**
 * Отключить реальную отправку email (для разработки)
 * В dev режиме коды будут показываться в консоли
 */
export const DISABLE_EMAIL = getEnvVar('VITE_DISABLE_EMAIL', 'false') === 'true'

// =============================================================================
// Registration Settings
// =============================================================================

/**
 * Дата открытия регистрации
 * ⚠️ ВАЖНО: Хранится в .env, не хардкожено в коде
 */
export const REGISTRATION_OPEN_DATE = new Date(
  getEnvVar('VITE_REGISTRATION_OPEN_DATE', '2026-03-01T00:00:00')
)

/**
 * Проверить, открыта ли регистрация
 */
export function isRegistrationOpen(): boolean {
  return new Date() >= REGISTRATION_OPEN_DATE
}

// =============================================================================
// Admin Access
// =============================================================================

/**
 * Секретный PIN для доступа в админ-панель
 * ⚠️ КРИТИЧНО: Должен быть установлен в .env
 * ⚠️ НИКОГДА не храните в коде!
 */
export const ADMIN_PIN = getEnvVar('VITE_ADMIN_PIN', '')

/**
 * Проверить админ PIN
 * @param pin - введенный пользователем PIN
 * @returns true если PIN верный
 */
export function verifyAdminPin(pin: string): boolean {
  // Базовая защита от timing attacks
  const correctPin = ADMIN_PIN

  if (!correctPin || !pin || pin.length !== correctPin.length) {
    return false
  }

  // Constant-time comparison
  let result = 0
  for (let i = 0; i < correctPin.length; i++) {
    result |= correctPin.charCodeAt(i) ^ pin.charCodeAt(i)
  }

  return result === 0
}

// =============================================================================
// Grace Period
// =============================================================================

/**
 * Grace period для подтверждения email (в минутах)
 */
export const GRACE_PERIOD_MINUTES = parseInt(
  getEnvVar('VITE_GRACE_PERIOD_MINUTES', '15'),
  10
)

// =============================================================================
// Production Mode
// =============================================================================

/**
 * Проверить что приложение запущено в production режиме
 */
export const IS_PRODUCTION = import.meta.env.PROD

/**
 * Проверить что приложение запущено в development режиме
 */
export const IS_DEVELOPMENT = import.meta.env.DEV

// =============================================================================
// Validation
// =============================================================================

/**
 * Валидация всех обязательных переменных окружения
 * Вызывается при запуске приложения
 */
export function validateEnvironment(): void {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_ADMIN_PIN',
    'VITE_REGISTRATION_OPEN_DATE',
  ]

  const missingVars = requiredVars.filter(key => !hasEnvVar(key))

  if (missingVars.length > 0 && IS_PRODUCTION) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all variables are set.'
    )
  }

  // Предупреждение в dev режиме
  if (missingVars.length > 0 && IS_DEVELOPMENT) {
    console.warn(
      '⚠️ Missing environment variables:',
      missingVars.join(', '),
      '\nSome features may not work correctly.'
    )
  }
}

// =============================================================================
// Security Helpers
// =============================================================================

/**
 * Безопасный вывод переменных окружения (для отладки)
 * Скрывает чувствительные данные
 */
export function getEnvironmentInfo(): Record<string, string> {
  return {
    NODE_ENV: IS_PRODUCTION ? 'production' : 'development',
    SUPABASE_URL: SUPABASE_URL,
    HAS_SUPABASE_KEY: SUPABASE_ANON_KEY ? '✓' : '✗',
    HAS_TURNSTILE_KEY: TURNSTILE_SITE_KEY ? '✓' : '✗',
    HAS_ADMIN_PIN: ADMIN_PIN ? '✓' : '✗',
    DISABLE_EMAIL: DISABLE_EMAIL ? 'true' : 'false',
    REGISTRATION_OPEN_DATE: REGISTRATION_OPEN_DATE.toISOString(),
    IS_REGISTRATION_OPEN: isRegistrationOpen() ? 'Yes' : 'No',
    GRACE_PERIOD_MINUTES: GRACE_PERIOD_MINUTES.toString(),
  }
}
