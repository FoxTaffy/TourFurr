// Supabase Edge Function для очистки неподтвержденных аккаунтов
// Запускается периодически для удаления пользователей, не подтвердивших email в течение 15 минут

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CleanupResult {
  deleted_count: number
  deleted_emails: string[]
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Security: only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 },
    )
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const cleanupSecret = Deno.env.get('CLEANUP_SECRET')

    // Security: require a shared secret to prevent unauthorized invocations.
    // Set CLEANUP_SECRET as a Supabase Edge Function secret and pass it in the
    // Authorization header as "Bearer <secret>" from the cron job.
    if (cleanupSecret) {
      const authHeader = req.headers.get('Authorization') || ''
      const providedSecret = authHeader.replace(/^Bearer\s+/i, '')
      // Use constant-time comparison to prevent timing attacks
      const secretBytes = new TextEncoder().encode(cleanupSecret)
      const providedBytes = new TextEncoder().encode(providedSecret)
      let match = secretBytes.length === providedBytes.length
      if (match) {
        for (let i = 0; i < secretBytes.length; i++) {
          if (secretBytes[i] !== providedBytes[i]) { match = false }
        }
      }
      if (!match) {
        console.warn('cleanup-unverified-accounts: unauthorized call rejected')
        return new Response(
          JSON.stringify({ success: false, error: 'Unauthorized' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 },
        )
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('Starting cleanup of unverified accounts...')

    // Вызываем SQL функцию для очистки
    const { data, error } = await supabaseAdmin
      .rpc('cleanup_unverified_users')

    if (error) {
      console.error('Error cleaning up unverified users:', error)
      throw error
    }

    const result = data as unknown as CleanupResult[]
    const cleanupResult = result && result.length > 0 ? result[0] : { deleted_count: 0, deleted_emails: [] }

    console.log(`Cleanup completed. Deleted ${cleanupResult.deleted_count} unverified accounts`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Deleted ${cleanupResult.deleted_count} unverified accounts`,
        deleted_count: cleanupResult.deleted_count,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

// Настройка автоматического запуска:
//
// 1. Установить CLEANUP_SECRET как Supabase Edge Function secret:
//    supabase secrets set CLEANUP_SECRET=<random-secret>
//
// 2. С помощью pg_cron (в Supabase Dashboard -> SQL Editor):
//    SELECT cron.schedule(
//      'cleanup-unverified-users',
//      '*/5 * * * *',
//      $$SELECT net.http_post(
//        url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-unverified-accounts',
//        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_CLEANUP_SECRET"}'::jsonb
//      ) as request_id;$$
//    );
//
// 3. С помощью внешнего cron (например, GitHub Actions, Vercel Cron):
//    curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-unverified-accounts \
//      -H "Authorization: Bearer YOUR_CLEANUP_SECRET"

