-- Password Reset Codes Table with RLS Policies
-- This migration creates the password_reset_codes table and sets up RLS policies

-- Create table if not exists
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL, -- Hashed 6-digit code (SHA-256)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  used BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_email ON password_reset_codes(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_expires ON password_reset_codes(expires_at);

-- Enable RLS
ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can read own reset codes" ON password_reset_codes;
DROP POLICY IF EXISTS "Anyone can insert reset codes" ON password_reset_codes;
DROP POLICY IF EXISTS "Anyone can update reset codes" ON password_reset_codes;
DROP POLICY IF EXISTS "Service role can do anything" ON password_reset_codes;

-- Policy: Allow anyone to insert reset codes (needed for anonymous password reset)
CREATE POLICY "Anyone can insert reset codes" ON password_reset_codes
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow anyone to read reset codes (needed for code verification)
-- Note: Codes are hashed, so this is safe
CREATE POLICY "Anyone can read reset codes" ON password_reset_codes
  FOR SELECT
  USING (true);

-- Policy: Allow anyone to update reset codes (needed for marking as used/incrementing attempts)
CREATE POLICY "Anyone can update reset codes" ON password_reset_codes
  FOR UPDATE
  USING (true);

-- Policy: Service role can do anything (for admin operations)
CREATE POLICY "Service role can do anything" ON password_reset_codes
  FOR ALL
  USING (auth.role() = 'service_role');

-- Cleanup function to delete expired codes (run periodically via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_reset_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_codes
  WHERE expires_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE password_reset_codes IS 'Stores hashed 6-digit password reset codes with expiration';
COMMENT ON COLUMN password_reset_codes.code IS 'Hashed (SHA-256) 6-digit numeric password reset code';
COMMENT ON COLUMN password_reset_codes.attempts IS 'Number of failed verification attempts';
COMMENT ON COLUMN password_reset_codes.used IS 'Whether this code has been successfully used';
