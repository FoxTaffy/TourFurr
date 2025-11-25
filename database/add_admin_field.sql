-- Add is_admin field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create index for admin lookups
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Update RLS policy to allow admins to view all data
DROP POLICY IF EXISTS "Admins can view all data" ON users;
CREATE POLICY "Admins can view all data" ON users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id::text = current_setting('request.jwt.claims', true)::json->>'sub'
            AND u.is_admin = true
        )
    );

-- Update RLS policy to allow admins to update all data
DROP POLICY IF EXISTS "Admins can update all data" ON users;
CREATE POLICY "Admins can update all data" ON users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id::text = current_setting('request.jwt.claims', true)::json->>'sub'
            AND u.is_admin = true
        )
    );

COMMENT ON COLUMN users.is_admin IS 'Whether user has admin privileges';
