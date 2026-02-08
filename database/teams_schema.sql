-- Teams (Houses) System Schema for TourFurr
-- Run this in Supabase SQL Editor

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    crest_url TEXT,
    color VARCHAR(7) NOT NULL DEFAULT '#ff6b35',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_teams_slug ON teams(slug);

-- Add team_id to users table (Many-to-One: user belongs to one team)
ALTER TABLE users ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);

-- Row Level Security for teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Everyone can read teams
DROP POLICY IF EXISTS "Anyone can view teams" ON teams;
CREATE POLICY "Anyone can view teams" ON teams
    FOR SELECT
    USING (true);

-- Only admins can manage teams (insert/update/delete)
DROP POLICY IF EXISTS "Admins can manage teams" ON teams;
CREATE POLICY "Admins can manage teams" ON teams
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = current_setting('request.jwt.claims', true)::json->>'sub'
            AND users.is_admin = true
        )
    );

-- Seed default Game of Thrones houses with local crest images
INSERT INTO teams (name, slug, description, crest_url, color) VALUES
    ('Stark', 'stark', 'Winter is Coming. The noble wolves of the North, bound by honor and duty.', '/images/crests/stark.png', '#8B9DAF'),
    ('Lannister', 'lannister', 'Hear Me Roar! The golden lions of Casterly Rock, wielding power and wealth.', '/images/crests/lannister.png', '#C8A951'),
    ('Tyrell', 'tyrell', 'Growing Strong. The golden roses of Highgarden, masters of diplomacy and abundance.', '/images/crests/tyrell.png', '#2D6A4F'),
    ('Baratheon', 'baratheon', 'Ours is the Fury. The mighty stags of Storm''s End, forged in battle.', '/images/crests/baratheon.png', '#FFD700'),
    ('Martell', 'martell', 'Unbowed, Unbent, Unbroken. The sun spears of Dorne, fierce and unyielding.', '/images/crests/martell.png', '#E07A1E')
ON CONFLICT (slug) DO NOTHING;

-- Comments
COMMENT ON TABLE teams IS 'TourFurr Houses/Teams - Game of Thrones themed factions';
COMMENT ON COLUMN teams.slug IS 'URL-friendly identifier for the team';
COMMENT ON COLUMN teams.crest_url IS 'Path to team crest/icon image (e.g. /images/crests/stark.png)';
COMMENT ON COLUMN teams.color IS 'Primary hex color for the team badge';
COMMENT ON COLUMN users.team_id IS 'FK to teams table - the house the user belongs to';
