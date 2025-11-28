# Исправление ошибки 500 при обновлении пользователя

## Проблема
Ошибка 500 при попытке обновить профиль пользователя (например, подписаться на рассылку).

```
PATCH https://gczgcatmsrlncjbqdghu.supabase.co/rest/v1/users?id=eq...&select=* 500 (Internal Server Error)
```

## Причина
После миграции на Supabase Auth поле `password_hash` больше не используется (пароли теперь хранятся в Supabase Auth), но оно всё ещё помечено как `NOT NULL` в базе данных. Также RLS политика использует устаревший синтаксис.

## Решение

### Шаг 1: Откройте Supabase SQL Editor
1. Перейдите в Supabase Dashboard
2. Выберите ваш проект
3. Откройте `SQL Editor` в боковом меню

### Шаг 2: Выполните миграцию
Скопируйте и выполните следующий SQL код:

```sql
-- Make password_hash nullable (no longer needed with Supabase Auth)
ALTER TABLE users
ALTER COLUMN password_hash DROP NOT NULL;

-- Update RLS policy to work with Supabase Auth
-- First drop the old policy
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new policy that works with Supabase Auth
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- Add comment
COMMENT ON COLUMN users.password_hash IS 'Legacy password hash - now managed by Supabase Auth (nullable)';
```

### Шаг 3: Проверьте результат
После выполнения миграции попробуйте снова:
1. Войдите в аккаунт
2. Попробуйте нажать "Подписаться на рассылку"
3. Ошибка 500 должна исчезнуть

## Дополнительная проверка

Если ошибка всё ещё возникает, проверьте:

### 1. Проверьте RLS политики
```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

Должны быть политики:
- `Users can view own data` (SELECT)
- `Users can update own data` (UPDATE) - с `auth.uid() = id`
- `Anyone can register` (INSERT)

### 2. Проверьте структуру таблицы
```sql
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name = 'password_hash';
```

Поле `is_nullable` должно быть `YES`.

### 3. Проверьте логи Supabase
В Supabase Dashboard > Logs > Postgres Logs можно увидеть детальную ошибку.

## Что было изменено

1. **password_hash** - теперь nullable (может быть NULL или пустым)
2. **RLS политика** - обновлена на современный синтаксис `auth.uid()`
   - Старый: `id::text = current_setting('request.jwt.claims', true)::json->>'sub'`
   - Новый: `auth.uid() = id`

## После миграции

После успешного выполнения миграции:
1. Все операции обновления профиля будут работать
2. Подписка на рассылку будет работать корректно
3. Редактирование профиля будет работать без ошибок
