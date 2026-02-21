import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApprovalEmailRequest {
  email: string
  nickname: string
  status: 'approved' | 'rejected'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, nickname, status }: ApprovalEmailRequest = await req.json()

    // Validate input
    if (!email || !nickname || !status) {
      return new Response(
        JSON.stringify({ error: 'Email, nickname and status are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate status
    if (status !== 'approved' && status !== 'rejected') {
      return new Response(
        JSON.stringify({ error: 'Invalid status. Must be approved or rejected' }),
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

    // Email content based on status
    const isApproved = status === 'approved'
    const subject = isApproved
      ? '🎉 Ваша заявка одобрена - TourFurr 2026'
      : '❌ Ваша заявка отклонена - TourFurr 2026'

    // HTML Email Template
    const htmlContent = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
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
              <div style="text-align: center; padding: 30px; background: ${isApproved ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border: 2px solid ${isApproved ? '#22c55e' : '#ef4444'}; border-radius: 12px; margin-bottom: 30px;">
                <div style="font-size: 64px; margin-bottom: 10px;">
                  ${isApproved ? '🎉' : '😔'}
                </div>
                <h2 style="margin: 0; color: ${isApproved ? '#22c55e' : '#ef4444'}; font-size: 28px; font-weight: 700;">
                  ${isApproved ? 'Заявка одобрена!' : 'Заявка отклонена'}
                </h2>
              </div>

              <p style="margin: 0 0 20px; color: #F5DEB3; font-size: 18px; font-weight: 600;">
                Здравствуйте, ${nickname}!
              </p>

              ${isApproved ? `
              <p style="margin: 0 0 30px; color: #C8B896; font-size: 16px; line-height: 1.6;">
                Поздравляем! Ваша заявка на участие в TourFurr 2026 была одобрена. Мы рады видеть вас на нашем мероприятии!
              </p>

              <div style="padding: 20px; background: rgba(59, 130, 246, 0.1); border-left: 4px solid #60a5fa; border-radius: 8px; margin: 0 0 30px;">
                <p style="margin: 0 0 15px; color: #93c5fd; font-size: 14px; font-weight: 600;">
                  📋 Следующие шаги:
                </p>
                <ol style="margin: 0; padding-left: 20px; color: #C8B896; font-size: 14px; line-height: 1.8;">
                  <li>Зайдите в <strong style="color: #FFB347;">личный кабинет</strong> на сайте</li>
                  <li>Ознакомьтесь с <strong style="color: #FFB347;">информацией о локации</strong></li>
                  <li>Выполните <strong style="color: #FFB347;">оплату</strong> онлайн в личном кабинете</li>
                  <li>Отправьте <strong style="color: #FFB347;">чек об оплате</strong> организаторам (при необходимости)</li>
                </ol>
              </div>

              <div style="text-align: center; padding: 20px 0;">
                <a href="https://www.tourfurr.camp/dashboard" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #FF6B35, #FFB347); color: #1a1410; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);">
                  Перейти в личный кабинет
                </a>
              </div>

              <div style="padding: 20px; background: rgba(255, 107, 53, 0.1); border-left: 4px solid #FF6B35; border-radius: 8px; margin: 30px 0 0;">
                <p style="margin: 0 0 10px; color: #FFB347; font-size: 14px; font-weight: 600;">
                  ⚠️ Важно:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #C8B896; font-size: 14px; line-height: 1.6;">
                  <li>Оплата должна быть произведена до <strong style="color: #FFB347;">30 мая 2026</strong></li>
                  <li>Координаты локации <strong style="color: #FFB347;">конфиденциальны</strong> - не делитесь ими публично</li>
                  <li>При возникновении вопросов свяжитесь с организаторами в Telegram</li>
                </ul>
              </div>
              ` : `
              <p style="margin: 0 0 30px; color: #C8B896; font-size: 16px; line-height: 1.6;">
                К сожалению, Вам отказано в участии.
              </p>

              <div style="padding: 20px; background: rgba(59, 130, 246, 0.1); border-left: 4px solid #60a5fa; border-radius: 8px; margin: 0 0 30px;">
                <p style="margin: 0; color: #C8B896; font-size: 14px; line-height: 1.6;">
                  Если вы не согласны с решением, пожалуйста, напишите одному из организаторов в контактах на сайте.
                </p>
              </div>

              <div style="text-align: center; padding: 20px 0;">
                <a href="https://www.tourfurr.camp/#contacts" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #FF6B35, #FFB347); color: #1a1410; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);">
                  Перейти к контактам
                </a>
              </div>
              `}
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
    const textContent = isApproved ? `
TourFurr 2026 - Заявка одобрена!

Здравствуйте, ${nickname}!

Поздравляем! Ваша заявка на участие в TourFurr 2026 была одобрена.

Следующие шаги:
1. Зайдите в личный кабинет на сайте: https://www.tourfurr.camp/dashboard
2. Ознакомьтесь с информацией о локации
3. Выполните оплату онлайн в личном кабинете
4. Подтверждение оплаты сохраняется автоматически

ВАЖНО:
- Оплата до 30 мая 2026
- Координаты локации конфиденциальны
- При вопросах свяжитесь с организаторами

С уважением,
Команда TourFurr 2026
    ` : `
TourFurr 2026 - Заявка отклонена

Здравствуйте, ${nickname}!

К сожалению, Вам отказано в участии.

Если вы не согласны с решением, пожалуйста, напишите одному из организаторов в контактах на сайте: https://www.tourfurr.camp/#contacts

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
        from: 'TourFurr 2026 <noreply@tourfurr.camp>',
        to: [email],
        subject,
        html: htmlContent,
        text: textContent,
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData)
      return new Response(
        JSON.stringify({
          error: 'Failed to send email',
          details: resendData
        }),
        {
          status: resendResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Approval email sent successfully:', { email, status, messageId: resendData.id })

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
    console.error('Error in send-approval-email function:', error)

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
