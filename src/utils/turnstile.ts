import { SUPABASE_ANON_KEY, getEdgeFunctionUrl } from './env'

interface VerifyCaptchaResponse {
  success?: boolean
  error?: string
}

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  if (!token || !SUPABASE_ANON_KEY) {
    return false
  }

  try {
    const response = await fetch(getEdgeFunctionUrl('turnstile-verify'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ token }),
    })

    // Server/proxy error — trust the client-side reCAPTCHA token
    if (response.status >= 500) {
      console.warn('[captcha] server verification unavailable, trusting client token')
      return true
    }

    if (!response.ok) {
      return false
    }

    const data: VerifyCaptchaResponse = await response.json()
    return !!data.success
  } catch {
    // Network error — trust the client-side reCAPTCHA token
    console.warn('[captcha] server verification unreachable, trusting client token')
    return true
  }
}
