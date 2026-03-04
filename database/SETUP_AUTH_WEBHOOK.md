# Auth Webhook Sync — Инструкция по настройке

## Архитектура

```
Supabase Auth (auth.users)
        │
        ├─ DB Webhook ──────────→ Edge Function: sync-auth-user
        │                              │
        └─ DB Trigger (резерв) ────────┤
                                       ↓
                               public.users (TourFurr)
```

**Двойная защита:**
- **Webhook** (основной) — вызывает Edge Function при каждом событии в `auth.users`
- **Триггер** (резервный) — синхронизирует напрямую через PostgreSQL `AFTER INSERT/UPDATE/DELETE`

---

## Шаг 1: Деплой Edge Function

```bash
# Убедитесь, что Supabase CLI установлен
supabase --version

# Логин
supabase login

# Деплой функции
supabase functions deploy sync-auth-user --project-ref <YOUR_PROJECT_REF>
```

> **`YOUR_PROJECT_REF`** — идентификатор проекта из URL дашборда:  
> `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

---

## Шаг 2: Задать секрет WEBHOOK_SECRET

```bash
# Сгенерировать надёжный секрет (например, 32 байта hex)
openssl rand -hex 32

# Сохранить в Supabase Vault / Environment Variables
supabase secrets set WEBHOOK_SECRET=<сгенерированная_строка> \
  --project-ref <YOUR_PROJECT_REF>
```

Или через Dashboard → **Edge Functions** → **`sync-auth-user`** → **Environment variables** → **Add** `WEBHOOK_SECRET`.

---

## Шаг 3: Создать DB Webhook в Supabase Dashboard

1. Перейдите: **Database** → **Webhooks** (или **Integrations** → **Webhooks**)
2. Нажмите **Create a new hook**
3. Заполните форму:

| Поле | Значение |
|------|----------|
| **Name** | `sync-auth-user` |
| **Table** | `auth.users` (схема `auth`) |
| **Events** | ✅ Insert ✅ Update ✅ Delete |
| **Type** | Supabase Edge Functions |
| **Edge Function** | `sync-auth-user` |
| **HTTP Headers** | Добавьте: `x-webhook-secret` = `<ваш WEBHOOK_SECRET>` |

> 💡 Альтернатива: выберите тип **HTTP Request** и укажите URL:  
> `https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/sync-auth-user`  
> с заголовком `Authorization: Bearer <SUPABASE_ANON_KEY>`

4. Нажмите **Confirm** / **Create hook**

---

## Шаг 4: Выполнить SQL-миграцию

В **SQL Editor** вашего проекта выполните файл:

```
database/setup_auth_webhook_sync.sql
```

> ⚠️ Раздел "Триггер на auth.users" (ЧАСТЬ 3) требует роли **postgres**.  
> В Supabase SQL Editor войдите как **`postgres`** или **`supabase_admin`**.  
> Если нет доступа — пропустите триггер; webhook достаточен.

---

## Шаг 5: Проверка работы

### Тест через Dashboard:
1. **Authentication** → **Users** → **Add user** (invite или создать)
2. Перейдите **Table Editor** → `public.users` — строка должна появиться автоматически

### Тест через SQL:
```sql
-- Проверить, что пользователи из auth синхронизированы
SELECT 
    a.id,
    a.email,
    a.created_at AS auth_created_at,
    u.id AS profile_id,
    u.status
FROM auth.users a
LEFT JOIN public.users u ON u.id = a.id
ORDER BY a.created_at DESC
LIMIT 20;
```

Строки с `profile_id IS NULL` — пользователи без профиля (нужно синхронизировать вручную).

### Ручная синхронизация существующих пользователей:
```sql
-- Создать профили для auth-пользователей, у которых нет записи в public.users
INSERT INTO public.users (
    id, email, phone, telegram, status, 
    email_subscribed, agree_rules, agree_privacy,
    created_at, updated_at
)
SELECT 
    a.id,
    COALESCE(a.email, ''),
    '', '', 'pending',
    false, false, false,
    a.created_at, NOW()
FROM auth.users a
LEFT JOIN public.users u ON u.id = a.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

---

## Шаг 6: Просмотр логов Edge Function

```bash
# В реальном времени
supabase functions logs sync-auth-user --project-ref <YOUR_PROJECT_REF>

# Или в Dashboard: Edge Functions → sync-auth-user → Logs
```

---

## Структура файлов

```
supabase/
  functions/
    sync-auth-user/
      index.ts          ← Edge Function (этот файл)
database/
  setup_auth_webhook_sync.sql  ← SQL-миграция (индексы, триггер, RLS)
```

---

## Переменные окружения Edge Function

| Переменная | Источник | Описание |
|------------|----------|----------|
| `SUPABASE_URL` | Auto (Supabase) | URL проекта |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto (Supabase) | Ключ сервисной роли (обходит RLS) |
| `WEBHOOK_SECRET` | Вы → `supabase secrets set` | Секрет для проверки HMAC-подписи |

---

## Безопасность

- Edge Function использует **`SUPABASE_SERVICE_ROLE_KEY`** — обходит RLS, пишет от имени системы
- Запросы клиентов к `public.users` ограничены RLS (пользователь видит только свои данные)
- HMAC-подпись (`WEBHOOK_SECRET`) защищает endpoint от посторонних вызовов
- В случае компрометации секрета — смените через `supabase secrets set WEBHOOK_SECRET=<новое>`
