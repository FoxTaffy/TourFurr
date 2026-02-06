-- =====================================================
-- FIX: Password Reset Codes RLS Policies (Updated)
-- =====================================================
-- Execute this SQL in Supabase Dashboard > SQL Editor
-- This version safely handles existing policies
-- =====================================================

-- Enable RLS if not already enabled
ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (comprehensive list)
DO $$
BEGIN
    -- Drop all possible policy names
    DROP POLICY IF EXISTS "Users can read own reset codes" ON password_reset_codes;
    DROP POLICY IF EXISTS "Anyone can insert reset codes" ON password_reset_codes;
    DROP POLICY IF EXISTS "Anyone can update reset codes" ON password_reset_codes;
    DROP POLICY IF EXISTS "Anyone can read reset codes" ON password_reset_codes;
    DROP POLICY IF EXISTS "Service role can do anything" ON password_reset_codes;
    DROP POLICY IF EXISTS "Enable read access for all users" ON password_reset_codes;
    DROP POLICY IF EXISTS "Enable insert access for all users" ON password_reset_codes;
    DROP POLICY IF EXISTS "Enable update access for all users" ON password_reset_codes;
END $$;

-- Create new policies
-- Allow anyone to insert reset codes (needed for password reset flow)
CREATE POLICY "Anyone can insert reset codes" ON password_reset_codes
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read reset codes (needed for verification)
-- Note: Codes are hashed with SHA-256, so this is secure
CREATE POLICY "Anyone can read reset codes" ON password_reset_codes
  FOR SELECT
  USING (true);

-- Allow anyone to update reset codes (needed for marking as used/incrementing attempts)
CREATE POLICY "Anyone can update reset codes" ON password_reset_codes
  FOR UPDATE
  USING (true);

-- =====================================================
-- Verification Query (run this after to confirm)
-- =====================================================
-- SELECT tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE tablename = 'password_reset_codes';
-- =====================================================
