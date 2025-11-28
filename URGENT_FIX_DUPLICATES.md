# 🚨 СРОЧНОЕ ИСПРАВЛЕНИЕ: Дубликаты пользователей

## Проблема
При попытке изменить профиль возникает ошибка:
```
more than one row returned by a subquery used as an expression
```

## Причина
Старая логика миграции пыталась обновить PRIMARY KEY, что создало дубликаты записей пользователей в базе данных.

## ⚠️ ВАЖНО: Сделайте бэкап!
Перед выполнением миграций обязательно сделайте бэкап базы данных в Supabase Dashboard:
1. Settings → Database → Database Backups
2. Или используйте `pg_dump` для локального бэкапа

## Решение (выполните по порядку)

### Шаг 1: Проверьте наличие дубликатов

В Supabase SQL Editor выполните:

```sql
-- Показать все дубликаты
SELECT email, COUNT(*) as count, array_agg(id) as user_ids
FROM users
GROUP BY email
HAVING COUNT(*) > 1;
```

Если результат пустой - дубликатов нет, переходите сразу к Шагу 3.

### Шаг 2: Удалите дубликаты

**⚠️ Внимание:** Этот скрипт удалит старые записи, оставив только самые новые с Supabase Auth.

```sql
-- Create a temporary table to store users to keep
CREATE TEMP TABLE users_to_keep AS
SELECT DISTINCT ON (email)
  id,
  email
FROM users
WHERE email_verified = true  -- Keep verified users
  OR password_hash = ''       -- Keep Supabase Auth users (password_hash is empty)
ORDER BY email, created_at DESC;  -- Keep the most recent one

-- Delete duplicate users (keeping only the ones in users_to_keep)
DELETE FROM users
WHERE id NOT IN (SELECT id FROM users_to_keep);

-- Verify no more duplicates
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ No duplicates found'
    ELSE '⚠️ Still have duplicates!'
  END as status,
  COUNT(*) as duplicate_count
FROM (
  SELECT email, COUNT(*) as count
  FROM users
  GROUP BY email
  HAVING COUNT(*) > 1
) duplicates;
```

### Шаг 3: Сделайте password_hash nullable

```sql
-- Make password_hash nullable
ALTER TABLE users
ALTER COLUMN password_hash DROP NOT NULL;

-- Update RLS policy
DROP POLICY IF EXISTS "Users can update own data" ON users;

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (auth.uid() = id);
```

### Шаг 4: Проверьте результат

```sql
-- 1. Check for duplicates
SELECT COUNT(*) as duplicate_emails
FROM (
  SELECT email, COUNT(*) as count
  FROM users
  GROUP BY email
  HAVING COUNT(*) > 1
) duplicates;

-- Should return: 0

-- 2. Check total users
SELECT COUNT(*) as total_users FROM users;

-- 3. Check RLS policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'users';
```

## После исправления базы данных

### Шаг 5: Обновите код (уже закоммичен)

Код уже исправлен и закоммичен. Миграция теперь:
1. ✅ Удаляет старую запись
2. ✅ Создаёт новую запись с новым Supabase Auth ID
3. ✅ Сохраняет все данные пользователя
4. ✅ Не создаёт дубликатов

### Шаг 6: Задеплойте изменения

```bash
git pull origin claude/mobile-header-redesign-01JXxNoujy4aruc32gDEK9ZL
npm install
# Затем задеплойте на Vercel
```

## Проверка после исправления

1. **Войдите в аккаунт**
2. **Попробуйте изменить профиль** (например, описание)
3. **Попробуйте подписаться на рассылку**
4. **Ошибка должна исчезнуть!** ✅

## Если проблема осталась

### Проверьте логи Supabase
1. Supabase Dashboard → Logs → Postgres Logs
2. Найдите детальную ошибку
3. Отправьте мне скриншот для диагностики

### Проверьте консоль браузера
1. F12 → Console
2. Найдите ошибки с `supabase` или `users`
3. Отправьте мне полный текст ошибки

## Технические детали изменений

### До (неправильно):
```typescript
// Пыталась обновить PRIMARY KEY - создавала дубликаты
await supabase.from('users').update({
  id: migratedAuth.user.id,  // ❌ Нельзя обновлять PRIMARY KEY!
  password_hash: '',
  email_verified: true
}).eq('email', cleanEmail)
```

### После (правильно):
```typescript
// Удаляем старую запись и создаём новую
await supabase.from('users').delete().eq('id', oldUser.id)
await supabase.from('users').insert({
  id: migratedAuth.user.id,  // ✅ Новый ID от Supabase Auth
  ...oldUserData,             // ✅ Все старые данные
  password_hash: '',          // ✅ Очищаем старый пароль
  email_verified: true        // ✅ Старые юзеры автоматически верифицированы
})
```

## Почему это произошло

PostgreSQL не позволяет обновлять PRIMARY KEY напрямую. Старый код пытался это сделать, что приводило к:
1. ⚠️ Созданию дубликатов
2. ⚠️ Ошибкам при запросах (subquery returned more than one row)
3. ⚠️ Невозможности обновить профиль

Новый код правильно мигрирует данные через DELETE + INSERT.
