-- Create event_info table for secret approved user information
CREATE TABLE IF NOT EXISTS event_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location TEXT NOT NULL,
  location_note TEXT,
  price INTEGER NOT NULL,
  bank TEXT NOT NULL,
  card_number TEXT NOT NULL,
  recipient TEXT NOT NULL,
  payment_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE event_info ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read for all authenticated users (we check status in app)
CREATE POLICY "Allow read event info"
  ON event_info
  FOR SELECT
  USING (true);

-- Insert initial event info
INSERT INTO event_info (
  location,
  location_note,
  price,
  bank,
  card_number,
  recipient,
  payment_note
) VALUES (
  'Московская область, Дмитровский район',
  'Точные координаты будут отправлены за неделю до мероприятия',
  3500,
  'Сбербанк',
  '2202 2061 7891 2345',
  'Иванов И.И.',
  'В комментарии укажите ваш никнейм'
);
