-- ====================================================================
-- ОБНОВЛЕНИЕ ЛИМИТА УЧАСТНИКОВ: 121 → 111
-- ====================================================================
-- Запускать в: Supabase Dashboard → SQL Editor
-- ====================================================================

UPDATE event_config
SET
    max_participants = 111,
    updated_at = NOW()
WHERE is_active = true;

-- Проверка
SELECT event_name, max_participants, is_active FROM event_config WHERE is_active = true;
