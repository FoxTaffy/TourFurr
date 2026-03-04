-- ====================================================================
-- DANGER ZONE: FULL USER RESET (public.users + auth.users)
-- ====================================================================
-- Что делает:
--   1) Очищает пользовательские и связанные таблицы в public
--   2) Удаляет ВСЕХ пользователей из auth.users
--
-- Использовать только если вы осознанно хотите «снести всех пользователей».
-- ====================================================================

BEGIN;

-- -----------------------------
-- 1) Предпросмотр (до удаления)
-- -----------------------------
SELECT 'before' AS stage, 'public.users' AS table_name, COUNT(*)::BIGINT AS cnt FROM public.users
UNION ALL
SELECT 'before', 'auth.users', COUNT(*)::BIGINT FROM auth.users
UNION ALL
SELECT 'before', 'public.applications', COUNT(*)::BIGINT FROM public.applications
UNION ALL
SELECT 'before', 'public.admin_votes', COUNT(*)::BIGINT FROM public.admin_votes;

-- -----------------------------
-- 2) Очистка зависимых таблиц
-- -----------------------------
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'public.admin_votes',
    'public.application_vote_sessions',
    'public.applications',
    'public.email_verification_codes',
    'public.password_reset_codes',
    'public.rate_limits'
  ]
  LOOP
    IF to_regclass(tbl) IS NOT NULL THEN
      EXECUTE format('TRUNCATE TABLE %s RESTART IDENTITY CASCADE', tbl);
    END IF;
  END LOOP;
END $$;

-- -----------------------------
-- 3) Очистка профилей приложения
-- -----------------------------
TRUNCATE TABLE public.users RESTART IDENTITY CASCADE;

-- -----------------------------
-- 4) Очистка Supabase Auth
-- -----------------------------
DELETE FROM auth.users;

-- -----------------------------
-- 5) Проверка (после удаления)
-- -----------------------------
SELECT 'after' AS stage, 'public.users' AS table_name, COUNT(*)::BIGINT AS cnt FROM public.users
UNION ALL
SELECT 'after', 'auth.users', COUNT(*)::BIGINT FROM auth.users
UNION ALL
SELECT 'after', 'public.applications', COUNT(*)::BIGINT FROM public.applications
UNION ALL
SELECT 'after', 'public.admin_votes', COUNT(*)::BIGINT FROM public.admin_votes;

COMMIT;

-- Если хотите сначала тестово проверить без сохранения:
-- 1) замените COMMIT на ROLLBACK
-- 2) выполните скрипт
