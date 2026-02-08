-- Schedule Events System for TourFurr
-- Run this in Supabase SQL Editor

-- Schedule Events table
CREATE TABLE IF NOT EXISTS schedule_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 4),
    day_date DATE NOT NULL,
    start_time TIME NOT NULL,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    host VARCHAR(255),
    category VARCHAR(50) DEFAULT 'event' CHECK (category IN (
        'registration', 'meal', 'ceremony', 'meeting', 'event',
        'entertainment', 'exercise', 'checkout'
    )),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_schedule_day ON schedule_events(day_number);
CREATE INDEX IF NOT EXISTS idx_schedule_datetime ON schedule_events(day_date, start_time);
CREATE INDEX IF NOT EXISTS idx_schedule_sort ON schedule_events(day_number, sort_order);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_schedule_events_updated_at ON schedule_events;
CREATE TRIGGER update_schedule_events_updated_at
    BEFORE UPDATE ON schedule_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE schedule_events ENABLE ROW LEVEL SECURITY;

-- Approved users can view schedule
DROP POLICY IF EXISTS "Approved users can view schedule" ON schedule_events;
CREATE POLICY "Approved users can view schedule" ON schedule_events
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = current_setting('request.jwt.claims', true)::json->>'sub'
            AND users.status = 'approved'
        )
        OR
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = current_setting('request.jwt.claims', true)::json->>'sub'
            AND users.is_admin = true
        )
    );

-- Admins can manage schedule
DROP POLICY IF EXISTS "Admins can manage schedule" ON schedule_events;
CREATE POLICY "Admins can manage schedule" ON schedule_events
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = current_setting('request.jwt.claims', true)::json->>'sub'
            AND users.is_admin = true
        )
    );

-- Enable Realtime for schedule_events
ALTER PUBLICATION supabase_realtime ADD TABLE schedule_events;

-- ============================================================
-- SEED DATA: TourFurr 3 Schedule (August 6-9, 2026)
-- ============================================================

-- Day 1 (06.08.2026)
INSERT INTO schedule_events (day_number, day_date, start_time, title, location, host, category, sort_order) VALUES
(1, '2026-08-06', '15:00', 'Регистрация', 'Спавн', 'Кеса, Алар, Чоджи', 'registration', 1),
(1, '2026-08-06', '16:00', 'Знакомство с Королевскими Землями', NULL, NULL, 'event', 2),
(1, '2026-08-06', '18:00', 'Ивент', NULL, NULL, 'event', 3),
(1, '2026-08-06', '19:00', 'Ужин', 'Таверна', 'Чиффа', 'meal', 4),
(1, '2026-08-06', '20:00', 'Открытие', 'Сцена', 'ВСЕ', 'ceremony', 5),
(1, '2026-08-06', '21:00', 'Собрание Великого Дома', 'Кемпфаер лагеря', 'Кураторы, Алар, Рафф', 'meeting', 6),
(1, '2026-08-06', '22:00', 'Алкоивент и открытие бара', 'Бар', 'Фоксик, Такета', 'entertainment', 7),
(1, '2026-08-06', '23:00', 'Ночной ивент', NULL, NULL, 'event', 8),
(1, '2026-08-07', '00:00', 'Ночной ивент', NULL, NULL, 'event', 9);

