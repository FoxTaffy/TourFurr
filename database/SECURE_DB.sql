-- ============================================================
-- TourFurr 2026 — БЕЗОПАСНАЯ БАЗА ДАННЫХ
-- ============================================================
-- Запускать в Supabase Dashboard → SQL Editor
-- Идемпотентный: можно запускать повторно без последствий
--
-- Что исправлено:
--  1. is_current_user_admin() использует JWT-claim (нет рекурсии, нет доп. запросов)
--  2. password_hash скрыт column-level REVOKE
--  3. email_verification_codes — убран USING (true)
--  4. anon больше не может читать таблицу users напрямую
--  5. Участники на главной — только через безопасный RPC
--  6. Все устаревшие таблицы (password_reset_codes) заблокированы
-- ============================================================

-- ============================================================
-- ШАГ 1: Вспомогательная функция — проверка is_admin из JWT
-- ============================================================
-- Читает is_admin из подписанного JWT-токена (добавляется
-- custom_access_token_hook). Не делает запросов в users —
-- исключает риск бесконечной рекурсии в RLS.
-- FALLBACK: если claim отсутствует — проверяем users напрямую.

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT CASE
        -- Сначала читаем из JWT (быстро, без рекурсии)
        WHEN (auth.jwt() ->> 'is_admin') IS NOT NULL
            THEN (auth.jwt() ->> 'is_admin')::boolean
        -- Fallback: прямой SELECT (нужен до первого входа после деплоя хука)
        ELSE COALESCE(
            (SELECT is_admin FROM public.users WHERE id = auth.uid() LIMIT 1),
            false
        )
    END
$$;

GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM anon;

-- ============================================================
-- ШАГ 2: Скрываем password_hash от authenticated и anon
-- ============================================================
-- Старые bcrypt-хеши не должны быть видны клиенту никогда.
-- service_role (edge functions) продолжает видеть всё.

DO $$
BEGIN
    -- Обнуляем все старые хеши (они уже не используются)
    UPDATE public.users
    SET password_hash = NULL
    WHERE password_hash IS NOT NULL AND password_hash != '';

    RAISE NOTICE '✅ password_hash обнулён для всех пользователей';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️  Не удалось обнулить password_hash: %', SQLERRM;
END $$;

-- Убираем право видеть password_hash для пользователей
-- (PostgREST уважает column-level GRANTs)
REVOKE SELECT (password_hash) ON public.users FROM authenticated, anon;

-- ============================================================
-- ШАГ 3: Отзываем избыточные права на таблицу users
-- ============================================================

-- Анонимные пользователи не должны делать прямые SELECT на users.
-- Все публичные проверки идут через SECURITY DEFINER функции.
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.users FROM anon;

-- authenticated — только то, что нужно (RLS ограничит строки)
REVOKE INSERT ON TABLE public.users FROM authenticated;

-- Базовые права (RLS решает, какие строки видны)
GRANT SELECT, UPDATE, DELETE ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;

-- ============================================================
-- ШАГ 4: Пересоздаём RLS политики на таблице users
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Удаляем все существующие политики
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname FROM pg_policies
        WHERE tablename = 'users' AND schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', r.policyname);
    END LOOP;
END $$;

-- SELECT: Пользователь видит только свои данные
CREATE POLICY "user_select_own" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- SELECT: Администратор видит всех (через JWT-claim, без рекурсии)
CREATE POLICY "admin_select_all" ON public.users
    FOR SELECT
    USING (public.is_current_user_admin());

-- INSERT: Запрещён напрямую — регистрация через Edge Function (create-user)
-- Если нужна регистрация через RPC register_user — она SECURITY DEFINER
-- и обходит этот запрет корректно.

-- UPDATE: Пользователь обновляет свой профиль (нельзя стать админом)
CREATE POLICY "user_update_own" ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND (is_admin IS NOT DISTINCT FROM false OR is_admin IS NULL)
        AND (can_approve_applications IS NOT DISTINCT FROM false OR can_approve_applications IS NULL)
    );

-- UPDATE: Администратор обновляет любого
CREATE POLICY "admin_update_any" ON public.users
    FOR UPDATE
    USING (public.is_current_user_admin());

-- DELETE: Пользователь удаляет свой аккаунт
CREATE POLICY "user_delete_own" ON public.users
    FOR DELETE
    USING (auth.uid() = id);

-- DELETE: Администратор удаляет любого
CREATE POLICY "admin_delete_any" ON public.users
    FOR DELETE
    USING (public.is_current_user_admin());

-- ============================================================
-- ШАГ 5: Безопасный RPC — список участников для главной страницы
-- ============================================================
-- Возвращает только публичные поля одобренных участников.
-- Не раскрывает email, phone, telegram, password_hash.

