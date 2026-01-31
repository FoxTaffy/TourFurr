-- ====================================================================
-- FIXES AND CLEANUP
-- ====================================================================
-- 1. Удалить поле email_subscribed
-- 2. Дать админку пользователю
-- 3. Настроить обязательную верификацию email
-- 4. Создать автоудаление неверифицированных аккаунтов
-- ====================================================================

-- ========================================
-- 1. УДАЛИТЬ ПОЛЕ email_subscribed (если существует)
-- ========================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'email_subscribed'
    ) THEN
        ALTER TABLE users DROP COLUMN email_subscribed;
        RAISE NOTICE 'Column email_subscribed dropped successfully';
    ELSE
        RAISE NOTICE 'Column email_subscribed does not exist, skipping';
    END IF;
END $$;

-- ========================================
-- 2. ДАТЬ АДМИНКУ ПОЛЬЗОВАТЕЛЮ
-- ========================================
-- ВАЖНО: Замените email на свой!

-- Вариант 1: По email
-- UPDATE users
-- SET is_admin = true, status = 'approved', email_verified = true
-- WHERE email = 'your_email@example.com';

-- Вариант 2: По nickname
-- UPDATE users
-- SET is_admin = true, status = 'approved', email_verified = true
-- WHERE nickname = 'Taffy';

-- Проверить результат:
-- SELECT id, email, nickname, is_admin, status, email_verified FROM users WHERE is_admin = true;

-- ========================================
-- 3. ФУНКЦИЯ АВТОУДАЛЕНИЯ НЕВЕРИФИЦИРОВАННЫХ АККАУНТОВ
-- ========================================

CREATE OR REPLACE FUNCTION cleanup_unverified_users()
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Удаляем пользователей:
    -- - email не подтверждён
    -- - прошло больше 15 минут с момента создания
    DELETE FROM users
    WHERE email_verified = false
        AND created_at < NOW() - INTERVAL '15 minutes';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RAISE NOTICE 'Deleted % unverified users', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION cleanup_unverified_users() TO anon, authenticated, service_role;

COMMENT ON FUNCTION cleanup_unverified_users IS 'Удаляет неподтверждённые аккаунты старше 15 минут';

-- ========================================
-- 4. НАСТРОИТЬ ОБЯЗАТЕЛЬНУЮ ВЕРИФИКАЦИЮ EMAIL
-- ========================================

-- Добавить constraint (опционально - может быть уже есть)
-- ALTER TABLE users ADD CONSTRAINT check_email_verified_for_approved
-- CHECK (status != 'approved' OR email_verified = true);

-- Убедиться что новые пользователи создаются с email_verified = false
ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT false;

-- ========================================
-- 5. ВЫВОД РЕЗУЛЬТАТОВ
-- ========================================

SELECT '========================================';
SELECT '✅ FIXES APPLIED SUCCESSFULLY';
SELECT '========================================';

-- Показать админов
SELECT
    'ADMINS' as section,
    id,
    email,
    nickname,
    is_admin,
    status,
    email_verified,
    created_at
FROM users
WHERE is_admin = true;

-- Показать статистику пользователей
SELECT
    'USER STATISTICS' as section,
    status,
    email_verified,
    COUNT(*) as count
FROM users
GROUP BY status, email_verified
ORDER BY status, email_verified;

SELECT '
================================================================================
📝 ВЫПОЛНЕННЫЕ ИЗМЕНЕНИЯ:
================================================================================

1. ✅ Поле email_subscribed удалено (если существовало)

2. ⚠️  АДМИНКА: Раскомментируйте и выполните UPDATE для вашего email/nickname

3. ✅ Функция cleanup_unverified_users() создана
   - Удаляет неверифицированные аккаунты старше 15 минут
   - Можно вызвать вручную: SELECT cleanup_unverified_users();

4. ✅ Email верификация обязательна по умолчанию

================================================================================

🔧 НАСТРОЙКА АВТОМАТИЧЕСКОЙ ОЧИСТКИ (через Supabase CLI):

# Создайте cron job для автоудаления:
supabase functions deploy cleanup-unverified --no-verify-jwt

# Настройте в Supabase Dashboard:
# Project Settings → Database → Cron Jobs
# Schedule: */15 * * * * (каждые 15 минут)
# Statement: SELECT cleanup_unverified_users();

================================================================================

📋 СЛЕДУЮЩИЕ ШАГИ:

1. Раскомментируйте UPDATE для вашего email
2. Выполните скрипт снова
3. Проверьте: SELECT * FROM users WHERE is_admin = true;

================================================================================
' as instructions;
