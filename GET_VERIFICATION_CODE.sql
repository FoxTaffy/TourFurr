-- =============================================================================
-- СРОЧНО: Получить код подтверждения для существующего пользователя
-- =============================================================================
-- Используйте этот запрос в Supabase SQL Editor
-- https://supabase.com/dashboard/project/gczgcatmsrlncjbqdghu/editor
-- =============================================================================

-- Замените 'thefoxlaffytaffy@gmail.com' на ваш email
SELECT
  code,
  email,
  created_at,
  expires_at,
  used,
  attempts
FROM email_verification_codes
WHERE email = 'thefoxlaffytaffy@gmail.com'
  AND used = false
ORDER BY created_at DESC
LIMIT 1;

-- =============================================================================
-- Если код не найден или истёк, создайте новый:
-- =============================================================================

-- 1. Удалите старые коды
DELETE FROM email_verification_codes
WHERE email = 'thefoxlaffytaffy@gmail.com';

-- 2. Создайте новый код (например, 123456 для теста)
INSERT INTO email_verification_codes (email, code, expires_at)
VALUES (
  'thefoxlaffytaffy@gmail.com',
  '123456',  -- Используйте любой 6-значный код
  NOW() + INTERVAL '15 minutes'
);

-- 3. Проверьте код
SELECT code, expires_at FROM email_verification_codes
WHERE email = 'thefoxlaffytaffy@gmail.com'
  AND used = false
ORDER BY created_at DESC
LIMIT 1;
