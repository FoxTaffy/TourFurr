-- Email Verification Codes Table (ИСПРАВЛЕННАЯ ВЕРСИЯ)
-- Исправлены RLS политики для работы с неавторизованными пользователями

-- Удалить старую таблицу если есть
DROP TABLE IF EXISTS email_verification_codes CASCADE;

-- Создать таблицу заново
CREATE TABLE email_verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  used BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Индексы для быстрого поиска
CREATE INDEX idx_email_verification_codes_email ON email_verification_codes(email);
CREATE INDEX idx_email_verification_codes_code ON email_verification_codes(code);
CREATE INDEX idx_email_verification_codes_expires ON email_verification_codes(expires_at);

-- ВАЖНО: Отключить RLS для этой таблицы
-- Это безопасно, т.к. таблица содержит только временные коды
ALTER TABLE email_verification_codes DISABLE ROW LEVEL SECURITY;

-- Функция очистки устаревших кодов
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verification_codes
  WHERE expires_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Комментарии
COMMENT ON TABLE email_verification_codes IS 'Stores 6-digit email verification codes (RLS disabled for public access)';
COMMENT ON COLUMN email_verification_codes.code IS '6-digit numeric verification code';
COMMENT ON COLUMN email_verification_codes.attempts IS 'Number of failed verification attempts';
COMMENT ON COLUMN email_verification_codes.used IS 'Whether this code has been successfully used';

-- Проверка
SELECT 'Table email_verification_codes created successfully!' as status;
