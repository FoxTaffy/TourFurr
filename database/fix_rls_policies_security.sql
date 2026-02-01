-- ====================================================================
-- SECURITY FIX: Исправление RLS политик для защиты данных пользователей
-- ====================================================================
-- Дата: 25.01.2026
-- Проблема: Политики позволяли всем пользователям читать все данные
-- Решение: Ограничение доступа только к собственным данным
-- ====================================================================

-- ========================
-- 1. ИСПРАВЛЕНИЕ ТАБЛИЦЫ USERS
-- ========================

-- Удаляем старые небезопасные политики
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Anyone can register" ON users;

-- ✅ НОВАЯ ПОЛИТИКА: Пользователи могут читать ТОЛЬКО свои данные
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
    FOR SELECT
    USING (id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- ✅ ПОЛИТИКА: Админы могут читать все данные (для модерации)
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT
    USING (
      (current_setting('request.jwt.claims', true)::json->>'is_admin')::boolean = true
    );

-- ✅ ПОЛИТИКА: Пользователи могут обновлять ТОЛЬКО свои данные
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (id::text = current_setting('request.jwt.claims', true)::json->>'sub')
    WITH CHECK (id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- ✅ ПОЛИТИКА: Регистрация доступна всем (без аутентификации)
-- ВАЖНО: Используется только при первичной регистрации через Supabase Auth
DROP POLICY IF EXISTS "Anyone can register" ON users;
CREATE POLICY "Anyone can register" ON users
    FOR INSERT
    WITH CHECK (true);

-- ✅ ПОЛИТИКА: Только админы могут удалять пользователей
DROP POLICY IF EXISTS "Admins can delete users" ON users;
CREATE POLICY "Admins can delete users" ON users
    FOR DELETE
    USING (
      (current_setting('request.jwt.claims', true)::json->>'is_admin')::boolean = true
    );

-- ========================
-- 2. ИСПРАВЛЕНИЕ ТАБЛИЦЫ EMAIL_VERIFICATION_CODES
-- ========================

-- Удаляем старые небезопасные политики
DROP POLICY IF EXISTS "Users can read own verification codes" ON email_verification_codes;
DROP POLICY IF EXISTS "Anyone can insert verification codes" ON email_verification_codes;
DROP POLICY IF EXISTS "Anyone can update verification codes" ON email_verification_codes;

-- ✅ ПОЛИТИКА: Пользователи могут читать только свои коды верификации
-- Проверяем по email, так как при регистрации user_id еще нет
DROP POLICY IF EXISTS "Users can read own verification codes" ON email_verification_codes;
CREATE POLICY "Users can read own verification codes" ON email_verification_codes
  FOR SELECT
  USING (
    email = current_setting('request.jwt.claims', true)::json->>'email'
    OR email IN (
      SELECT email FROM users WHERE id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- ✅ ПОЛИТИКА: Коды верификации можно создавать без аутентификации
-- Нужно для регистрации новых пользователей
DROP POLICY IF EXISTS "Anyone can insert verification codes" ON email_verification_codes;
CREATE POLICY "Anyone can insert verification codes" ON email_verification_codes
  FOR INSERT
  WITH CHECK (true);

-- ✅ ПОЛИТИКА: Обновлять коды могут только сами пользователи (для своего email)
-- Это нужно для пометки кода как "использованного" после верификации
DROP POLICY IF EXISTS "Users can update own verification codes" ON email_verification_codes;
CREATE POLICY "Users can update own verification codes" ON email_verification_codes
  FOR UPDATE
  USING (
    -- Разрешаем обновление только для кодов с соответствующим email
    email = current_setting('request.jwt.claims', true)::json->>'email'
    OR email IN (
      SELECT email FROM users WHERE id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  )
  WITH CHECK (
    -- При обновлении email не должен меняться
    email = current_setting('request.jwt.claims', true)::json->>'email'
    OR email IN (
      SELECT email FROM users WHERE id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- ✅ ПОЛИТИКА: Админы могут управлять всеми кодами верификации
DROP POLICY IF EXISTS "Admins can manage all verification codes" ON email_verification_codes;
CREATE POLICY "Admins can manage all verification codes" ON email_verification_codes
  FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::json->>'is_admin')::boolean = true
  );

-- ========================
-- 3. ДОПОЛНИТЕЛЬНЫЕ МЕРЫ БЕЗОПАСНОСТИ
-- ========================

-- Добавляем функцию для автоматической очистки старых кодов
-- Запускать через pg_cron или Supabase Edge Function
CREATE OR REPLACE FUNCTION auto_cleanup_expired_codes()
RETURNS void AS $$
BEGIN
  -- Удаляем коды старше 24 часов
  DELETE FROM email_verification_codes
  WHERE expires_at < NOW() - INTERVAL '24 hours';
  
  -- Удаляем использованные коды старше 7 дней
  DELETE FROM email_verification_codes
  WHERE used = true AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Комментарии для документации
COMMENT ON POLICY "Users can view own data" ON users IS 'Пользователи могут просматривать только свои данные. Исправлено 25.01.2026';
COMMENT ON POLICY "Admins can view all users" ON users IS 'Админы имеют доступ ко всем данным для модерации';
COMMENT ON POLICY "Users can update own verification codes" ON email_verification_codes IS 'Ограничено обновление только для своего email. Исправлено 25.01.2026';
COMMENT ON FUNCTION auto_cleanup_expired_codes() IS 'Автоматическая очистка устаревших кодов верификации';

-- ========================
-- 4. ВЕРИФИКАЦИЯ ИЗМЕНЕНИЙ
-- ========================

-- Проверяем, что политики применены
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('users', 'email_verification_codes')
ORDER BY tablename, policyname;

