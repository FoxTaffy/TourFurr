import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Security: require an authenticated admin to call this endpoint.
    // Verify the caller's JWT and check is_admin in the users table.
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      console.error('Missing Supabase configuration')
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const authHeader = req.headers.get('Authorization') || ''
    const callerToken = authHeader.replace(/^Bearer\s+/i, '')

    // Resolve caller identity with their JWT
    const supabaseCaller = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${callerToken}` } },
      auth: { autoRefreshToken: false, persistSession: false }
    })
    const { data: { user: callerUser } } = await supabaseCaller.auth.getUser()

    if (!callerUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check is_admin using service role to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    const { data: adminCheck } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', callerUser.id)
      .maybeSingle()

    if (!adminCheck?.is_admin) {
      console.warn('send-approval-email: non-admin caller rejected')
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { email, nickname: rawNickname, status }: ApprovalEmailRequest = await req.json()

    // Validate input
    if (!email || !rawNickname || !status) {
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

    // HTML-escape nickname to prevent HTML injection in email body
    const nickname = rawNickname
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')

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
<body style="margin:0;padding:0;background-color:#0d0a07;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0a07;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.8);">

          <!-- ═══ HEADER ═══ -->
          <tr>
            <td style="background:linear-gradient(135deg,#3d1f0a 0%,#1f0e05 50%,#2a1206 100%);padding:0;">
              <div style="height:4px;background:linear-gradient(90deg,${isApproved ? '#22c55e,#86efac,#22c55e' : '#ef4444,#fca5a5,#ef4444'});"></div>
              <table width="100%" role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:36px 48px 28px;text-align:center;">
                    <div style="font-size:42px;line-height:1;margin-bottom:12px;">🐾&nbsp;🔥&nbsp;🐾</div>
                    <h1 style="margin:0 0 6px;font-size:36px;font-weight:800;letter-spacing:-0.5px;background:linear-gradient(135deg,#FFB347,#FF6B35);-webkit-background-clip:text;-webkit-text-fill-color:transparent;color:#FFB347;">TourFurr 2026</h1>
                    <p style="margin:0;color:#c8a070;font-size:14px;letter-spacing:2px;text-transform:uppercase;">Меховой конвент</p>
                  </td>
                </tr>
              </table>
              <div style="height:3px;background:linear-gradient(90deg,transparent,${isApproved ? '#22c55e40' : '#ef444440'},${isApproved ? '#86efac80' : '#fca5a580'},${isApproved ? '#22c55e40' : '#ef444440'},transparent);"></div>
            </td>
          </tr>

          <!-- ═══ STATUS BANNER ═══ -->
          <tr>
            <td style="background:${isApproved ? 'linear-gradient(135deg,#052010,#071a0f)' : 'linear-gradient(135deg,#1a0505,#120304)'};padding:32px 48px;text-align:center;border-bottom:1px solid ${isApproved ? '#0f3320' : '#2a0808'};">
              <div style="display:inline-block;font-size:64px;line-height:1;margin-bottom:12px;">${isApproved ? '🎉' : '😔'}</div>
              <h2 style="margin:8px 0 0;font-size:32px;font-weight:800;color:${isApproved ? '#4ade80' : '#f87171'};">${isApproved ? 'Заявка одобрена!' : 'Заявка отклонена'}</h2>
            </td>
          </tr>

          <!-- ═══ BODY ═══ -->
          <tr>
            <td style="background:#1a1008;padding:36px 48px;">

              <p style="margin:0 0 24px;font-size:18px;color:#F5DEB3;font-weight:600;">Здравствуйте, <span style="color:#FFB347;">${nickname}</span>!</p>

              ${isApproved ? `
              <p style="margin:0 0 28px;color:#c0a882;font-size:16px;line-height:1.7;">
                Поздравляем! Ваша заявка на участие в <strong style="color:#FFB347;">TourFurr 2026</strong> была одобрена.<br>
                Мы очень рады видеть вас среди участников нашего конвента! 🐾
              </p>

              <!-- Next steps -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#0f0a06;border:1px solid #1e3a20;border-left:4px solid #22c55e;border-radius:12px;padding:20px 24px;">
                    <p style="margin:0 0 14px;color:#4ade80;font-size:14px;font-weight:700;">📋 Следующие шаги</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr><td style="padding:5px 0;color:#a0c0a0;font-size:14px;">
                        <span style="display:inline-block;width:22px;height:22px;background:#22c55e20;border:1px solid #22c55e60;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#4ade80;margin-right:10px;">1</span>
                        Войдите в <strong style="color:#F5DEB3;">личный кабинет</strong> на сайте
                      </td></tr>
                      <tr><td style="padding:5px 0;color:#a0c0a0;font-size:14px;">
                        <span style="display:inline-block;width:22px;height:22px;background:#22c55e20;border:1px solid #22c55e60;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#4ade80;margin-right:10px;">2</span>
                        Ознакомьтесь с <strong style="color:#F5DEB3;">информацией о локации</strong>
                      </td></tr>
                      <tr><td style="padding:5px 0;color:#a0c0a0;font-size:14px;">
                        <span style="display:inline-block;width:22px;height:22px;background:#22c55e20;border:1px solid #22c55e60;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#4ade80;margin-right:10px;">3</span>
                        Произведите <strong style="color:#F5DEB3;">оплату</strong> в личном кабинете
                      </td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Important notice -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#0f0a06;border:1px solid #3a2510;border-left:4px solid #FF6B35;border-radius:12px;padding:20px 24px;">
                    <p style="margin:0 0 12px;color:#FFB347;font-size:14px;font-weight:700;">⚠️ Важно</p>
                    <ul style="margin:0;padding-left:18px;color:#a08060;font-size:14px;line-height:1.8;">
                      <li>Оплата до <strong style="color:#FFB347;">30 мая 2026</strong></li>
                      <li>Координаты локации <strong style="color:#FFB347;">конфиденциальны</strong> — не делитесь ими публично</li>
                      <li>При вопросах — пишите организаторам в Telegram</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:12px;background:linear-gradient(135deg,#22c55e,#16a34a);box-shadow:0 6px 24px rgba(34,197,94,0.3);">
                    <a href="https://www.tourfurr.camp/dashboard" style="display:inline-block;padding:14px 40px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.5px;">🎪 Перейти в личный кабинет</a>
                  </td>
                </tr>
              </table>
              ` : `
              <p style="margin:0 0 28px;color:#c0a882;font-size:16px;line-height:1.7;">
                К сожалению, ваша заявка на участие в <strong style="color:#FFB347;">TourFurr 2026</strong> в этот раз не была одобрена.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#0f0a06;border:1px solid #3a1010;border-left:4px solid #ef4444;border-radius:12px;padding:20px 24px;">
                    <p style="margin:0 0 10px;color:#f87171;font-size:14px;font-weight:700;">💬 Что можно сделать?</p>
                    <p style="margin:0;color:#a08060;font-size:14px;line-height:1.7;">
                      Если вы не согласны с решением или хотите уточнить причину отказа — напишите нашим организаторам. Мы рассмотрим ваш вопрос.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:12px;background:linear-gradient(135deg,#FF6B35,#e8541e);box-shadow:0 6px 24px rgba(255,107,53,0.3);">
                    <a href="https://www.tourfurr.camp/#contacts" style="display:inline-block;padding:14px 40px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.5px;">📬 Связаться с организаторами</a>
                  </td>
                </tr>
              </table>
              `}

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
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${isApproved ? '#22c55e,#86efac,#22c55e' : '#ef4444,#fca5a5,#ef4444'});"></td>
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
TourFurr 2026 — Заявка одобрена! 🎉

Здравствуйте, ${rawNickname}!

Поздравляем! Ваша заявка на участие одобрена.

Следующие шаги:
1. Войдите в личный кабинет: https://www.tourfurr.camp/dashboard
2. Ознакомьтесь с информацией о локации
3. Произведите оплату в личном кабинете

Важно:
- Оплата до 30 мая 2026
- Координаты локации конфиденциальны — не сообщайте их публично
- При вопросах — обращайтесь к организаторам в Telegram

──────────────────────────────
С теплом, Команда TourFurr 2026
https://www.tourfurr.camp
    ` : `
TourFurr 2026 — Решение по заявке

Здравствуйте, ${rawNickname}!

К сожалению, ваша заявка на участие в TourFurr 2026 не была одобрена.

Если вы не согласны с решением или хотите уточнить причину — напишите нашим организаторам: https://www.tourfurr.camp/#contacts

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
          error: 'Failed to send email'
        }),
        {
          status: 500,
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
        error: 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
