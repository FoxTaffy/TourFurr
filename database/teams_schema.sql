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

-- Seed default Game of Thrones houses
INSERT INTO teams (name, slug, description, color) VALUES
    ('Stark', 'stark', 'Winter is Coming. The noble wolves of the North, bound by honor and duty.', '#8B9DAF'),
    ('Lannister', 'lannister', 'Hear Me Roar! The golden lions of Casterly Rock, wielding power and wealth.', '#C8A951'),
    ('Targaryen', 'targaryen', 'Fire and Blood. The dragonlords of Old Valyria, born to rule.', '#8B2500'),
    ('Baratheon', 'baratheon', 'Ours is the Fury. The mighty stags of Storm''s End, forged in battle.', '#FFD700')
ON CONFLICT (slug) DO NOTHING;

-- Comments
COMMENT ON TABLE teams IS 'TourFurr Houses/Teams - Game of Thrones themed factions';
COMMENT ON COLUMN teams.slug IS 'URL-friendly identifier for the team';
COMMENT ON COLUMN teams.crest_url IS 'URL to team crest/icon image in Supabase Storage';
COMMENT ON COLUMN teams.color IS 'Primary hex color for the team badge';
COMMENT ON COLUMN users.team_id IS 'FK to teams table - the house the user belongs to';
