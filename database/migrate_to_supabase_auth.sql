-- Migration: Update schema for Supabase Auth
-- Created: 2025-11-27
-- Description: Makes password_hash nullable since we now use Supabase Auth

-- Make password_hash nullable (no longer needed with Supabase Auth)
ALTER TABLE users
ALTER COLUMN password_hash DROP NOT NULL;

-- Update RLS policy to work with Supabase Auth
-- First drop the old policy
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new policy that works with Supabase Auth
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- Add comment
COMMENT ON COLUMN users.password_hash IS 'Legacy password hash - now managed by Supabase Auth (nullable)';
