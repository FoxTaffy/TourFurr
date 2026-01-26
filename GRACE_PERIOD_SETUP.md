# Настройка Grace Period для неподтвержденных аккаунтов

## Описание

Эта функция автоматически удаляет пользователей, которые не подтвердили email в течение 15 минут после регистрации.

## Что было добавлено

1. **SQL функция** (`database/cleanup_unverified_accounts.sql`):
   - `cleanup_unverified_users()` - удаляет неподтвержденных пользователей старше 15 минут
   - `check_user_verification_grace_period()` - проверяет оставшееся время для пользователя

2. **Supabase Edge Function** (`supabase/functions/cleanup-unverified-accounts/`):
   - Периодически вызывает SQL функцию для очистки
   - Может быть запущена вручную или по расписанию

3. **Клиентская логика**:
   - `src/utils/gracePeriod.ts` - утилиты для работы с grace period
   - `src/views/VerifyEmailPage.vue` - отображает таймер обратного отсчета

## Шаги для развертывания

### 1. Создать SQL функции в Supabase

1. Откройте Supabase Dashboard → SQL Editor
2. Выполните SQL из файла `database/cleanup_unverified_accounts.sql`

```sql
-- Скопируйте и выполните содержимое файла cleanup_unverified_accounts.sql
```

### 2. Развернуть Edge Function

```bash
# Убедитесь, что у вас установлен Supabase CLI
npm install -g supabase

# Войдите в Supabase
supabase login

# Свяжите проект
supabase link --project-ref YOUR_PROJECT_REF

# Разверните функцию
supabase functions deploy cleanup-unverified-accounts
```

### 3. Настроить автоматический запуск

#### Вариант A: Использовать pg_cron (рекомендуется)

В Supabase Dashboard → SQL Editor выполните:

```sql
-- Включить расширение pg_cron (если еще не включено)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Включить расширение pg_net для HTTP запросов
CREATE EXTENSION IF NOT EXISTS pg_net;

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
```

**Важно**: Замените `YOUR_PROJECT_REF` и `YOUR_ANON_KEY` на ваши значения из Supabase Dashboard → Project Settings → API.

#### Вариант B: GitHub Actions

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

Добавьте secrets в GitHub:
- `SUPABASE_URL`: https://YOUR_PROJECT_REF.supabase.co
- `SUPABASE_ANON_KEY`: Ваш anon key из Supabase Dashboard

### 4. Тестирование

#### Ручной запуск функции очистки

```bash
# Локально (требует запущенный Supabase CLI)
curl -X POST http://localhost:54321/functions/v1/cleanup-unverified-accounts

# Продакшн
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-unverified-accounts \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

#### Проверка SQL функции напрямую

В Supabase Dashboard → SQL Editor:

```sql
-- Проверить, какие пользователи будут удалены
SELECT id, email, created_at, email_verified
FROM users
WHERE email_verified = FALSE
  AND created_at < NOW() - INTERVAL '15 minutes';

-- Запустить очистку вручную
SELECT * FROM cleanup_unverified_users();

-- Проверить grace period для конкретного пользователя
SELECT * FROM check_user_verification_grace_period('test@example.com');
```

#### Тестирование в интерфейсе

1. Зарегистрируйте новый аккаунт
2. Перейдите на страницу подтверждения email
3. Вы должны увидеть таймер обратного отсчета (15:00)
4. Таймер обновляется каждую секунду
5. Когда осталось менее 5 минут, таймер становится оранжевым
6. Когда время истекает, показывается сообщение об удалении

## Мониторинг

### Просмотр логов Edge Function

Supabase Dashboard → Edge Functions → cleanup-unverified-accounts → Logs

### Проверка выполнения cron задач

```sql
-- Просмотр всех cron задач
SELECT * FROM cron.job;

-- Просмотр истории выполнения
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-unverified-users')
ORDER BY start_time DESC
LIMIT 10;
```

### Метрики

```sql
-- Количество неподтвержденных аккаунтов
SELECT COUNT(*) as unverified_count
FROM users
WHERE email_verified = FALSE;

-- Неподтвержденные аккаунты старше 15 минут (будут удалены)
SELECT COUNT(*) as expired_count
FROM users
WHERE email_verified = FALSE
  AND created_at < NOW() - INTERVAL '15 minutes';

-- Средний возраст неподтвержденных аккаунтов
SELECT
  AVG(EXTRACT(EPOCH FROM (NOW() - created_at)) / 60) as avg_age_minutes
FROM users
WHERE email_verified = FALSE;
```

## Настройка grace period

По умолчанию grace period = 15 минут. Чтобы изменить:

1. В SQL функции (`database/cleanup_unverified_accounts.sql`):
   ```sql
   grace_period_minutes INTEGER := 15; -- Измените значение
   ```

2. В клиентском коде (`src/utils/gracePeriod.ts`):
   ```typescript
   export const GRACE_PERIOD_MINUTES = 15 // Измените значение
   ```

После изменения:
- Пересоздайте SQL функцию в Supabase
- Пересоберите фронтенд: `npm run build`

## Безопасность

- Edge Function использует `SUPABASE_SERVICE_ROLE_KEY` для удаления пользователей из auth.users
- SQL функция использует `SECURITY DEFINER` для доступа к auth.users
- Проверяйте логи регулярно на предмет ошибок
- Рекомендуется добавить дополнительную аутентификацию для Edge Function в продакшене

## Откат изменений

Если нужно отключить автоматическую очистку:

```sql
-- Удалить cron задачу
SELECT cron.unschedule('cleanup-unverified-users');

-- Отключить Edge Function
-- В Supabase Dashboard → Edge Functions → cleanup-unverified-accounts → Disable
```

Чтобы полностью удалить функции:

```sql
-- Удалить SQL функции
DROP FUNCTION IF EXISTS cleanup_unverified_users();
DROP FUNCTION IF EXISTS check_user_verification_grace_period(TEXT);
```

## Поддержка

При возникновении проблем:
1. Проверьте логи Edge Function в Supabase Dashboard
2. Проверьте выполнение cron задач: `SELECT * FROM cron.job_run_details`
3. Убедитесь, что расширения pg_cron и pg_net включены
4. Проверьте, что SERVICE_ROLE_KEY корректный в настройках Edge Function
