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

    if (!response.ok) {
      return false
    }

    const data: VerifyCaptchaResponse = await response.json()
    return !!data.success
  } catch {
    return false
  }
}
