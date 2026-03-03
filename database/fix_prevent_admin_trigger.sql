-- ====================================================================
-- ИСПРАВЛЕНИЕ ТРИГГЕРА prevent_admin_modification
-- ====================================================================
-- Проблема: триггер выбрасывает исключение при любом UPDATE на таблице
-- users, даже когда поле is_admin не изменяется.
-- Причина: вероятно, неправильная логика без проверки IS DISTINCT FROM,
-- либо NULL != false воспринимается как изменение.
-- ====================================================================
-- Запускать через: Supabase Dashboard → SQL Editor
-- ====================================================================

-- Шаг 1: Удаляем старый триггер
-- Имя триггера в Supabase: trigger_prevent_admin_modification
DROP TRIGGER IF EXISTS trigger_prevent_admin_modification ON users;
DROP TRIGGER IF EXISTS prevent_admin_modification ON users;
DROP FUNCTION IF EXISTS prevent_admin_modification() CASCADE;

-- Шаг 2: Создаём исправленную функцию
-- Срабатывает ТОЛЬКО когда значение is_admin реально меняется.
-- Разрешает изменение: service_role (Edge Functions, backend),
--                      postgres (Supabase internal),
--                      а также текущий admin (через auth.uid()).
CREATE OR REPLACE FUNCTION prevent_admin_modification()
RETURNS TRIGGER AS $$
BEGIN
  -- Игнорируем строки, где is_admin не изменился (включая NULL vs NULL)
  IF NEW.is_admin IS NOT DISTINCT FROM OLD.is_admin THEN
    RETURN NEW;
  END IF;

  -- is_admin меняется — проверяем право
  -- Разрешаем service_role / postgres (Supabase internal operations)
  IF current_user IN ('postgres', 'supabase_admin', 'service_role') THEN
    RETURN NEW;
  END IF;

  -- Разрешаем текущему авторизованному администратору
  IF EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND is_admin = true
    LIMIT 1
  ) THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Cannot modify admin status';
END;
$$ LANGUAGE plpgsql
   SECURITY DEFINER
   SET search_path = public;

-- Шаг 3: Пересоздаём триггер
CREATE TRIGGER prevent_admin_modification
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_admin_modification();

-- ====================================================================
-- ПРОВЕРКА (опционально — запустить после основного скрипта)
-- ====================================================================
-- Этот SELECT проверяет что триггер существует:
-- SELECT tgname, tgenabled FROM pg_trigger
-- WHERE tgrelid = 'users'::regclass AND tgname = 'prevent_admin_modification';
