# Cleanup Unverified Accounts Edge Function

Эта Edge Function автоматически удаляет пользователей, которые не подтвердили свой email в течение 15 минут после регистрации.

## Что делает функция

1. Находит всех пользователей с `email_verified = false` и `created_at` старше 15 минут
2. Удаляет их из таблицы `users`
3. Удаляет связанные коды подтверждения из `email_verification_codes`
4. Удаляет пользователей из Supabase Auth (`auth.users`)

## Развертывание

```bash
# Развернуть функцию
supabase functions deploy cleanup-unverified-accounts

# Протестировать локально
supabase functions serve cleanup-unverified-accounts
```

## Настройка автоматического запуска

### Вариант 1: pg_cron (рекомендуется для Supabase)

В Supabase Dashboard -> SQL Editor выполните:

```sql
-- Включить расширение pg_cron (если еще не включено)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Настроить автоматический запуск каждые 5 минут
SELECT cron.schedule(
  'cleanup-unverified-users',
  '*/5 * * * *',  -- Каждые 5 минут
  $$SELECT net.http_post(
    url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-unverified-accounts',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  ) as request_id;$$
);

-- Проверить созданные задачи
SELECT * FROM cron.job;

-- Удалить задачу (если нужно)
-- SELECT cron.unschedule('cleanup-unverified-users');
```

### Вариант 2: Внешний cron сервис

#### GitHub Actions

Создайте файл `.github/workflows/cleanup-unverified-accounts.yml`:

```yaml
name: Cleanup Unverified Accounts

on:
  schedule:
    - cron: '*/5 * * * *'  # Каждые 5 минут
  workflow_dispatch:  # Разрешить ручной запуск

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Call cleanup function
        run: |
          curl -X POST ${{ secrets.SUPABASE_URL }}/functions/v1/cleanup-unverified-accounts \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

#### Vercel Cron

Добавьте в `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cleanup-unverified-accounts",
    "schedule": "*/5 * * * *"
  }]
}
```

## Ручной запуск

### Локально
```bash
curl -X POST http://localhost:54321/functions/v1/cleanup-unverified-accounts
```

### Продакшн
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-unverified-accounts \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Мониторинг

Функция логирует:
- Количество удаленных аккаунтов
- Email адреса удаленных пользователей
- Ошибки (если есть)

Проверить логи можно в Supabase Dashboard -> Edge Functions -> cleanup-unverified-accounts -> Logs

## Безопасность

- Функция использует `SUPABASE_SERVICE_ROLE_KEY` для админских операций
- Доступ к функции должен быть защищен (можно добавить API ключ)
- Перед удалением проверяется grace period (15 минут)
