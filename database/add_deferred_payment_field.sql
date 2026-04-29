-- Add deferred payment field to users table
-- This allows admins to mark users who are allowed to pay after the deadline

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS can_defer_payment BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN users.can_defer_payment IS 'Indicates whether user is allowed to defer payment beyond the deadline';

-- Create index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_users_can_defer_payment ON users(can_defer_payment) WHERE can_defer_payment = true;
