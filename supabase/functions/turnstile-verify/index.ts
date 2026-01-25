// Supabase Edge Function для верификации Cloudflare Turnstile
// Документация: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TURNSTILE_SECRET_KEY = Deno.env.get('TURNSTILE_SECRET_KEY')
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

interface TurnstileResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
  action?: string
  cdata?: string
}

interface RequestBody {
  token: string
  remoteip?: string
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    // Security: Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Security: Check if secret key is configured
    if (!TURNSTILE_SECRET_KEY) {
      console.error('TURNSTILE_SECRET_KEY not configured')
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const { token, remoteip }: RequestBody = await req.json()

    // Security: Validate token presence
    if (!token || typeof token !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Token is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Get client IP from headers
    const clientIp = remoteip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')

    // Prepare form data for Turnstile API
    const formData = new FormData()
    formData.append('secret', TURNSTILE_SECRET_KEY)
    formData.append('response', token)
    if (clientIp) {
      formData.append('remoteip', clientIp)
    }

    // Verify token with Cloudflare Turnstile API
    const turnstileResponse = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: formData,
    })

    const result: TurnstileResponse = await turnstileResponse.json()

    // Log result (for debugging)
    console.log('Turnstile verification result:', {
      success: result.success,
      errors: result['error-codes'],
      timestamp: result.challenge_ts,
      hostname: result.hostname,
    })

    // Security: Log verification attempts (optional - можно сохранять в БД для анализа)
    if (!result.success) {
      console.warn('Turnstile verification failed:', {
        errors: result['error-codes'],
        ip: clientIp,
      })
    }

    // Return result
    return new Response(
      JSON.stringify({
        success: result.success,
        'error-codes': result['error-codes'],
        challenge_ts: result.challenge_ts,
        hostname: result.hostname,
      }),
      {
        status: result.success ? 200 : 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Error verifying Turnstile:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
