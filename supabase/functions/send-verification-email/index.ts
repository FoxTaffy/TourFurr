import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  email: string
  code: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, code }: EmailRequest = await req.json()

    // Validate input
    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email and code are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return new Response(
        JSON.stringify({ error: 'Invalid code format' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // HTML Email Template
    const htmlContent = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Код подтверждения TourFurr</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0806;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #2a1f1a 0%, #1a1410 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, rgba(255, 107, 53, 0.15), rgba(255, 179, 71, 0.1));">
              <h1 style="margin: 0; color: #FFB347; font-size: 32px; font-weight: 700; text-shadow: 0 2px 10px rgba(255, 107, 53, 0.3);">
                🎭 TourFurr 2026
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #F5DEB3; font-size: 24px; font-weight: 600;">
                Подтверждение регистрации
              </h2>

              <p style="margin: 0 0 30px; color: #C8B896; font-size: 16px; line-height: 1.6;">
                Здравствуйте! Вы зарегистрировались на TourFurr 2026. Для завершения регистрации введите код подтверждения на сайте:
              </p>

              <!-- Code Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px;">
                <tr>
                  <td align="center" style="padding: 30px; background: rgba(255, 107, 53, 0.1); border: 2px solid #FF6B35; border-radius: 12px;">
                    <div style="font-size: 48px; font-weight: 700; letter-spacing: 8px; color: #FFB347; font-family: 'Courier New', monospace; text-shadow: 0 2px 10px rgba(255, 107, 53, 0.5);">
                      ${code}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Important Info -->
              <div style="padding: 20px; background: rgba(59, 130, 246, 0.1); border-left: 4px solid #60a5fa; border-radius: 8px; margin: 0 0 30px;">
                <p style="margin: 0 0 10px; color: #93c5fd; font-size: 14px; font-weight: 600;">
                  ⏰ Важно:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #C8B896; font-size: 14px; line-height: 1.6;">
                  <li>Код действителен <strong style="color: #FFB347;">15 минут</strong></li>
                  <li>После истечения времени аккаунт будет автоматически удален</li>
                  <li>Никому не сообщайте этот код</li>
                </ul>
              </div>

              <p style="margin: 0 0 10px; color: #C8B896; font-size: 14px; line-height: 1.6;">
                Если вы не регистрировались на TourFurr, просто проигнорируйте это письмо.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background: rgba(26, 20, 16, 0.5); border-top: 1px solid rgba(139, 111, 71, 0.3);">
              <p style="margin: 0 0 10px; color: #8B6F47; font-size: 12px; line-height: 1.5; text-align: center;">
                С уважением,<br>
                Команда TourFurr 2026
              </p>
              <p style="margin: 0; color: #8B6F47; font-size: 11px; text-align: center;">
                Это автоматическое письмо, пожалуйста, не отвечайте на него.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    // Plain text version
    const textContent = `
TourFurr 2026 - Подтверждение регистрации

Ваш код подтверждения: ${code}

Код действителен 15 минут.
После истечения времени аккаунт будет автоматически удален.

Никому не сообщайте этот код.

Если вы не регистрировались на TourFurr, просто проигнорируйте это письмо.

---
С уважением,
Команда TourFurr 2026
    `

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TourFurr 2026 <team@tourfurr.camp>', 
        to: [email],
        subject: `Код подтверждения TourFurr: ${code}`,
        html: htmlContent,
        text: textContent,
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData)

      // Check for rate limit
      if (resendResponse.status === 429 || resendData.message?.includes('rate limit')) {
        return new Response(
          JSON.stringify({
            error: 'Email rate limit exceeded',
            message: 'Too many emails sent. Please wait and try again later.'
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      return new Response(
        JSON.stringify({
          error: 'Failed to send email'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Email sent successfully:', { email, messageId: resendData.id })

    return new Response(
      JSON.stringify({
        success: true,
        messageId: resendData.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('Error in send-verification-email function:', error)

    return new Response(
      JSON.stringify({
        error: 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
