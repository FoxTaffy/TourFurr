-- ====================================================================
-- REGISTRATION FIX: RPC functions + GRANT safety net
-- ====================================================================
-- Запустить в Supabase Dashboard → SQL Editor
-- ====================================================================

-- ========================
-- 1. GRANT на таблицу users (safety net — если были сброшены)
-- ========================
GRANT SELECT, INSERT ON TABLE public.users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;

-- ========================
-- 2. check_email_exists — проверка email в обеих таблицах
-- ========================
CREATE OR REPLACE FUNCTION check_email_exists(p_email TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users WHERE email = lower(trim(p_email))
    ) OR EXISTS (
        SELECT 1 FROM auth.users WHERE email = lower(trim(p_email))
    );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION check_email_exists(TEXT) TO anon, authenticated;
COMMENT ON FUNCTION check_email_exists IS 'Проверяет существование email в users и auth.users';

-- ========================
-- 3. check_nickname_exists — проверка никнейма
-- ========================
CREATE OR REPLACE FUNCTION check_nickname_exists(p_nickname TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users WHERE nickname = trim(p_nickname)
    );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION check_nickname_exists(TEXT) TO anon, authenticated;
COMMENT ON FUNCTION check_nickname_exists IS 'Проверяет существование никнейма в users';

-- ========================
-- 4. register_user — безопасная регистрация через RPC
-- ========================
-- Обходит RLS полностью через SECURITY DEFINER.
-- Вызывается из фронтенда после успешного supabase.auth.signUp().
CREATE OR REPLACE FUNCTION register_user(
    p_id UUID,
    p_email TEXT,
    p_nickname TEXT,
    p_phone TEXT,
    p_telegram TEXT,
    p_avatar_url TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_agree_rules BOOLEAN DEFAULT false,
    p_agree_privacy BOOLEAN DEFAULT false,
    p_bringing_pet BOOLEAN DEFAULT false,
    p_pet_description TEXT DEFAULT NULL
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Защита: запрет создания админа через регистрацию
    INSERT INTO users (
        id, email, password_hash, nickname, phone, telegram,
        avatar_url, description, status, email_verified,
        agree_rules, agree_privacy, bringing_pet, pet_description
    ) VALUES (
        p_id, lower(trim(p_email)), '', trim(p_nickname), p_phone, p_telegram,
        p_avatar_url, p_description, 'pending', false,
        p_agree_rules, p_agree_privacy, p_bringing_pet, p_pet_description
    );

    v_result := json_build_object(
        'success', true,
        'id', p_id,
        'email', lower(trim(p_email))
    );
    RETURN v_result;

EXCEPTION
    WHEN unique_violation THEN
        -- Определяем какое поле нарушило уникальность
        IF SQLERRM LIKE '%nickname%' THEN
            RETURN json_build_object('success', false, 'error', 'nickname_taken');
        ELSIF SQLERRM LIKE '%email%' THEN
            RETURN json_build_object('success', false, 'error', 'email_taken');
        ELSE
            RETURN json_build_object('success', false, 'error', 'duplicate');
        END IF;
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION register_user(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, TEXT) TO anon, authenticated;
COMMENT ON FUNCTION register_user IS 'Безопасная регистрация пользователя (обходит RLS через SECURITY DEFINER)';
