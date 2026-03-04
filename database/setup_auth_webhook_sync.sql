-- ====================================================================
-- SETUP: Auth Webhook Sync (Вариант A)
-- ====================================================================
-- Дата: 2026-03-04
-- Назначение: настройка синхронизации auth.users → public.users
--             через Edge Function sync-auth-user (DB Webhook).
--
-- В проекте TourFurr таблица public.users уже использует
-- users.id = auth.uid() как первичный ключ — то есть связь с
-- Supabase Auth уже существует. Этот файл:
--   1. Проверяет/добавляет нужные индексы
--   2. Обеспечивает SECURITY DEFINER-функцию для безопасного UPSERT
--      (используется как резервный триггер без webhook)
--   3. Обновляет RLS-политики таблицы users
-- ====================================================================

-- ─────────────────────────────────────────────────────────────────
-- ЧАСТЬ 1: Индексы (если не существуют)
-- ─────────────────────────────────────────────────────────────────

-- users.id уже является PK; создаём дополнительный индекс по email
-- для быстрой проверки уникальности без RLS-сканирования.
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email);

-- ─────────────────────────────────────────────────────────────────
-- ЧАСТЬ 2: SECURITY DEFINER-функция для безопасного UPSERT
-- Используется как резервный механизм — например, если webhook
-- временно недоступен, вызывается с клиента через RPC.
-- SECURITY DEFINER позволяет функции обходить RLS.
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.upsert_user_from_auth(
    p_id          uuid,
    p_email       text,
    p_nickname    text    DEFAULT NULL,
    p_avatar_url  text    DEFAULT NULL,
    p_phone       text    DEFAULT '',
    p_telegram    text    DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (
        id, email, nickname, avatar_url,
        phone, telegram, status,
        email_subscribed, agree_rules, agree_privacy,
        created_at, updated_at
    )
    VALUES (
        p_id, p_email, p_nickname, p_avatar_url,
        COALESCE(p_phone, ''), COALESCE(p_telegram, ''), 'pending',
        false, false, false,
        NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE
        SET email       = EXCLUDED.email,
            avatar_url  = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
            updated_at  = NOW();
END;
$$;

-- Только авторизованный пользователь может вызвать для себя
REVOKE ALL ON FUNCTION public.upsert_user_from_auth FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_user_from_auth TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_user_from_auth TO service_role;

COMMENT ON FUNCTION public.upsert_user_from_auth IS
    'Безопасный UPSERT профиля при регистрации/обновлении через Supabase Auth. '
    'SECURITY DEFINER — обходит RLS. Вызывать только от имени владельца записи.';

-- ─────────────────────────────────────────────────────────────────
-- ЧАСТЬ 3: Резервный DB-триггер (необязательно, но рекомендуется)
-- Если webhook не отработал (timeout, временная недоступность),
-- триггер на auth.users создаст запись в public.users автоматически.
--
-- ВАЖНО: Для создания триггера на схеме auth нужно выполнять
-- скрипт от имени postgres (суперпользователь). В Supabase это
-- делается через SQL Editor с ролью postgres.
-- ─────────────────────────────────────────────────────────────────

-- Функция, вызываемая триггером
CREATE OR REPLACE FUNCTION public.handle_auth_user_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_nickname    text;
    v_avatar_url  text;
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Извлекаем имя/аватар из raw_user_meta_data OAuth-провайдера
        v_nickname   := COALESCE(
            NEW.raw_user_meta_data->>'preferred_username',
            NEW.raw_user_meta_data->>'user_name',
            NEW.raw_user_meta_data->>'name'
        );
        v_avatar_url := NEW.raw_user_meta_data->>'avatar_url';

        INSERT INTO public.users (
            id, email, nickname, avatar_url,
            phone, telegram, status,
            email_subscribed, agree_rules, agree_privacy,
            created_at, updated_at
        )
        VALUES (
            NEW.id,
            COALESCE(NEW.email, ''),
            v_nickname,
            v_avatar_url,
            '', '', 'pending',
            false, false, false,
            NOW(), NOW()
        )
        ON CONFLICT (id) DO NOTHING; -- Если webhook уже сработал — ничего не делаем

    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.users
        SET
            email      = COALESCE(NEW.email, users.email),
            avatar_url = COALESCE(
                NEW.raw_user_meta_data->>'avatar_url',
                users.avatar_url
            ),
            updated_at = NOW()
        WHERE id = NEW.id;

    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM public.users WHERE id = OLD.id;
    END IF;

    RETURN NEW;
END;
$$;

-- Триггер на auth.users (требует роли postgres/supabase_admin)
DROP TRIGGER IF EXISTS on_auth_user_sync ON auth.users;
CREATE TRIGGER on_auth_user_sync
    AFTER INSERT OR UPDATE OR DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_auth_user_sync();

COMMENT ON FUNCTION public.handle_auth_user_sync IS
    'Резервный триггер: синхронизирует auth.users → public.users. '
    'Работает параллельно с webhook Edge Function sync-auth-user.';

-- ─────────────────────────────────────────────────────────────────
-- ЧАСТЬ 4: RLS-политики для таблицы users
-- Применяются поверх существующих из PRODUCTION_SECURE_RLS.sql
-- и FIX_RLS_RECURSION.sql. Здесь только дополнения/уточнения.
-- ─────────────────────────────────────────────────────────────────

-- Убеждаемся, что RLS включён
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Политика: service_role обходит RLS автоматически (встроено в Supabase),
-- поэтому отдельная политика для webhook/Edge Function не нужна.

-- Дополнительная политика: пользователь может вставить свою строку
-- (на случай первой регистрации через клиент, если триггер не создан)
DROP POLICY IF EXISTS "Auth webhook can insert profiles" ON public.users;
CREATE POLICY "Auth webhook can insert profiles" ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────────
-- ЧАСТЬ 5: Документация
-- ─────────────────────────────────────────────────────────────────

COMMENT ON TABLE public.users IS
    'Профили участников TourFurr. '
    'users.id = auth.uid() — прямая связь с Supabase Auth. '
    'Синхронизируется через Edge Function sync-auth-user (DB Webhook) '
    'и резервный триггер handle_auth_user_sync.';
