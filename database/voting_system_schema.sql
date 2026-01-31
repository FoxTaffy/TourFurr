-- ====================================================================
-- VOTING SYSTEM SCHEMA (9/9 Unanimous Approval)
-- ====================================================================
-- Система коллективного апрува для заявок на участие
-- Правило: 9 из 9 голосов "За" = Approved
-- Правило: 8 из 9 голосов "За" = Waitlist
-- ====================================================================

-- ========================
-- ТАБЛИЦА: admin_votes
-- ========================
-- Хранит голоса каждого админа по каждой заявке

CREATE TABLE IF NOT EXISTS admin_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Связи
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Голос: true = За, false = Против
    vote BOOLEAN NOT NULL,

    -- Комментарий админа (опционально)
    comment TEXT,

    -- Метаданные
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Один админ = один голос на заявку
    UNIQUE(application_id, admin_id)
);

-- Индексы для быстрых запросов
CREATE INDEX IF NOT EXISTS idx_admin_votes_application ON admin_votes(application_id);
CREATE INDEX IF NOT EXISTS idx_admin_votes_admin ON admin_votes(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_votes_vote ON admin_votes(vote);

-- Автообновление updated_at
CREATE OR REPLACE FUNCTION update_admin_votes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS admin_votes_updated_at_trigger ON admin_votes;
CREATE TRIGGER admin_votes_updated_at_trigger
    BEFORE UPDATE ON admin_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_votes_updated_at();

-- ========================
-- ФУНКЦИЯ: Подсчёт голосов и автообновление статуса
-- ========================

CREATE OR REPLACE FUNCTION calculate_vote_result(app_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    total_admins INTEGER;
    votes_for INTEGER;
    votes_against INTEGER;
    new_status VARCHAR(20);
BEGIN
    -- Считаем общее количество админов (не супер-админов)
    SELECT COUNT(*) INTO total_admins
    FROM users
    WHERE is_admin = true;

    -- Считаем голоса "За"
    SELECT COUNT(*) INTO votes_for
    FROM admin_votes
    WHERE application_id = app_id AND vote = true;

    -- Считаем голоса "Против"
    SELECT COUNT(*) INTO votes_against
    FROM admin_votes
    WHERE application_id = app_id AND vote = false;

    -- Определяем новый статус
    IF votes_against > 0 THEN
        -- Хотя бы один "Против" = Отклонено
        new_status := 'rejected';
    ELSIF votes_for = 9 THEN
        -- 9 из 9 = Одобрено
        new_status := 'approved';
    ELSIF votes_for = 8 AND (votes_for + votes_against) = 9 THEN
        -- 8 из 9 (все проголосовали) = Лист ожидания
        new_status := 'waitlist';
    ELSE
        -- В процессе голосования
        new_status := 'pending';
    END IF;

    -- Обновляем статус заявки
    UPDATE applications
    SET status = new_status,
        reviewed_at = CASE WHEN new_status != 'pending' THEN NOW() ELSE reviewed_at END
    WHERE id = app_id;

    RAISE NOTICE 'Application % updated: % votes for, % votes against → status: %',
        app_id, votes_for, votes_against, new_status;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION calculate_vote_result(UUID) TO authenticated;

COMMENT ON FUNCTION calculate_vote_result IS 'Пересчитывает голоса и обновляет статус заявки';

-- ========================
-- ТРИГГЕР: Автопересчёт при голосовании
-- ========================

CREATE OR REPLACE FUNCTION trigger_recalculate_votes()
RETURNS TRIGGER AS $$
BEGIN
    -- Пересчитываем голоса для заявки
    PERFORM calculate_vote_result(
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.application_id
            ELSE NEW.application_id
        END
    );

    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS recalculate_votes_on_change ON admin_votes;
CREATE TRIGGER recalculate_votes_on_change
    AFTER INSERT OR UPDATE OR DELETE ON admin_votes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_votes();

-- ========================
-- VIEW: Сводка голосов по заявкам
-- ========================

CREATE OR REPLACE VIEW application_vote_summary AS
SELECT
    a.id AS application_id,
    a.user_id,
    a.status,
    a.motivation,
    a.created_at,
    COUNT(av.id) FILTER (WHERE av.vote = true) AS votes_for,
    COUNT(av.id) FILTER (WHERE av.vote = false) AS votes_against,
    COUNT(av.id) AS total_votes,
    9 - COUNT(av.id) AS votes_remaining,
    ROUND(COUNT(av.id) FILTER (WHERE av.vote = true)::NUMERIC / NULLIF(COUNT(av.id), 0) * 100, 1) AS approval_percentage
FROM applications a
LEFT JOIN admin_votes av ON a.id = av.application_id
GROUP BY a.id, a.user_id, a.status, a.motivation, a.created_at;

COMMENT ON VIEW application_vote_summary IS 'Сводка голосов по всем заявкам';

-- ========================
-- ФУНКЦИЯ: Получить заявки для конкретного админа
-- ========================

CREATE OR REPLACE FUNCTION get_pending_applications_for_admin(admin_user_id UUID)
RETURNS TABLE (
    application_id UUID,
    user_id UUID,
    user_nickname VARCHAR,
    user_email VARCHAR,
    motivation TEXT,
    experience_level VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    votes_for BIGINT,
    votes_against BIGINT,
    already_voted BOOLEAN
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.user_id,
        u.nickname,
        u.email,
        a.motivation,
        a.experience_level,
        a.created_at,
        COUNT(av.id) FILTER (WHERE av.vote = true) AS votes_for,
        COUNT(av.id) FILTER (WHERE av.vote = false) AS votes_against,
        EXISTS (
            SELECT 1 FROM admin_votes
            WHERE application_id = a.id AND admin_id = admin_user_id
        ) AS already_voted
    FROM applications a
    INNER JOIN users u ON a.user_id = u.id
    LEFT JOIN admin_votes av ON a.id = av.application_id
    WHERE a.status = 'pending'
    GROUP BY a.id, a.user_id, u.nickname, u.email, a.motivation, a.experience_level, a.created_at
    ORDER BY a.created_at ASC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_pending_applications_for_admin(UUID) TO authenticated;

-- ========================
-- ФУНКЦИЯ: Force Approve (только для super admin)
-- ========================

CREATE OR REPLACE FUNCTION force_approve_application(
    app_id UUID,
    super_admin_id UUID
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    is_super_admin BOOLEAN;
BEGIN
    -- Проверяем что пользователь - супер админ
    SELECT is_admin INTO is_super_admin
    FROM users
    WHERE id = super_admin_id AND is_admin = true;

    IF NOT is_super_admin THEN
        RAISE EXCEPTION 'Only super admin can force approve applications';
    END IF;

    -- Принудительно одобряем заявку
    UPDATE applications
    SET status = 'approved',
        reviewed_by = super_admin_id,
        reviewed_at = NOW(),
        admin_notes = COALESCE(admin_notes || E'\n', '') || '[FORCE APPROVED by super admin]'
    WHERE id = app_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION force_approve_application(UUID, UUID) TO authenticated;

-- ========================
-- RLS ПОЛИТИКИ ДЛЯ admin_votes
-- ========================

ALTER TABLE admin_votes ENABLE ROW LEVEL SECURITY;

-- Админы могут видеть все голоса
CREATE POLICY "Admins can view all votes" ON admin_votes
    FOR SELECT
    USING (is_admin_user(auth.uid()));

-- Админы могут голосовать (создавать свои голоса)
CREATE POLICY "Admins can create their votes" ON admin_votes
    FOR INSERT
    WITH CHECK (
        is_admin_user(auth.uid())
        AND admin_id = auth.uid()
        -- Нельзя голосовать дважды (проверка через UNIQUE constraint)
    );

-- Админы МОГУТ изменить свой голос (опционально)
CREATE POLICY "Admins can update their own votes" ON admin_votes
    FOR UPDATE
    USING (
        is_admin_user(auth.uid())
        AND admin_id = auth.uid()
    )
    WITH CHECK (
        is_admin_user(auth.uid())
        AND admin_id = auth.uid()
    );

-- Админы НЕ МОГУТ удалять голоса (для аудита)
-- Если нужно - раскомментируйте:
-- CREATE POLICY "Admins cannot delete votes" ON admin_votes
--     FOR DELETE
--     USING (false);

-- ========================
-- ТЕСТОВЫЕ ДАННЫЕ (опционально)
-- ========================

-- Раскомментируйте для создания тестовых данных:
/*
-- Создать 9 админов для тестирования
DO $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..9 LOOP
        INSERT INTO users (email, nickname, phone, telegram, is_admin, status, email_verified)
        VALUES (
            'admin' || i || '@test.com',
            'Admin' || i,
            '+7900000000' || i,
            '@admin' || i,
            true,
            'approved',
            true
        )
        ON CONFLICT (email) DO NOTHING;
    END LOOP;
END $$;
*/

-- ========================
-- ВЫВОД РЕЗУЛЬТАТОВ
-- ========================

SELECT '========================================';
SELECT '✅ VOTING SYSTEM SCHEMA CREATED';
SELECT '========================================';

SELECT
    'TABLES CREATED' as section,
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('admin_votes')
ORDER BY table_name;

SELECT
    'FUNCTIONS CREATED' as section,
    routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN (
        'calculate_vote_result',
        'get_pending_applications_for_admin',
        'force_approve_application',
        'trigger_recalculate_votes'
    )
ORDER BY routine_name;

SELECT '
================================================================================
🗳️  СИСТЕМА ГОЛОСОВАНИЯ 9/9 СОЗДАНА
================================================================================

Создано:

1. ✅ Таблица admin_votes
   - Хранит голоса каждого админа
   - UNIQUE constraint: один админ = один голос

2. ✅ Функция calculate_vote_result()
   - Автоматически пересчитывает голоса
   - Правила:
     * 9/9 За = Approved
     * 8/9 За (все проголосовали) = Waitlist
     * Хотя бы 1 Против = Rejected
     * Иначе = Pending

3. ✅ Триггер автопересчёта
   - Срабатывает при каждом голосе
   - Обновляет статус заявки автоматически

4. ✅ VIEW application_vote_summary
   - Сводка голосов по всем заявкам
   - Процент одобрения
   - Оставшиеся голоса

5. ✅ Функция get_pending_applications_for_admin()
   - Возвращает заявки для конкретного админа
   - Показывает проголосовал ли уже

6. ✅ Функция force_approve_application()
   - Принудительное одобрение (только super admin)

7. ✅ RLS политики
   - Админы видят все голоса
   - Админы могут голосовать
   - Админы могут изменить свой голос

================================================================================

API ЗАПРОСЫ (примеры):

1. Голосование админа:
   INSERT INTO admin_votes (application_id, admin_id, vote, comment)
   VALUES (\'app-uuid\', \'admin-uuid\', true, \'Looks good!\');

2. Получить заявки для админа:
   SELECT * FROM get_pending_applications_for_admin(\'admin-uuid\');

3. Просмотр сводки голосов:
   SELECT * FROM application_vote_summary WHERE application_id = \'app-uuid\';

4. Force approve (super admin):
   SELECT force_approve_application(\'app-uuid\', \'super-admin-uuid\');

================================================================================
' as instructions;