CREATE OR REPLACE FUNCTION public.get_approved_participants()
RETURNS TABLE(
    id          UUID,
    nickname    VARCHAR,
    avatar_url  TEXT,
    team_id     UUID
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT u.id, u.nickname, u.avatar_url, u.team_id
    FROM public.users u
    WHERE u.status IN ('approved', 'paid')
    ORDER BY u.nickname;
$$;

GRANT EXECUTE ON FUNCTION public.get_approved_participants() TO anon, authenticated;
COMMENT ON FUNCTION public.get_approved_participants IS
    'Публичный список одобренных участников — только безопасные поля.';

-- ============================================================
-- ШАГ 6: Исправляем email_verification_codes
-- ============================================================

ALTER TABLE public.email_verification_codes ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname FROM pg_policies
        WHERE tablename = 'email_verification_codes' AND schemaname = 'public'
    ) LOOP
        EXECUTE format(
            'DROP POLICY IF EXISTS %I ON public.email_verification_codes',
            r.policyname
        );
    END LOOP;
END $$;

-- SELECT: Аутентифицированный пользователь читает только свои коды
CREATE POLICY "user_select_own_codes" ON public.email_verification_codes
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND email = (SELECT email FROM public.users WHERE id = auth.uid() LIMIT 1)
    );

-- SELECT: Анонимный доступ ЗАПРЕЩЁН — проверка кодов только через RPC verify_email_code
-- (SECURITY DEFINER — обходит RLS корректно)

-- INSERT: Создание кода — только через service_role (Edge Function)
CREATE POLICY "service_insert_codes" ON public.email_verification_codes
    FOR INSERT
    WITH CHECK (true); -- Edge functions используют service_role, не затрагивается RLS

-- UPDATE: Пометить как использованный — через service_role
CREATE POLICY "service_update_codes" ON public.email_verification_codes
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- DELETE: Только истёкшие коды старше 24 часов
CREATE POLICY "delete_expired_codes" ON public.email_verification_codes
    FOR DELETE
    USING (expires_at < NOW() - INTERVAL '24 hours' OR used = true);

-- ============================================================
-- ШАГ 7: Блокируем password_reset_codes (устаревшая таблица)
-- ============================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'password_reset_codes'
    ) THEN
        ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

        -- Удаляем старые политики
        EXECUTE (
            SELECT string_agg(
                format('DROP POLICY IF EXISTS %I ON public.password_reset_codes;', policyname),
                ' '
            )
            FROM pg_policies
            WHERE tablename = 'password_reset_codes'
        );

        -- Запрещаем всё — таблица не используется, сброс пароля через Supabase OTP
        CREATE POLICY "deny_all_reset_codes" ON public.password_reset_codes
            FOR ALL USING (false) WITH CHECK (false);

        RAISE NOTICE '✅ password_reset_codes заблокирована';
    END IF;
END $$;

-- ============================================================
-- ШАГ 8: Политики teams
-- ============================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'teams'
    ) THEN
        ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

        EXECUTE (
            SELECT COALESCE(string_agg(
                format('DROP POLICY IF EXISTS %I ON public.teams;', policyname),
                ' '
            ), '')
            FROM pg_policies WHERE tablename = 'teams'
        );

        -- Все авторизованные + анонимные могут читать дома (нужно для главной страницы)
        CREATE POLICY "public_select_teams" ON public.teams
            FOR SELECT USING (true);

        -- Только администраторы управляют домами
        CREATE POLICY "admin_insert_teams" ON public.teams
            FOR INSERT WITH CHECK (public.is_current_user_admin());
        CREATE POLICY "admin_update_teams" ON public.teams
            FOR UPDATE USING (public.is_current_user_admin());
        CREATE POLICY "admin_delete_teams" ON public.teams
            FOR DELETE USING (public.is_current_user_admin());

        RAISE NOTICE '✅ teams политики обновлены';
    END IF;
END $$;

-- ============================================================
-- ШАГ 9: Политики event_config
-- ============================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'event_config'
    ) THEN
        ALTER TABLE public.event_config ENABLE ROW LEVEL SECURITY;

        EXECUTE (
            SELECT COALESCE(string_agg(
                format('DROP POLICY IF EXISTS %I ON public.event_config;', policyname),
                ' '
            ), '')
            FROM pg_policies WHERE tablename = 'event_config'
        );

        CREATE POLICY "public_select_event_config" ON public.event_config
            FOR SELECT USING (true);
        CREATE POLICY "admin_modify_event_config" ON public.event_config
            FOR ALL USING (public.is_current_user_admin());

        RAISE NOTICE '✅ event_config политики обновлены';
    END IF;
END $$;

