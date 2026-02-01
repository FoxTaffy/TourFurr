import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Vercel Serverless Function для удаления неподтвержденных аккаунтов старше 15 минут
 * Запускается по расписанию (cron) или вручную через API
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Проверка безопасности: только POST запросы или запросы с правильным токеном
  const authHeader = req.headers.authorization
  const cronSecret = process.env.CRON_SECRET

  if (req.method === 'POST' && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    // Создаем Supabase клиент с service role ключом для админ операций
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Вычисляем временную метку 15 минут назад
    const fifteenMinutesAgo = new Date()
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15)

    console.log(`[Cleanup] Checking for unverified accounts older than ${fifteenMinutesAgo.toISOString()}`)

    // Находим неподтвержденные аккаунты старше 15 минут
    const { data: unverifiedUsers, error: fetchError } = await supabase
      .from('users')
      .select('id, email, created_at, email_verified')
      .eq('email_verified', false)
      .lt('created_at', fifteenMinutesAgo.toISOString())

    if (fetchError) {
      console.error('Error fetching unverified users:', fetchError)
      return res.status(500).json({ error: 'Database error', details: fetchError.message })
    }

    if (!unverifiedUsers || unverifiedUsers.length === 0) {
      console.log('[Cleanup] No unverified accounts to delete')
      return res.status(200).json({
        message: 'No unverified accounts to delete',
        deleted: 0
      })
    }

    console.log(`[Cleanup] Found ${unverifiedUsers.length} unverified accounts to delete`)

    const deletedUsers = []
    const errors = []

    // Удаляем каждого пользователя
    for (const user of unverifiedUsers) {
      try {
        // 1. Удаляем из Supabase Auth
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id)

        if (authDeleteError) {
          // Если пользователь не найден в Auth (уже удален или не существует), продолжаем
          if (!authDeleteError.message.includes('User not found')) {
            console.error(`Error deleting user ${user.email} from Auth:`, authDeleteError)
            errors.push({ email: user.email, error: authDeleteError.message, step: 'auth' })
            continue
          }
        }

        // 2. Удаляем из таблицы users
        const { error: dbDeleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', user.id)

        if (dbDeleteError) {
          console.error(`Error deleting user ${user.email} from database:`, dbDeleteError)
          errors.push({ email: user.email, error: dbDeleteError.message, step: 'database' })
          continue
        }

        console.log(`[Cleanup] Successfully deleted unverified user: ${user.email}`)
        deletedUsers.push(user.email)

      } catch (err: any) {
        console.error(`Error processing user ${user.email}:`, err)
        errors.push({ email: user.email, error: err.message, step: 'processing' })
      }
    }

    const result = {
      message: 'Cleanup completed',
      deleted: deletedUsers.length,
      deletedUsers,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    }

    console.log('[Cleanup] Result:', result)

    return res.status(200).json(result)

  } catch (error: any) {
    console.error('[Cleanup] Fatal error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    })
  }
}
