-- Create event_info table for secret approved user information
CREATE TABLE IF NOT EXISTS event_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location TEXT NOT NULL,
  coordinates TEXT,  -- Format: "longitude,latitude" for Yandex Maps
  price INTEGER NOT NULL,
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
INSERT INTO event_info (
  location,
  coordinates,
  price
);
