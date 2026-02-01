-- Create event_info table for secret approved user information
CREATE TABLE IF NOT EXISTS event_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location TEXT NOT NULL,
  location_note TEXT,
  coordinates TEXT,  -- Format: "longitude,latitude" for Yandex Maps
  price INTEGER NOT NULL,
  bank TEXT NOT NULL,
  card_number TEXT NOT NULL,
  recipient TEXT NOT NULL,
  payment_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE event_info ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read for all (we check status in app)
CREATE POLICY "Allow read event info"
  ON event_info
  FOR SELECT
  USING (true);

-- Insert initial event info with coordinates
-- Coordinates format: "longitude,latitude" (e.g., "37.6173,55.7558" for Moscow)
INSERT INTO event_info (
  location,
  location_note,
  coordinates,
  price,
  bank,
  card_number,
  recipient,
  payment_note
) VALUES (
  'Ярославская область',
  'Точные координаты будут отправлены за неделю до мероприятия',
  '39.108398,56.905351',  -- Ярославская область
  3500,
  'Сбербанк',
  '2202 2061 7891 2345',
  'Иванов И.И.',
  'В комментарии укажите ваш никнейм'
);

-- If table already exists, add coordinates column:
-- ALTER TABLE event_info ADD COLUMN coordinates TEXT;
-- UPDATE event_info SET coordinates = '39.108398,56.905351';
