import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_DEVELOPMENT } from '../utils/env'
import { logger } from '../utils/logger'
import { safeStorage } from '../utils/safeStorage'

// Use local proxy to bypass geographic restrictions (important for Russia)
// The proxy is served at /api by Nginx, which forwards to actual Supabase URL
const proxiedSupabaseUrl = `${window.location.origin}/api`

// Валидация в production
if (!SUPABASE_ANON_KEY) {
  if (IS_DEVELOPMENT) {
    logger.warn('⚠️ Supabase anon key not found. Please check your .env file.')
  } else {
    throw new Error('CRITICAL: Supabase anon key missing in production!')
  }
}

export const supabase = createClient(
  proxiedSupabaseUrl || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      storage: safeStorage
    }
  }
)

export const isSupabaseConfigured = !!SUPABASE_ANON_KEY
