/**
 * Diagnostic tools for Edge Function debugging
 */
import { logger } from './logger'
import { SUPABASE_URL } from './env'
import { supabase } from '../services/supabase'

export async function debugPasswordResetCall(email: string): Promise<void> {
  logger.log('=== 🔍 PASSWORD RESET DEBUG START ===')
  
  // 1. Check environment
  logger.log('1️⃣ Environment Check:')
  logger.log('   SUPABASE_URL:', SUPABASE_URL)
  logger.log('   SUPABASE_URL is truthy:', !!SUPABASE_URL)
  
  // 2. Check Supabase session
  logger.log('2️⃣ Supabase Session Check:')
  const session = supabase.auth.session
  logger.log('   Session exists:', !!session)
  logger.log('   Session user ID:', session?.user?.id || 'NO USER ID')
  logger.log('   Access token exists:', !!session?.access_token)
  logger.log('   Access token length:', session?.access_token?.length || 0)
  
  // 3. Check URL construction
  logger.log('3️⃣ URL Construction:')
  const url = `${SUPABASE_URL}/functions/v1/send-password-reset-email`
  logger.log('   Full URL:', url)
  logger.log('   URL valid:', /^https?:\/\//.test(url))
  
  // 4. Test fetch with proper headers
  logger.log('4️⃣ Test Fetch:')
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email: email.toLowerCase() })
    })
    
    logger.log('   Response Status:', response.status, response.statusText)
    logger.log('   Response Headers:')
    logger.log('     Content-Type:', response.headers.get('content-type'))
    logger.log('     Server:', response.headers.get('server'))
    
    let responseBody: any
    try {
      responseBody = await response.json()
      logger.log('   Response Body:', responseBody)
    } catch (parseErr) {
      logger.log('   Response Body (raw):', await response.text())
    }
    
    if (!response.ok) {
      logger.error('   ❌ Response NOT OK')
      logger.log('   Full response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseBody
      })
    } else {
      logger.log('   ✅ Response OK')
    }
  } catch (fetchErr: any) {
    logger.error('   ❌ Fetch Error:', {
      name: fetchErr.name,
      message: fetchErr.message,
      cause: fetchErr.cause
    })
  }
  
  logger.log('=== 🔍 PASSWORD RESET DEBUG END ===\n')
}

export function logPasswordResetAttempt(email: string, result: any): void {\n  logger.log('📊 Password Reset Attempt Log:', {\n    timestamp: new Date().toISOString(),\n    email,\n    success: result.success,\n    error: result.error,\n    statusCode: result.statusCode\n  })\n}
