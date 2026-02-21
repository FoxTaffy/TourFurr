import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_DEVELOPMENT } from '../utils/env'
import { logger } from '../utils/logger'

// Валидация в production
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  if (IS_DEVELOPMENT) {
    logger.warn('⚠️ Supabase credentials not found. Please check your .env file.')
  } else {
    throw new Error('CRITICAL: Supabase credentials missing in production!')
  }
}

// Custom fetch with a 15-second timeout so that network hangs (ERR_CONNECTION_TIMED_OUT)
// fail fast instead of blocking for the browser's default timeout.
const fetchWithTimeout: typeof fetch = (url, options = {}) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timeoutId)
  )
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    },
    global: {
      fetch: fetchWithTimeout
    }
  }
)

export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY)
