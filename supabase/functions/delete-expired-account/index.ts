// Supabase Edge Function для удаления истёкшего неподтверждённого аккаунта
// Вызывается при повторной регистрации с тем же email,
// чтобы очистить старый аккаунт до вызова signUp

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GRACE_PERIOD_MINUTES = 15

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Email is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
      )
    }

    const cleanEmail = email.toLowerCase().trim()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Проверяем, есть ли неподтверждённый аккаунт с истёкшим grace period
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, created_at, email_verified')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (userError || !user) {
      // Аккаунта нет — очистка не нужна
      return new Response(
        JSON.stringify({ success: true, cleaned: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      )
    }

    // Аккаунт уже подтверждён — не трогаем
    if (user.email_verified) {
      return new Response(
        JSON.stringify({ success: true, cleaned: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      )
    }

    // Проверяем, истёк ли grace period
    const createdAt = new Date(user.created_at)
    const deletionTime = new Date(createdAt.getTime() + GRACE_PERIOD_MINUTES * 60 * 1000)
    const now = new Date()

    if (now < deletionTime) {
      // Grace period ещё не истёк
      return new Response(
        JSON.stringify({ success: true, cleaned: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      )
    }

    // Grace period истёк — удаляем аккаунт
    console.log(`Cleaning up expired unverified account: ${cleanEmail} (created: ${user.created_at})`)

    // 1. Удаляем из auth.users через Admin API (это самый надёжный способ)
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError)
      // Продолжаем удаление из public-таблиц даже при ошибке
    }

    // 2. Удаляем из public.users
    const { error: deleteUserError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', user.id)
    if (deleteUserError) {
      console.error('Error deleting public user:', deleteUserError)
    }

    // 3. Удаляем коды подтверждения
    await supabaseAdmin
      .from('email_verification_codes')
      .delete()
      .eq('email', cleanEmail)

    console.log(`Successfully cleaned up expired account: ${cleanEmail}`)

    return new Response(
      JSON.stringify({ success: true, cleaned: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (error) {
    console.error('Unexpected error in delete-expired-account:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})
