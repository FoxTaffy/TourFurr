// @ts-nocheck
// Supabase Edge Function: удаляет НЕПОДТВЕРЖДЁННЫЙ аккаунт немедленно.
// Используется на странице подтверждения email, когда пользователь нажимает
// «Изменить почту» — аккаунт удаляется и пользователь может заново зарегистрироваться.
// Безопасность: удаляет ТОЛЬКО если email_verified = false в public.users.

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
    const { email } = body

    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'Email is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const cleanEmail = email.toLowerCase().trim()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Ищем аккаунт в public.users
    const { data: user, error: userError } = await admin
      .from('users')
      .select('id, email_verified')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (userError) {
      console.error('DB lookup error:', userError)
      return new Response(JSON.stringify({ success: false, error: 'Database error' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!user) {
      // Нет в public.users — ищем осиротевшую запись в auth.users
      const { data: authList } = await admin.auth.admin.listUsers()
      const orphan = authList?.users?.find(
        (u) => u.email?.toLowerCase() === cleanEmail && !u.email_confirmed_at
      )
      if (orphan) {
        console.log('Deleting orphaned unverified auth user:', cleanEmail)
        await admin.auth.admin.deleteUser(orphan.id)
        return new Response(JSON.stringify({ success: true, deleted: true }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      return new Response(JSON.stringify({ success: true, deleted: false }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Отказываем, если аккаунт уже подтверждён — защита от случайного удаления
    if (user.email_verified) {
      console.warn('Attempted to delete verified account via delete-unverified-account:', cleanEmail)
      return new Response(JSON.stringify({ success: false, error: 'Account is already verified' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Удаляем из auth.users через Admin API (cascade удалит public.users благодаря FK)
    console.log('Deleting unverified account:', cleanEmail)
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
    if (deleteError) {
      console.error('Error deleting auth user:', deleteError)
      // Пробуем удалить из public.users напрямую
      await admin.from('users').delete().eq('id', user.id)
    }

    return new Response(JSON.stringify({ success: true, deleted: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err: any) {
    console.error('Error in delete-unverified-account:', err)
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
