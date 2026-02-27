// Extract environment variables
const viteSupabaseUrl = import.meta.env.VITE_SUPABASE_URL
const viteSupabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const viteSmartCaptchaSiteKey = import.meta.env.VITE_SMARTCAPTCHA_SITE_KEY
const viteYandexMapsApiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY
const viteDisableEmail = import.meta.env.VITE_DISABLE_EMAIL
const viteGracePeriodMinutes = import.meta.env.VITE_GRACE_PERIOD_MINUTES
const viteProd = import.meta.env.PROD
const viteDev = import.meta.env.DEV

// Supabase Configuration
export const SUPABASE_URL: string = viteSupabaseUrl || ''
export const SUPABASE_ANON_KEY: string = viteSupabaseAnonKey || ''

// Yandex SmartCaptcha
export const SMARTCAPTCHA_SITE_KEY: string = viteSmartCaptchaSiteKey || ''

// Yandex Maps Static API
export const YANDEX_MAPS_API_KEY: string = viteYandexMapsApiKey || ''

// Email Configuration
const disableEmailValue = viteDisableEmail || 'false'
export const DISABLE_EMAIL: boolean = disableEmailValue === 'true'

// Registration Settings
export function isRegistrationOpen(): boolean {
  return true
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
  const hasCaptchaKey = SMARTCAPTCHA_SITE_KEY ? 'Yes' : 'No'
  const disableEmailStr = DISABLE_EMAIL ? 'true' : 'false'
  const gracePeriodStr2 = GRACE_PERIOD_MINUTES.toString()

  return {
    NODE_ENV: nodeEnv,
    SUPABASE_URL: SUPABASE_URL,
    HAS_SUPABASE_KEY: hasSupabaseKey,
    HAS_CAPTCHA_KEY: hasCaptchaKey,
    DISABLE_EMAIL: disableEmailStr,
    GRACE_PERIOD_MINUTES: gracePeriodStr2,
  }
}
