import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
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
  <title>Код подтверждения — TourFurr 2026</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0a07;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0a07;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.8);">

          <!-- ═══ HEADER ═══ -->
          <tr>
            <td style="background:linear-gradient(135deg,#3d1f0a 0%,#1f0e05 50%,#2a1206 100%);padding:0;">
              <!-- Top accent bar -->
              <div style="height:4px;background:linear-gradient(90deg,#FF6B35,#FFB347,#FF6B35);"></div>
              <table width="100%" role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:36px 48px 28px;text-align:center;">
                    <!-- Paw & fire logo row -->
                    <div style="font-size:42px;line-height:1;margin-bottom:12px;">🐾&nbsp;🔥&nbsp;🐾</div>
                    <h1 style="margin:0 0 6px;font-size:36px;font-weight:800;letter-spacing:-0.5px;background:linear-gradient(135deg,#FFB347,#FF6B35);-webkit-background-clip:text;-webkit-text-fill-color:transparent;color:#FFB347;">TourFurr 2026</h1>
                    <p style="margin:0;color:#c8a070;font-size:14px;letter-spacing:2px;text-transform:uppercase;">Меховой конвент</p>
                  </td>
                </tr>
              </table>
              <!-- Wave divider -->
              <div style="height:3px;background:linear-gradient(90deg,transparent,#FF6B3540,#FFB34780,#FF6B3540,transparent);"></div>
            </td>
          </tr>

          <!-- ═══ BODY ═══ -->
          <tr>
            <td style="background:#1a1008;padding:40px 48px 36px;">

              <!-- Title -->
              <h2 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#F5DEB3;">Подтверждение регистрации</h2>
              <div style="width:48px;height:3px;background:linear-gradient(90deg,#FF6B35,#FFB347);border-radius:2px;margin-bottom:24px;"></div>

              <p style="margin:0 0 28px;color:#c0a882;font-size:16px;line-height:1.7;">
                Привет! Вы зарегистрировались на <strong style="color:#FFB347;">TourFurr 2026</strong>.<br>
                Введите код ниже на сайте, чтобы активировать аккаунт:
              </p>

              <!-- ── Code block ── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:linear-gradient(135deg,#2c1505,#1f0e03);border:2px solid #FF6B35;border-radius:16px;padding:32px 24px;text-align:center;box-shadow:0 0 40px rgba(255,107,53,0.15) inset;">
                    <p style="margin:0 0 10px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#FF6B3590;">КОД ПОДТВЕРЖДЕНИЯ</p>
                    <div style="font-size:52px;font-weight:800;letter-spacing:12px;color:#FFB347;font-family:'Courier New',Courier,monospace;text-shadow:0 0 30px rgba(255,179,71,0.4);">${code}</div>
                    <p style="margin:12px 0 0;font-size:13px;color:#8B6F47;">Действителен&nbsp;<strong style="color:#FF6B35;">15 минут</strong></p>
                  </td>
                </tr>
              </table>

              <!-- ── Info block ── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#0f0a06;border:1px solid #3a2510;border-left:4px solid #FF6B35;border-radius:12px;padding:20px 24px;">
                    <p style="margin:0 0 12px;color:#FFB347;font-size:14px;font-weight:700;">⚠️ Важно</p>
                    <ul style="margin:0;padding-left:18px;color:#a08060;font-size:14px;line-height:1.8;">
                      <li>Не передавайте код третьим лицам</li>
                      <li>Если вы не регистрировались — просто проигнорируйте письмо</li>
                      <li>По истечении 15 минут аккаунт будет автоматически удалён</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- ── CTA button ── -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:12px;background:linear-gradient(135deg,#FF6B35,#e8541e);box-shadow:0 6px 24px rgba(255,107,53,0.35);">
                    <a href="https://www.tourfurr.camp/auth/verify-email" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.5px;">🐾 Перейти к подтверждению</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ═══ FOOTER ═══ -->
          <tr>
            <td style="background:#0f0a06;border-top:1px solid #2a1a0a;padding:24px 48px;">
              <table width="100%" role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0 0 6px;color:#6b4f2f;font-size:13px;">С теплом,&nbsp;<strong style="color:#8B6F47;">Команда TourFurr 2026</strong></p>
                    <p style="margin:0 0 12px;color:#4a3520;font-size:11px;">Это автоматическое письмо — пожалуйста, не отвечайте на него.</p>
                    <a href="https://www.tourfurr.camp" style="color:#FF6B35;font-size:12px;text-decoration:none;">tourfurr.camp</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Bottom accent bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#FF6B35,#FFB347,#FF6B35);"></td>
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
TourFurr 2026 — Подтверждение регистрации 🐾

Ваш код подтверждения: ${code}

Код действителен 15 минут.
После истечения времени аккаунт будет автоматически удалён.
Никому не сообщайте этот код.

Если вы не регистрировались на TourFurr — просто проигнорируйте это письмо.

──────────────────────────────
С теплом, Команда TourFurr 2026
https://www.tourfurr.camp
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
        subject: 'Код подтверждения TourFurr 2026',
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
