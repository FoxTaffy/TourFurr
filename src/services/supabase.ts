import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_DEVELOPMENT } from '../utils/env'
import { logger } from '../utils/logger'
import { safeStorage } from '../utils/safeStorage'

// Валидация в production
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  if (IS_DEVELOPMENT) {
    logger.warn('⚠️ Supabase credentials not found. Please check your .env file.')
  } else {
    throw new Error('CRITICAL: Supabase credentials missing in production!')
  }
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      storage: safeStorage
    }
  }
)

export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY)
