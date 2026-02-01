-- TourFurr Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(30) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    telegram VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    email_subscribed BOOLEAN DEFAULT false,
    agree_rules BOOLEAN DEFAULT false,
    agree_privacy BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
    FOR SELECT
    USING (true);

-- Policy: Users can update their own data
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy: Anyone can insert (for registration)
DROP POLICY IF EXISTS "Anyone can register" ON users;
CREATE POLICY "Anyone can register" ON users
    FOR INSERT
    WITH CHECK (true);

-- Storage bucket for avatars (run separately in Supabase Dashboard > Storage)
-- CREATE BUCKET avatars;

-- Comments for documentation
COMMENT ON TABLE users IS 'TourFurr convention attendees';
COMMENT ON COLUMN users.status IS 'Registration status: pending, approved, rejected';
COMMENT ON COLUMN users.telegram IS 'Telegram username in format t.me/username';
