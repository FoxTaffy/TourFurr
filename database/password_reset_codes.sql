-- Password Reset Codes Table
-- This table stores 6-digit codes for password reset confirmation

CREATE TABLE IF NOT EXISTS password_reset_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL, -- 6-digit code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  used BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_email ON password_reset_codes(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_code ON password_reset_codes(code);
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_expires ON password_reset_codes(expires_at);

-- RLS Policies
ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own reset codes (for validation)
CREATE POLICY "Users can read own reset codes" ON password_reset_codes
  FOR SELECT
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Allow insert for new reset codes (public - needed for password reset)
CREATE POLICY "Anyone can insert reset codes" ON password_reset_codes
  FOR INSERT
  WITH CHECK (true);

-- Allow update for marking as used (public - needed for verification)
CREATE POLICY "Anyone can update reset codes" ON password_reset_codes
  FOR UPDATE
  USING (true);

-- Cleanup function to delete expired codes (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_reset_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_codes
  WHERE expires_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE password_reset_codes IS 'Stores 6-digit password reset codes with expiration';
COMMENT ON COLUMN password_reset_codes.code IS '6-digit numeric password reset code';
COMMENT ON COLUMN password_reset_codes.attempts IS 'Number of failed verification attempts';
COMMENT ON COLUMN password_reset_codes.used IS 'Whether this code has been successfully used';
