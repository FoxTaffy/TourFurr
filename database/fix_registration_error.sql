-- ====================================================================
-- FIX: Исправление ошибки "Database error saving new user"
-- ====================================================================
-- Дата: 25.01.2026
-- Проблема: При регистрации через Supabase Auth возникает ошибка 500
-- Причина: Поле password_hash имеет constraint NOT NULL, но мы используем
--          Supabase Auth (не храним пароли в users таблице)
-- Решение: Сделать password_hash nullable и обновить схему
-- ====================================================================

-- ========================
-- 1. ОБНОВЛЕНИЕ СХЕМЫ ТАБЛИЦЫ USERS
-- ========================

-- Делаем password_hash nullable (теперь пароли в Supabase Auth)
ALTER TABLE users
ALTER COLUMN password_hash DROP NOT NULL;

-- Обновляем существующие записи с пустым password_hash
UPDATE users
SET password_hash = NULL
WHERE password_hash = '';

-- Добавляем комментарий
COMMENT ON COLUMN users.password_hash IS 'Устаревшее поле - пароли теперь управляются через Supabase Auth';

-- ========================
-- 2. ПРОВЕРКА И УДАЛЕНИЕ АВТОМАТИЧЕСКИХ ТРИГГЕРОВ
-- ========================

-- Проверяем, есть ли триггер на auth.users который автоматически создает пользователя
-- (Если есть - нужно удалить, так как мы создаем пользователя вручную в коде)
DO $$
BEGIN
    -- Удаляем триггер handle_new_user если существует
    IF EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        DROP TRIGGER on_auth_user_created ON auth.users;
        RAISE NOTICE 'Удален триггер on_auth_user_created';
    END IF;

    -- Удаляем функцию handle_new_user если существует
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'handle_new_user'
    ) THEN
        DROP FUNCTION handle_new_user();
        RAISE NOTICE 'Удалена функция handle_new_user';
    END IF;
END $$;

-- ========================
-- 3. ОБНОВЛЕНИЕ RLS ПОЛИТИК (если не применены)
-- ========================

-- Убедимся что политика INSERT разрешает вставку без аутентификации
DO $$
BEGIN
    -- Пересоздаем политику INSERT для регистрации
    DROP POLICY IF EXISTS "Anyone can register" ON users;
    
    CREATE POLICY "Anyone can register" ON users
        FOR INSERT
        WITH CHECK (true);
    
    RAISE NOTICE 'Политика "Anyone can register" создана/обновлена';
END $$;

-- ========================
-- 4. ДОБАВЛЕНИЕ ОТСУТСТВУЮЩИХ ПОЛЕЙ (если нужны)
-- ========================

-- Добавляем поле email_verified если не существует
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
        RAISE NOTICE 'Добавлено поле email_verified';
    END IF;
END $$;

-- Добавляем поле email_verified_at если не существует
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email_verified_at'
    ) THEN
        ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Добавлено поле email_verified_at';
    END IF;
END $$;

-- Добавляем поле is_admin если не существует
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false;
        RAISE NOTICE 'Добавлено поле is_admin';
    END IF;
END $$;

-- Добавляем поля для питомцев если не существует
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'bringing_pet'
    ) THEN
        ALTER TABLE users ADD COLUMN bringing_pet BOOLEAN DEFAULT false;
        RAISE NOTICE 'Добавлено поле bringing_pet';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'pet_description'
    ) THEN
        ALTER TABLE users ADD COLUMN pet_description TEXT;
        RAISE NOTICE 'Добавлено поле pet_description';
    END IF;
END $$;

-- ========================
-- 5. ПРОВЕРКА ИНДЕКСОВ
-- ========================

-- Создаем индексы если не существуют
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = true;

-- ========================
-- 6. ФИНАЛЬНАЯ ПРОВЕРКА
-- ========================

-- Выводим информацию о таблице users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Выводим информацию о RLS политиках
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- ========================
-- ГОТОВО!
-- ========================

SELECT 'Исправления применены успешно! Теперь регистрация должна работать.' AS status;