-- Day 2 (07.08.2026)
INSERT INTO schedule_events (day_number, day_date, start_time, title, location, host, category, sort_order) VALUES
(2, '2026-08-07', '10:00', 'Зарядка', NULL, 'Алар', 'exercise', 1),
(2, '2026-08-07', '11:00', 'Завтрак', 'Таверна', 'Чиффа', 'meal', 2),
(2, '2026-08-07', '12:00', 'Собрание Великого Дома', 'Кемпфаер лагеря', 'Кураторы, Алар, Рафф', 'meeting', 3),
(2, '2026-08-07', '13:00', 'Ивент', NULL, NULL, 'event', 4),
(2, '2026-08-07', '14:00', 'Квиз', NULL, NULL, 'event', 5),
(2, '2026-08-07', '15:00', 'Обед', 'Таверна', 'Чиффа', 'meal', 6),
(2, '2026-08-07', '16:00', 'Собрание Великого Дома', 'Кемпфаер лагеря', 'Кураторы, Алар, Рафф', 'meeting', 7),
(2, '2026-08-07', '17:00', 'Плюш-игры', NULL, NULL, 'entertainment', 8),
(2, '2026-08-07', '18:00', 'Ивент', NULL, NULL, 'event', 9),
(2, '2026-08-07', '19:00', 'Ужин', 'Таверна', 'Чиффа', 'meal', 10),
(2, '2026-08-07', '20:00', 'Собрание Великого Дома', 'Кемпфаер лагеря', 'Кураторы, Алар, Рафф', 'meeting', 11),
(2, '2026-08-07', '21:00', 'Ивент', NULL, NULL, 'event', 12),
(2, '2026-08-07', '22:00', 'Открытие бара и дискотеки', NULL, NULL, 'entertainment', 13),
(2, '2026-08-07', '23:00', 'Ивент', NULL, NULL, 'event', 14),
(2, '2026-08-08', '00:00', 'Алкоивент', NULL, NULL, 'entertainment', 15),
(2, '2026-08-08', '01:00', 'Ночной ивент', NULL, NULL, 'event', 16),
(2, '2026-08-08', '02:00', 'Ночной ивент', NULL, NULL, 'event', 17);

-- Day 3 (08.08.2026)
INSERT INTO schedule_events (day_number, day_date, start_time, title, location, host, category, sort_order) VALUES
(3, '2026-08-08', '10:00', 'Зарядка', NULL, NULL, 'exercise', 1),
(3, '2026-08-08', '11:00', 'Завтрак', NULL, NULL, 'meal', 2),
(3, '2026-08-08', '12:00', 'Собрание Великого Дома', 'Кемпфаер лагеря', 'Кураторы, Алар, Рафф', 'meeting', 3),
(3, '2026-08-08', '13:00', 'Чайная церемония с леди Мышкой', NULL, NULL, 'event', 4),
(3, '2026-08-08', '14:00', 'Ивент', NULL, NULL, 'event', 5),
(3, '2026-08-08', '15:00', 'Обед', 'Таверна', 'Чиффа', 'meal', 6),
(3, '2026-08-08', '16:00', 'Собрание Великого Дома', 'Кемпфаер лагеря', 'Кураторы, Алар, Рафф', 'meeting', 7),
(3, '2026-08-08', '17:00', 'Ивент', NULL, NULL, 'event', 8),
(3, '2026-08-08', '18:00', 'Аукцион', NULL, NULL, 'entertainment', 9),
(3, '2026-08-08', '19:00', 'Ужин', 'Таверна', 'Чиффа', 'meal', 10),
(3, '2026-08-08', '20:00', 'Собрание Великого Дома', 'Кемпфаер лагеря', 'Кураторы, Алар, Рафф', 'meeting', 11),
(3, '2026-08-08', '21:00', 'Ивент', NULL, NULL, 'event', 12),
(3, '2026-08-08', '22:00', 'Пив-понг и открытие бара', NULL, NULL, 'entertainment', 13),
(3, '2026-08-08', '23:00', 'Церемония закрытия', NULL, NULL, 'ceremony', 14);

-- Day 4 (09.08.2026)
INSERT INTO schedule_events (day_number, day_date, start_time, title, location, host, category, sort_order) VALUES
(4, '2026-08-09', '10:00', 'Зарядка', NULL, NULL, 'exercise', 1),
(4, '2026-08-09', '11:00', 'Завтрак', NULL, NULL, 'meal', 2),
(4, '2026-08-09', '12:00', 'Общее фото', NULL, NULL, 'ceremony', 3),
(4, '2026-08-09', '13:00', 'Выезд участников', NULL, NULL, 'checkout', 4);

-- Comments
COMMENT ON TABLE schedule_events IS 'TourFurr 3: Game of Thrones - Event Schedule';
COMMENT ON COLUMN schedule_events.day_number IS 'Day number (1-4)';
COMMENT ON COLUMN schedule_events.category IS 'Event category for styling and filtering';
COMMENT ON COLUMN schedule_events.sort_order IS 'Order within a day for correct display';
