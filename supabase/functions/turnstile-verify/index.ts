// Supabase Edge Function для верификации Yandex SmartCaptcha
// Документация: https://yandex.cloud/ru/docs/smartcaptcha/concepts/validation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const SMARTCAPTCHA_SECRET_KEY = Deno.env.get('SMARTCAPTCHA_SECRET_KEY')
const SMARTCAPTCHA_VERIFY_URL = 'https://smartcaptcha.yandexcloud.net/validate'

interface SmartCaptchaResponse {
  status: 'ok' | 'failed'
  message?: string
  host?: string
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
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!SMARTCAPTCHA_SECRET_KEY) {
      console.error('SMARTCAPTCHA_SECRET_KEY not configured')
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { token, remoteip }: RequestBody = await req.json()

    if (!token || typeof token !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Token is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const clientIp = remoteip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')

    // Verify token with Yandex SmartCaptcha API
    const params = new URLSearchParams({
      secret: SMARTCAPTCHA_SECRET_KEY,
      token: token,
    })
    if (clientIp) {
      params.append('ip', clientIp)
    }

    const captchaResponse = await fetch(`${SMARTCAPTCHA_VERIFY_URL}?${params.toString()}`, {
      method: 'GET',
    })

    const result: SmartCaptchaResponse = await captchaResponse.json()

    const isSuccess = result.status === 'ok'

    if (!isSuccess) {
      console.warn('SmartCaptcha verification failed:', {
        message: result.message,
        ip: clientIp,
      })
    }

    return new Response(
      JSON.stringify({
        success: isSuccess,
        host: result.host,
        message: result.message,
      }),
      {
        status: isSuccess ? 200 : 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (error) {
    console.error('Error verifying SmartCaptcha:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
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
