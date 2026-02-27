-- Event configuration table
-- Stores event-wide settings like registration dates, participant limits, etc.

CREATE TABLE IF NOT EXISTS event_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(255) NOT NULL,
    event_year INTEGER NOT NULL,

    -- Event dates
    event_start_date DATE NOT NULL,
    event_end_date DATE NOT NULL,

    -- Registration settings
    registration_open_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_close_date TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER NOT NULL DEFAULT 121,
    waitlist_enabled BOOLEAN DEFAULT true,

    -- Payment settings
    payment_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    event_price DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'RUB',

    -- Location
    location_name TEXT,
    location_address TEXT,
    location_coordinates TEXT, -- Format: "longitude,latitude"
    location_notes TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partial unique index: Only one active event per year
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_config_one_active_per_year
    ON event_config(event_year)
    WHERE is_active = true;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_event_config_active ON event_config(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_event_config_year ON event_config(event_year);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
DROP TRIGGER IF EXISTS event_config_updated_at_trigger ON event_config;
CREATE TRIGGER event_config_updated_at_trigger
    BEFORE UPDATE ON event_config
    FOR EACH ROW
    EXECUTE FUNCTION update_event_config_updated_at();

-- Insert default configuration for TourFurr 2026
INSERT INTO event_config (
    event_name,
    event_year,
    event_start_date,
    event_end_date,
    registration_open_date,
    registration_close_date,
    max_participants,
    waitlist_enabled,
    payment_deadline,
    event_price,
    currency,
    is_active
) VALUES (
    'TourFurr 2026',
    2026,
    '2026-08-06',
    '2026-08-09',
    '2026-03-01 00:00:00+00',
    '2026-05-30 23:59:59+00',
    121,
    true,
    '2026-05-30 23:59:59+00',
    NULL, -- Will be configured later
    'RUB',
    true
) ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE event_config IS 'Configuration for TourFurr events';
COMMENT ON COLUMN event_config.registration_open_date IS 'Registration opens March 1, 2026';
COMMENT ON COLUMN event_config.max_participants IS 'Maximum number of participants (121)';
COMMENT ON COLUMN event_config.payment_deadline IS 'Full payment deadline (May 30, 2026)';
COMMENT ON COLUMN event_config.waitlist_enabled IS 'Allow waitlist when max participants reached';
