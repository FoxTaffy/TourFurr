-- ====================================================================
-- RPC FUNCTION: check_email_exists
-- ====================================================================
-- Безопасная проверка существования email для формы регистрации.
-- Проверяет ОБЕ таблицы: users И auth.users.
-- Это решает проблему "осиротевших" аккаунтов в auth.users,
-- которые не видны при проверке только таблицы users.
-- ====================================================================

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

-- Даём права на выполнение для анонимных и авторизованных пользователей
GRANT EXECUTE ON FUNCTION check_email_exists(TEXT) TO anon, authenticated;

COMMENT ON FUNCTION check_email_exists IS 'Проверяет существование email в users и auth.users (для формы регистрации)';
