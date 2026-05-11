/**
 * Diagnostic tools for Edge Function debugging
 */
import { logger } from './logger'
import { getEdgeFunctionUrl } from './env'
import { supabase } from '../services/supabase'

export async function debugPasswordResetCall(email: string): Promise<void> {
  logger.log('=== 🔍 PASSWORD RESET DEBUG START ===')
  
  // 1. Check environment
  logger.log('1️⃣ Environment Check:')
  const proxyUrl = getEdgeFunctionUrl('send-password-reset-email')
  logger.log('   Proxy URL:', proxyUrl)
  logger.log('   Using local proxy:', proxyUrl.includes(window.location.origin))
  
  // 2. Check Supabase session
  logger.log('2️⃣ Supabase Session Check:')
  const { data: { session } } = await supabase.auth.getSession()
  logger.log('   Session exists:', !!session)
  logger.log('   Session user ID:', session?.user?.id || 'NO USER ID')
  logger.log('   Access token exists:', !!session?.access_token)
  logger.log('   Access token length:', session?.access_token?.length || 0)
  
  // 3. Check URL construction
  logger.log('3️⃣ URL Construction:')
  const url = getEdgeFunctionUrl('send-password-reset-email')
  logger.log('   Full URL:', url)
  logger.log('   URL is from same origin:', url.includes(window.location.origin))
  
  // 4. Test fetch with proper headers (NO authorization)
  logger.log('4️⃣ Test Fetch (without Authorization):')
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email: email.toLowerCase() })
    })
    
    logger.log('   Response Status:', response.status, response.statusText)
    logger.log('   Response Headers:')
    logger.log('     Content-Type:', response.headers.get('content-type'))
    logger.log('     Server:', response.headers.get('server'))
    
    const responseText = await response.text()
    let responseBody: any
    try {
      responseBody = JSON.parse(responseText)
      logger.log('   Response Body:', responseBody)
    } catch {
      logger.log('   Response Body (raw):', responseText)
    }
    
    if (!response.ok) {
      logger.error('   ❌ Response NOT OK (status', response.status + ')')
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
  
  logger.log('=== 🔍 PASSWORD RESET DEBUG END ===')
}

export function logPasswordResetAttempt(email: string, result: any): void {
  logger.log('📊 Password Reset Attempt Log:', {
    timestamp: new Date().toISOString(),
    email,
    success: result.success,
    error: result.error,
    statusCode: result.statusCode
  })
}
