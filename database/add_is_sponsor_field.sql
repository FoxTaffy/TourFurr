-- Add is_sponsor column to users table
-- Admins can mark a user as a sponsor; their nickname is displayed in gold bold everywhere.

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_sponsor BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN users.is_sponsor IS 'Whether the user is a sponsor (shown with gold bold nickname)';
