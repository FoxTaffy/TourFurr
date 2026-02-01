// Extract environment variables
const viteSupabaseUrl = import.meta.env.VITE_SUPABASE_URL
const viteSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const viteTurnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY
const viteYandexMapsApiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY
const viteDisableEmail = import.meta.env.VITE_DISABLE_EMAIL
const viteRegistrationOpenDate = import.meta.env.VITE_REGISTRATION_OPEN_DATE
const viteAdminPin = import.meta.env.VITE_ADMIN_PIN
const viteGracePeriodMinutes = import.meta.env.VITE_GRACE_PERIOD_MINUTES
const viteProd = import.meta.env.PROD
const viteDev = import.meta.env.DEV

// Supabase Configuration
export const SUPABASE_URL: string = viteSupabaseUrl || ''
export const SUPABASE_ANON_KEY: string = viteSupabaseAnonKey || ''

// Cloudflare Turnstile
export const TURNSTILE_SITE_KEY: string = viteTurnstileSiteKey || '1x00000000000000000000AA'

// Yandex Maps Static API
export const YANDEX_MAPS_API_KEY: string = viteYandexMapsApiKey || ''

// Email Configuration
const disableEmailValue = viteDisableEmail || 'false'
export const DISABLE_EMAIL: boolean = disableEmailValue === 'true'

// Registration Settings
const registrationDateStr = viteRegistrationOpenDate || '2026-03-01T00:00:00'
export const REGISTRATION_OPEN_DATE: Date = new Date(registrationDateStr)

export function isRegistrationOpen(): boolean {
  return new Date() >= REGISTRATION_OPEN_DATE
}

// Admin Access
export const ADMIN_PIN: string = viteAdminPin || ''

export function verifyAdminPin(pin: string): boolean {
  const correctPin = ADMIN_PIN
  if (!correctPin || !pin || pin.length !== correctPin.length) {
    return false
  }
  let result = 0
  for (let i = 0; i < correctPin.length; i++) {
    result |= correctPin.charCodeAt(i) ^ pin.charCodeAt(i)
  }
  return result === 0
}

// Grace Period
const gracePeriodStr = viteGracePeriodMinutes || '15'
export const GRACE_PERIOD_MINUTES: number = parseInt(gracePeriodStr, 10)

// Production Mode
export const IS_PRODUCTION: boolean = viteProd || false
export const IS_DEVELOPMENT: boolean = viteDev || false

// Validation
export function validateEnvironment(): void {
  const missing: string[] = []
  if (!viteSupabaseUrl) missing.push('VITE_SUPABASE_URL')
  if (!viteSupabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY')
  if (!viteAdminPin) missing.push('VITE_ADMIN_PIN')
  if (!viteRegistrationOpenDate) missing.push('VITE_REGISTRATION_OPEN_DATE')

  if (missing.length > 0 && IS_PRODUCTION) {
    const errorMsg = 'Missing required environment variables: ' + missing.join(', ')
    throw new Error(errorMsg)
  }

  if (missing.length > 0 && IS_DEVELOPMENT) {
    const warnMsg = 'Missing environment variables: ' + missing.join(', ')
    console.warn(warnMsg)
  }
}

// Security Helpers
export function getEnvironmentInfo(): Record<string, string> {
  const nodeEnv = IS_PRODUCTION ? 'production' : 'development'
  const hasSupabaseKey = SUPABASE_ANON_KEY ? 'Yes' : 'No'
  const hasTurnstileKey = TURNSTILE_SITE_KEY ? 'Yes' : 'No'
  const hasAdminPin = ADMIN_PIN ? 'Yes' : 'No'
  const disableEmailStr = DISABLE_EMAIL ? 'true' : 'false'
  const regDateStr = REGISTRATION_OPEN_DATE.toISOString()
  const isRegOpen = isRegistrationOpen() ? 'Yes' : 'No'
  const gracePeriodStr2 = GRACE_PERIOD_MINUTES.toString()

  return {
    NODE_ENV: nodeEnv,
    SUPABASE_URL: SUPABASE_URL,
    HAS_SUPABASE_KEY: hasSupabaseKey,
    HAS_TURNSTILE_KEY: hasTurnstileKey,
    HAS_ADMIN_PIN: hasAdminPin,
    DISABLE_EMAIL: disableEmailStr,
    REGISTRATION_OPEN_DATE: regDateStr,
    IS_REGISTRATION_OPEN: isRegOpen,
    GRACE_PERIOD_MINUTES: gracePeriodStr2,
  }
}
