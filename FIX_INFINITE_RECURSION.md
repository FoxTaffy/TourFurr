# ИСПРАВЛЕНИЕ: Infinite Recursion in RLS Policies

## Проблема
При регистрации или работе с users таблицей возникает ошибка:
```
infinite recursion detected in policy for relation "users"
```

## Причина
RLS политики для таблицы `users` делают подзапросы к той же таблице для проверки `is_admin`, что создает бесконечную рекурсию.

## Решение
Применить SQL миграцию из файла `database/PRODUCTION_SECURE_RLS_FIXED.sql`

## Как применить

### Вариант 1: Через Supabase Dashboard (рекомендуется)

1. Откройте Supabase Dashboard
2. Перейдите в **SQL Editor**
3. Скопируйте содержимое файла `database/PRODUCTION_SECURE_RLS_FIXED.sql`
4. Вставьте в SQL Editor
5. Нажмите **Run** (или Ctrl+Enter)
6. Проверьте что все политики применились успешно

### Вариант 2: Через Supabase CLI

```bash
supabase db push --db-url "postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres" --file database/PRODUCTION_SECURE_RLS_FIXED.sql
```

## Что исправляет этот SQL

1. **Создает функцию `is_admin_user(UUID)`**
   - Использует `SECURITY DEFINER` для обхода RLS
   - Проверяет является ли пользователь админом БЕЗ рекурсии

2. **Обновляет все RLS политики для `users`**
   - Заменяет подзапросы на вызов функции `is_admin_user()`
   - Убирает бесконечную рекурсию

3. **Обновляет RLS политики для `email_verification_codes`**
   - Безопасные политики без рекурсии

4. **Создает вспомогательные функции**
   - `verify_email_code()` - безопасная проверка кодов
   - `cleanup_old_verification_codes()` - очистка старых кодов

## После применения

1. Протестируйте регистрацию нового пользователя
2. Проверьте что ошибка "infinite recursion" больше не возникает
3. Убедитесь что админы могут видеть всех пользователей
4. Убедитесь что обычные пользователи видят только свои данные

## Проверка

Выполните в SQL Editor:
```sql
-- Проверка политик для users
SELECT policyname, cmd, qual::text as using_clause
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- Проверка функции is_admin_user
SELECT proname, prosecdef, prosrc
FROM pg_proc
WHERE proname = 'is_admin_user';
```

Вы должны увидеть:
- Политики используют `is_admin_user(auth.uid())` вместо подзапросов
- Функция `is_admin_user` существует с `prosecdef = true`

## В случае проблем

Если после применения возникли проблемы:

1. Проверьте логи ошибок в Supabase Dashboard
2. Убедитесь что все миграции применились полностью
3. Проверьте что функция `is_admin_user` создана:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'is_admin_user';
   ```

## Дополнительно

После применения этого фикса рекомендуется также применить изменения из:
- Commit с фиксами валидации пароля
- Commit с cleanup orphaned auth accounts
