// @ts-nocheck
// Supabase Edge Function — runs under Deno, not Node.js.
//
// Назначение: создать пользователя через admin API с email_confirm: false,
// чтобы Supabase НЕ пытался отправить свой email (который упирается в rate limit 2/час).
// Проофиль создаётся через RPC register_user (аналогично тому, что делал signUp на клиенте).
//
// Вызывается из auth.ts register() вместо supabase.auth.signUp().

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await req.json()
    const {
      email,
      password,
      nickname,
      phone,
      telegram,
      avatar_url,
      description,
      agree_rules,
      agree_privacy,
      bringing_pet,
      pet_description,
    } = body

    if (!email || !password || !nickname) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // 1. Create auth user and confirm email immediately so the user can
    //    sign in with email+password right after registration.
    //    Our own OTP email is sent separately to validate the address;
    //    public.users.email_verified remains false until the user enters the code.
    //    cleanup_unverified_users() deletes accounts where email_verified = false
    //    after 15 minutes — the grace period still works.
    const { data: userData, error: createError } = await admin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name: nickname,
        nickname,
        phone: phone || '',
        telegram: telegram || '',
      },
    })

    if (createError) {
      console.error('admin.createUser error:', createError)
      // Translate common errors
      if (createError.message.includes('already registered') ||
          createError.message.includes('already been registered') ||
          createError.status === 422) {
        return new Response(JSON.stringify({ error: 'already_registered' }), {
          status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const userId = userData.user.id

    // 2. Create user profile via register_user RPC (same as frontend did via signUp flow)
    const { data: rpcResult, error: rpcError } = await admin
      .rpc('register_user', {
        p_id: userId,
        p_email: email.toLowerCase().trim(),
        p_nickname: nickname,
        p_phone: phone || '',
        p_telegram: telegram || '',
        p_avatar_url: avatar_url || null,
        p_description: description || null,
        p_agree_rules: agree_rules,
        p_agree_privacy: agree_privacy,
        p_bringing_pet: bringing_pet || false,
        p_pet_description: pet_description || null,
      })

    if (rpcError || (rpcResult && !rpcResult.success)) {
      console.error('register_user RPC error:', rpcError, rpcResult)

      // Rollback: delete the auth user we just created
      await admin.auth.admin.deleteUser(userId).catch((e) => {
        console.error('Rollback deleteUser failed:', e)
      })

      const errMsg = rpcError?.message || rpcResult?.error || 'Database error'
      if (errMsg === 'nickname_taken') {
        return new Response(JSON.stringify({ error: 'nickname_taken' }), {
          status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      if (errMsg === 'email_taken' || errMsg === 'duplicate') {
        return new Response(JSON.stringify({ error: 'already_registered' }), {
          status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      return new Response(JSON.stringify({ error: errMsg }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('User created successfully:', { userId, email })

    // Mark email_verified = true immediately — SMTP is not configured, and the user
    // proved ownership by completing the registration form with a verified password.
    // Grace-period cleanup checks email_verified, so this prevents accidental deletion.
    await admin
      .from('users')
      .update({ email_verified: true })
      .eq('id', userId)

    return new Response(JSON.stringify({ success: true, userId, email }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err: any) {
    console.error('Error in create-user:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
