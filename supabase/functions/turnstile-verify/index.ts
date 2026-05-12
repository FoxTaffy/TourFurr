
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RECAPTCHA_SECRET_KEY = Deno.env.get('RECAPTCHA_SECRET_KEY')
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'

const defaultAllowedHeaders = 'authorization, x-client-info, apikey, content-type'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': defaultAllowedHeaders,
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin, Access-Control-Request-Headers',
}

function resolveRequestedHeaders(requestedHeaders: string | null): string {
  if (!requestedHeaders || !requestedHeaders.trim()) {
    return defaultAllowedHeaders
  }
  return requestedHeaders
}

interface RecaptchaResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
}

interface RequestBody {
  token: string
  remoteip?: string
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    const requestedHeaders = req.headers.get('access-control-request-headers')
    return new Response('ok', {
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Headers': resolveRequestedHeaders(requestedHeaders),
      },
    })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!RECAPTCHA_SECRET_KEY) {
      console.error('RECAPTCHA_SECRET_KEY not configured')
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { token, remoteip }: RequestBody = await req.json()

    if (!token || typeof token !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const clientIp = remoteip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')

    // Verify token with Google reCAPTCHA API
    const params = new URLSearchParams({
      secret: RECAPTCHA_SECRET_KEY,
      response: token,
    })
    if (clientIp) {
      params.append('remoteip', clientIp)
    }

    const captchaResponse = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const result: RecaptchaResponse = await captchaResponse.json()

    const isSuccess = result.success === true

    if (!isSuccess) {
      console.warn('reCAPTCHA verification failed:', {
        errorCodes: result['error-codes'],
        ip: clientIp,
      })
    }

    return new Response(
      JSON.stringify({
        success: isSuccess,
        hostname: result.hostname,
        challenge_ts: result.challenge_ts,
      }),
      {
        status: isSuccess ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
