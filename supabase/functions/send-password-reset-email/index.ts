import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function buildHtml(code: string): string {
  const digits = code.split('').map(d => `
    <td style="padding:0 4px;">
      <div style="width:50px;height:62px;background:linear-gradient(180deg,#2a1608 0%,#1a0d04 100%);border:2px solid #FF6B35;border-radius:12px;box-shadow:0 0 18px rgba(255,107,53,0.25),inset 0 1px 0 rgba(255,255,255,0.06);font-size:34px;font-weight:800;color:#FFD27F;font-family:'Courier New',Courier,monospace;text-align:center;line-height:62px;text-shadow:0 0 16px rgba(255,180,71,0.6);">${d}</div>
    </td>`).join('')

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Сброс пароля — TourFurr 2026</title>
</head>
<body style="margin:0;padding:0;background:#0d0a07;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0d0a07;">
  <tr><td align="center" style="padding:40px 16px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.85),0 0 0 1px rgba(255,107,53,0.12);">
      <tr><td style="height:4px;background:linear-gradient(90deg,#c94010,#FF6B35,#FFB347,#FF6B35,#c94010);"></td></tr>
      <tr>
        <td style="background:linear-gradient(160deg,#3d1f0a 0%,#1f0e05 60%,#2a1206 100%);padding:36px 48px 28px;text-align:center;">
          <div style="font-size:44px;margin-bottom:14px;letter-spacing:4px;">🐾&thinsp;🔥&thinsp;🐾</div>
          <div style="font-size:34px;font-weight:800;color:#FFB347;margin-bottom:6px;">TourFurr 2026</div>
          <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#9a7040;">Меховой конвент · Игра Престолов</div>
          <div style="height:2px;background:linear-gradient(90deg,transparent,#FF6B3560,#FFB34780,#FF6B3560,transparent);margin-top:22px;"></div>
        </td>
      </tr>
      <tr>
        <td style="background:#140d06;padding:40px 48px 36px;">
          <div style="font-size:22px;font-weight:700;color:#F5DEB3;margin-bottom:8px;">🔐 Сброс пароля</div>
          <div style="width:40px;height:3px;background:linear-gradient(90deg,#FF6B35,#FFB347);border-radius:2px;margin-bottom:22px;"></div>
          <p style="margin:0 0 28px;color:#c0a882;font-size:15px;line-height:1.8;">
            Вы запросили сброс пароля для&nbsp;<strong style="color:#FFB347;">TourFurr 2026</strong>.<br>
            Введите код ниже для подтверждения. Действует&nbsp;<strong style="color:#FF6B35;">15&nbsp;минут</strong>.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
            <tr>
              <td style="background:linear-gradient(135deg,#1e0e04,#130b03);border:1px solid rgba(255,107,53,0.25);border-radius:18px;padding:28px 24px 22px;text-align:center;">
                <div style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#FF6B3570;margin-bottom:18px;">— КОД СБРОСА ПАРОЛЯ —</div>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 16px;"><tr>${digits}</tr></table>
                <div style="font-size:12px;color:#6a4a28;">Не передавайте код третьим лицам</div>
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 30px;">
            <tr>
              <td style="background:#0c0703;border:1px solid #2a1a08;border-left:3px solid #FF6B35;border-radius:10px;padding:16px 20px;">
                <div style="color:#c87840;font-size:13px;font-weight:700;margin-bottom:8px;">⚠ Важно</div>
                <ul style="margin:0;padding-left:16px;color:#8a6040;font-size:13px;line-height:1.9;">
                  <li>Если вы не запрашивали сброс — проигнорируйте письмо. Пароль останется прежним</li>
                  <li>Не передавайте код третьим лицам</li>
                </ul>
              </td>
            </tr>
          </table>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="border-radius:10px;background:linear-gradient(135deg,#FF6B35,#d94e1a);box-shadow:0 6px 20px rgba(255,107,53,0.4);">
                <a href="https://www.tourfurr.camp/auth/verify-reset-code" style="display:inline-block;padding:13px 34px;color:#fff;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.5px;">🔑 Сбросить пароль</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background:#0c0803;border-top:1px solid #1e1008;padding:20px 48px;text-align:center;">
          <div style="color:#5a3e22;font-size:12px;margin-bottom:6px;">С теплом, <strong style="color:#7a5530;">Команда TourFurr 2026</strong></div>
          <div style="color:#3a2510;font-size:11px;margin-bottom:8px;">Это автоматическое письмо — не отвечайте на него</div>
          <a href="https://www.tourfurr.camp" style="color:#FF6B35;font-size:12px;text-decoration:none;">tourfurr.camp</a>
        </td>
      </tr>
      <tr><td style="height:4px;background:linear-gradient(90deg,#c94010,#FF6B35,#FFB347,#FF6B35,#c94010);"></td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await req.json()
    const email = body.email?.toLowerCase().trim()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Check user exists (don't leak whether email is registered)
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) {
      console.error('listUsers error:', listError)
    }
    const userExists = users?.some(u => u.email?.toLowerCase() === email)

    // Always return success to prevent email enumeration, but only send if user exists
    if (!userExists) {
      console.log('Password reset requested for non-existent email:', email)
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generate the REAL Supabase recovery OTP
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
    })

    if (linkError || !linkData?.properties?.email_otp) {
      console.error('generateLink recovery error:', linkError)
      return new Response(JSON.stringify({ error: 'Could not generate reset code' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const code = linkData.properties.email_otp

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TourFurr 2026 <team@tourfurr.camp>',
        to: [email],
        subject: `${code} — сброс пароля TourFurr 2026`,
        html: buildHtml(code),
        text: `TourFurr 2026 — Сброс пароля\n\nВаш код: ${code}\n\nДействителен 15 минут.\n\nhttps://www.tourfurr.camp/auth/verify-reset-code`,
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend error:', resendData)
      if (resendResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Email rate limit exceeded' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Password reset email sent:', { email, messageId: resendData.id })
    return new Response(JSON.stringify({ success: true, messageId: resendData.id }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err: any) {
    console.error('Error in send-password-reset-email:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