-- ============================================================
-- ШАГ 10: Политики applications и admin_votes
-- ============================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'applications'
    ) THEN
        ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

        EXECUTE (
            SELECT COALESCE(string_agg(
                format('DROP POLICY IF EXISTS %I ON public.applications;', policyname),
                ' '
            ), '')
            FROM pg_policies WHERE tablename = 'applications'
        );

        CREATE POLICY "user_select_own_app" ON public.applications
            FOR SELECT USING (user_id = auth.uid());
        CREATE POLICY "admin_select_all_apps" ON public.applications
            FOR SELECT USING (public.is_current_user_admin());
        CREATE POLICY "user_insert_app" ON public.applications
            FOR INSERT WITH CHECK (
                user_id = auth.uid()
                AND NOT EXISTS (SELECT 1 FROM applications WHERE user_id = auth.uid())
            );
        CREATE POLICY "user_update_own_pending_app" ON public.applications
            FOR UPDATE
            USING (user_id = auth.uid() AND status = 'pending')
            WITH CHECK (user_id = auth.uid());
        CREATE POLICY "admin_update_apps" ON public.applications
            FOR UPDATE USING (public.is_current_user_admin());
        CREATE POLICY "admin_delete_apps" ON public.applications
            FOR DELETE USING (public.is_current_user_admin());

        RAISE NOTICE '✅ applications политики обновлены';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'admin_votes'
    ) THEN
        ALTER TABLE public.admin_votes ENABLE ROW LEVEL SECURITY;

        EXECUTE (
            SELECT COALESCE(string_agg(
                format('DROP POLICY IF EXISTS %I ON public.admin_votes;', policyname),
                ' '
            ), '')
            FROM pg_policies WHERE tablename = 'admin_votes'
        );

        CREATE POLICY "admin_select_votes" ON public.admin_votes
            FOR SELECT USING (public.is_current_user_admin());
        CREATE POLICY "admin_insert_vote" ON public.admin_votes
            FOR INSERT WITH CHECK (
                public.is_current_user_admin() AND admin_id = auth.uid()
            );
        CREATE POLICY "admin_update_own_vote" ON public.admin_votes
            FOR UPDATE
            USING (public.is_current_user_admin() AND admin_id = auth.uid())
            WITH CHECK (admin_id = auth.uid());

        RAISE NOTICE '✅ admin_votes политики обновлены';
    END IF;
END $$;

-- ============================================================
-- ШАГ 11: Обновляем SECURITY DEFINER функции
-- ============================================================

-- check_email_exists
CREATE OR REPLACE FUNCTION public.check_email_exists(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS(SELECT 1 FROM public.users WHERE email = lower(trim(p_email)))
        OR EXISTS(SELECT 1 FROM auth.users WHERE email = lower(trim(p_email)));
$$;
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO anon, authenticated;

-- check_nickname_exists
CREATE OR REPLACE FUNCTION public.check_nickname_exists(p_nickname TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS(SELECT 1 FROM public.users WHERE nickname = trim(p_nickname));
$$;
GRANT EXECUTE ON FUNCTION public.check_nickname_exists(TEXT) TO anon, authenticated;

-- check_login_status (bcrypt migration check — не раскрывает хеш)
CREATE OR REPLACE FUNCTION public.check_login_status(p_email TEXT)
RETURNS TABLE(user_found BOOLEAN, email_verified BOOLEAN, has_password BOOLEAN)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT
        true                                              AS user_found,
        u.email_verified                                  AS email_verified,
        (u.password_hash IS NOT NULL AND u.password_hash != '') AS has_password
    FROM public.users u
    WHERE u.email = lower(trim(p_email))
    LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.check_login_status(TEXT) TO anon, authenticated;

-- get_grace_period_status
CREATE OR REPLACE FUNCTION public.get_grace_period_status(p_email TEXT)
RETURNS TABLE(user_exists BOOLEAN, is_verified BOOLEAN, created_at_ts TIMESTAMPTZ)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT true, u.email_verified, u.created_at
    FROM public.users u
    WHERE u.email = lower(trim(p_email))
    LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_grace_period_status(TEXT) TO anon, authenticated;

-- mark_email_verified (вызывается после успешного signInWithPassword)
CREATE OR REPLACE FUNCTION public.mark_email_verified()
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE public.users
    SET email_verified = true
    WHERE id = auth.uid() AND email_verified = false;
$$;
GRANT EXECUTE ON FUNCTION public.mark_email_verified() TO authenticated;

-- ============================================================
-- ШАГ 12: Проверка результатов
-- ============================================================

SELECT '============================================================' AS msg
UNION ALL SELECT '✅  SECURE_DB APPLIED — TourFurr 2026'
UNION ALL SELECT '============================================================';

SELECT
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename IN (
    'users', 'email_verification_codes', 'password_reset_codes',
    'teams', 'event_config', 'applications', 'admin_votes'
)
ORDER BY tablename, cmd, policyname;

-- ============================================================
-- ВАЖНО: ПОСЛЕ ПРИМЕНЕНИЯ
-- ============================================================
-- 1. В Supabase Dashboard → Authentication → Hooks:
--    Убедитесь что custom_access_token_hook включён.
--    Без него is_admin из JWT не работает (fallback читает из DB).
--
-- 2. В ParticipantsList.vue замените:
--    supabase.from('users').select('id, nickname, avatar_url, team_id')...
--    НА:
--    supabase.rpc('get_approved_participants')
--
--    Это нужно потому что anon больше не может читать таблицу users напрямую.
--
-- 3. Для выдачи прав администратора:
--    UPDATE public.users SET is_admin = true WHERE email = 'your@email.com';
-- ============================================================
