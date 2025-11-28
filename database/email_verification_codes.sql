-- Email Verification Codes Table
-- This table stores 6-digit verification codes for email confirmation

CREATE TABLE IF NOT EXISTS email_verification_codes (
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
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_email ON email_verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_code ON email_verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_expires ON email_verification_codes(expires_at);

-- RLS Policies
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own verification codes (for validation)
CREATE POLICY "Users can read own verification codes" ON email_verification_codes
  FOR SELECT
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Allow insert for new verification codes (public - needed for registration)
CREATE POLICY "Anyone can insert verification codes" ON email_verification_codes
  FOR INSERT
  WITH CHECK (true);

-- Allow update for marking as used (public - needed for verification)
CREATE POLICY "Anyone can update verification codes" ON email_verification_codes
  FOR UPDATE
  USING (true);

-- Cleanup function to delete expired codes (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verification_codes
  WHERE expires_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE email_verification_codes IS 'Stores 6-digit email verification codes with expiration';
COMMENT ON COLUMN email_verification_codes.code IS '6-digit numeric verification code';
COMMENT ON COLUMN email_verification_codes.attempts IS 'Number of failed verification attempts';
COMMENT ON COLUMN email_verification_codes.used IS 'Whether this code has been successfully used';
