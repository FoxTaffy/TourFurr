// @ts-nocheck
// Supabase Edge Function — runs under Deno, not Node.js.
// TypeScript errors about Deno globals are expected.
//
// Назначение: синхронизация auth.users → public.users через Auth webhook.
// Supabase Auth вызывает этот endpoint при событиях:
//   INSERT  (user.created)  → UPSERT в public.users
//   UPDATE  (user.updated)  → обновляем email / метаданные
//   DELETE  (user.deleted)  → удаляем запись (или помечаем как deleted)
//
// Окружение (Supabase Dashboard → Edge Functions → Environment vars):
//   SUPABASE_URL               — автоматически предоставляется Supabase
//   SUPABASE_SERVICE_ROLE_KEY  — автоматически предоставляется Supabase
//   WEBHOOK_SECRET             — произвольная строка, задаётся вами; та же
//                                строка указывается в настройках DB Webhook
//                                (поле "Secret Header Value")

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ──────────────────────────────────────────────────────────────────
// Вспомогательная функция: проверка HMAC-подписи
// Supabase отправляет заголовок x-supabase-signature (или webhook-secret)
// В формате: t=<unix_ts>,v1=<hex_hmac_sha256_of_"t.<body>">
// ──────────────────────────────────────────────────────────────────
async function verifySignature(
  req: Request,
  rawBody: string,
  secret: string,
): Promise<boolean> {
  const sigHeader = req.headers.get('x-supabase-signature')
  if (!sigHeader) return false

  const parts: Record<string, string> = {}
  for (const part of sigHeader.split(',')) {
    const [k, v] = part.split('=')
    parts[k.trim()] = v.trim()
  }

  const { t, v1 } = parts
  if (!t || !v1) return false

  // Payload для подписи: "<timestamp>.<тело запроса>"
  const payload = `${t}.${rawBody}`
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const msgData = encoder.encode(payload)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return expected === v1
}

// ──────────────────────────────────────────────────────────────────
// Тип хука (Supabase DB Webhook payload)
// ──────────────────────────────────────────────────────────────────
interface AuthUser {
  id: string
  email: string | null
  phone: string | null
  raw_user_meta_data: Record<string, unknown>
  created_at: string
  updated_at: string
  email_confirmed_at: string | null
  deleted_at: string | null
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  record: AuthUser | null
  old_record: AuthUser | null
}

// ──────────────────────────────────────────────────────────────────
// Основной обработчик
// ──────────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  // Preflight CORS (если понадобится вызов из браузера напрямую)
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  }

  if (req.method !== 'POST') {
    return respond(405, { error: 'Method not allowed' })
  }

  // Читаем тело один раз (нужно и для подписи, и для парсинга)
  const rawBody = await req.text()

  // ── Проверяем HMAC-подпись ────────────────────────────────────
  const webhookSecret = Deno.env.get('WEBHOOK_SECRET')
  if (webhookSecret) {
    const valid = await verifySignature(req, rawBody, webhookSecret)
    if (!valid) {
      console.warn('sync-auth-user: invalid signature, rejecting request')
      return respond(401, { error: 'Invalid webhook signature' })
    }
  } else {
    // В режиме разработки секрет может отсутствовать — предупреждаем
    console.warn('sync-auth-user: WEBHOOK_SECRET not set — running without signature check!')
  }

  // ── Парсим payload ────────────────────────────────────────────
  let payload: WebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return respond(400, { error: 'Invalid JSON' })
  }

  const { type, schema, table, record, old_record } = payload

  // Этот хук предназначен только для auth.users
  if (schema !== 'auth' || table !== 'users') {
    return respond(200, { message: 'Ignored (not auth.users)' })
  }

  // ── Клиент с service_role (обходит RLS) ───────────────────────
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } },
  )

  // ── Обработка событий ─────────────────────────────────────────
  try {
    switch (type) {
      case 'INSERT': {
        // Пользователь зарегистрировался в Supabase Auth.
        // Создаём (или обновляем, если уже есть) запись в public.users.
        // Большинство полей (nickname, phone, telegram и т.д.) будут
        // заполнены при следующем шаге регистрации через форму.
        const user = record!
        const meta = user.raw_user_meta_data ?? {}

        const { error } = await supabase.from('users').upsert(
          {
            id: user.id,
            email: user.email ?? '',
            // Имя и аватар берём из метаданных OAuth-провайдера (если есть)
            nickname: (meta.preferred_username as string)
              ?? (meta.user_name as string)
              ?? (meta.name as string)
              ?? null,
            avatar_url: (meta.avatar_url as string) ?? null,
            // Обязательные поля проекта — устанавливаем безопасные дефолты
            phone: (meta.phone as string) ?? '',
            telegram: (meta.telegram as string) ?? '',
            status: 'pending',
            email_subscribed: false,
            agree_rules: false,
            agree_privacy: false,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
          { onConflict: 'id', ignoreDuplicates: false },
        )

        if (error) {
          console.error('sync-auth-user INSERT error:', error)
          return respond(500, { error: error.message })
        }

        console.log(`sync-auth-user: inserted user ${user.id}`)
        return respond(200, { message: 'User created' })
      }

      case 'UPDATE': {
        // email/метаданные обновились в Auth — отражаем в public.users
        const user = record!
        const meta = user.raw_user_meta_data ?? {}

        const updateFields: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        }

        // Синхронизируем только поля, которые хранятся в Auth
        if (user.email) updateFields.email = user.email
        if (meta.avatar_url) updateFields.avatar_url = meta.avatar_url

        const { error } = await supabase
          .from('users')
          .update(updateFields)
          .eq('id', user.id)

        if (error) {
          console.error('sync-auth-user UPDATE error:', error)
          return respond(500, { error: error.message })
        }

        console.log(`sync-auth-user: updated user ${user.id}`)
        return respond(200, { message: 'User updated' })
      }

      case 'DELETE': {
        // Пользователь удалён из Auth — удаляем из public.users.
        // Каскадное удаление зависимых записей (applications и т.д.)
        // должно быть настроено через ON DELETE CASCADE в схеме,
        // или выполняться здесь явно.
        const userId = old_record?.id
        if (!userId) return respond(200, { message: 'No old_record id' })

        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', userId)

        if (error) {
          console.error('sync-auth-user DELETE error:', error)
          return respond(500, { error: error.message })
        }

        console.log(`sync-auth-user: deleted user ${userId}`)
        return respond(200, { message: 'User deleted' })
      }

      default:
        return respond(200, { message: `Unhandled event type: ${type}` })
    }
  } catch (err) {
    console.error('sync-auth-user: unexpected error', err)
    return respond(500, { error: 'Internal server error' })
  }
})

// Утилита для формирования JSON-ответа
function respond(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
