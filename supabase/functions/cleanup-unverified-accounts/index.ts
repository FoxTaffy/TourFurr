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

  try {
    // Создаем Supabase клиент с service role для админских операций
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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

    if (cleanupResult.deleted_emails && cleanupResult.deleted_emails.length > 0) {
      console.log('Deleted emails:', cleanupResult.deleted_emails)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Deleted ${cleanupResult.deleted_count} unverified accounts`,
        deleted_count: cleanupResult.deleted_count,
        deleted_emails: cleanupResult.deleted_emails || []
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
// 1. С помощью pg_cron (в Supabase Dashboard -> SQL Editor):
//    SELECT cron.schedule(
//      'cleanup-unverified-users',
//      '*/5 * * * *',
//      $$SELECT net.http_post(
//        url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-unverified-accounts',
//        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
//      ) as request_id;$$
//    );
//
// 2. С помощью внешнего cron (например, GitHub Actions, Vercel Cron, или любого cron сервиса):
//    curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-unverified-accounts \
//      -H "Authorization: Bearer YOUR_ANON_KEY"
//
// 3. Вызов вручную для тестирования:
//    curl -X POST http://localhost:54321/functions/v1/cleanup-unverified-accounts
