-- ====================================================================
-- CLEANUP: Remove unused tables and fields from database
-- ====================================================================
-- Дата: 01.02.2026
-- Удаляет неиспользуемые таблицы и поля для упрощения БД
-- ====================================================================

-- ========================
-- ЧАСТЬ 1: УДАЛЕНИЕ ТАБЛИЦЫ APPLICATIONS
-- ========================

-- Applications table была создана для системы голосования админов за заявки
-- НО: Сейчас регистрация происходит напрямую через users таблицу
-- Все пользователи регистрируются и получают статус pending/approved/rejected
-- Система голосования НЕ ИСПОЛЬЗУЕТСЯ, поэтому таблица бесполезна

-- Удаляем связанные объекты
-- Сначала удаляем таблицы (чтобы триггеры удалились автоматически)
DROP TABLE IF EXISTS admin_votes CASCADE;
DROP TABLE IF EXISTS applications CASCADE;

-- Теперь удаляем функции (если остались)
DROP FUNCTION IF EXISTS update_applications_updated_at() CASCADE;
DROP FUNCTION IF EXISTS get_pending_applications_for_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS cast_vote_on_application(UUID, UUID, BOOLEAN) CASCADE;

COMMENT ON SCHEMA public IS 'Applications table removed - registration happens directly through users table';

-- ========================
-- ЧАСТЬ 2: УДАЛЕНИЕ EMAIL_VERIFICATION_CODES
-- ========================

-- Эта таблица может быть полезна, НО если пользователь считает ее бесполезной:
-- ВАЖНО: Если вы используете 6-digit email verification codes, НЕ удаляйте эту таблицу!
-- Если используете только Supabase встроенную верификацию - можете удалить

-- ЗАКОММЕНТИРОВАНО: Раскомментируйте только если точно не используете
-- DROP FUNCTION IF EXISTS verify_email_code(TEXT, TEXT) CASCADE;
-- DROP FUNCTION IF EXISTS cleanup_old_verification_codes() CASCADE;
-- DROP TABLE IF EXISTS email_verification_codes CASCADE;

-- ========================
-- ЧАСТЬ 3: УДАЛЕНИЕ AUDIT_ERRORS
-- ========================

DROP TABLE IF EXISTS audit_errors CASCADE;

COMMENT ON SCHEMA public IS 'Audit errors table removed - errors logged to application logs instead';

-- ========================
-- ЧАСТЬ 4: УДАЛЕНИЕ ALLERGIES_DESCRIPTION ИЗ USERS
-- ========================

-- Удаляем поле allergies_description из таблицы users (если существует)
ALTER TABLE users DROP COLUMN IF EXISTS allergies_description CASCADE;

COMMENT ON TABLE users IS 'Users table cleaned - removed unused allergies_description field';

-- ========================
-- ЧАСТЬ 5: PASSWORD_HASH - ИНФОРМАЦИЯ
-- ========================

-- ВАЖНО: password_hash поле больше НЕ ИСПОЛЬЗУЕТСЯ для Supabase Auth
-- Supabase Auth хранит пароли в своей внутренней таблице auth.users
-- password_hash используется ТОЛЬКО для миграции старых пользователей

-- Поле оставлено для совместимости при миграции, но должно быть пустым для новых юзеров
-- Если все пользователи уже мигрированы на Supabase Auth, можно удалить:
-- ALTER TABLE users DROP COLUMN IF EXISTS password_hash CASCADE;

-- ========================
-- ЧАСТЬ 6: ПРОВЕРКА РЕЗУЛЬТАТОВ
-- ========================

SELECT '===================================';
SELECT '✅ DATABASE CLEANUP COMPLETED ✅';
SELECT '===================================';

-- Показываем оставшиеся таблицы
SELECT
    'Remaining tables' as info,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Показываем поля в users
SELECT
    'Users table columns' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

SELECT '
================================================================================
🧹 CLEANUP SUMMARY
================================================================================

Удалено:
1. ✅ applications table - система голосования админов НЕ используется
   - Регистрация идет напрямую через users table
   - Все заявки обрабатываются в users с полем status

2. ✅ admin_votes table - связана с applications

3. ✅ audit_errors table - ошибки логируются в application logs

4. ✅ allergies_description field from users - поле не используется

5. ✅ Функции для applications:
   - get_pending_applications_for_admin()
   - cast_vote_on_application()
   - update_applications_updated_at()

Оставлено (закомментировано):
- email_verification_codes - используется для 6-digit кодов
- password_hash in users - используется для миграции старых аккаунтов

ВАЖНО:
- После очистки обновите фронтенд (удалите VotingPanel.vue)
- Проверьте что AdminPage.vue не использует applications
- password_hash будет пустым для всех новых пользователей (Supabase Auth)

================================================================================
' as cleanup_notice;
