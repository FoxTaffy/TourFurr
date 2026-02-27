-- Create event_info table for secret approved user information
CREATE TABLE IF NOT EXISTS event_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location TEXT NOT NULL,
  coordinates TEXT,  -- Format: "longitude,latitude" for Yandex Maps
  price INTEGER NOT NULL,
  telegram_link TEXT,  -- Private Telegram invite link (approved/paid users only)
  payment_url TEXT,    -- Payment link, e.g. T-Bank (approved/paid users only)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE event_info ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read only for authenticated approved/paid users
CREATE POLICY "Allow read event info for approved users"
  ON event_info
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM users u
      WHERE u.id = auth.uid()
        AND u.status IN ('approved', 'paid')
    )
  );

-- Insert initial event info with coordinates
INSERT INTO event_info (
  location,
  coordinates,
  price
);
