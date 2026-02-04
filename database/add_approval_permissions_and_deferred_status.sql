-- Migration: Add approval permissions and deferred status
-- Created: 2026-02-03
-- Description:
--   1. Adds can_approve_applications field to users table
--   2. Adds 'deferred' status to applications
--   3. Sets up permissions for Алар, Кеса, and Диеро

-- Step 1: Add approval permission field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS can_approve_applications BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_can_approve ON users(can_approve_applications);

-- Add comment
COMMENT ON COLUMN users.can_approve_applications IS 'Whether user can approve/reject/defer applications (only Alar, Kesa, and Diero)';

-- Step 2: Modify applications table to add 'deferred' status
-- First, drop the existing constraint
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;

-- Add new constraint with 'deferred' status
ALTER TABLE applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'waitlist', 'deferred'));

-- Add comment about deferred status
COMMENT ON COLUMN applications.status IS 'Application approval status: pending, approved, rejected, waitlist, or deferred (postponed for later review)';

-- Step 3: Grant approval permissions to specific users
-- NOTE: You need to replace these emails with the actual emails of Алар, Кеса, and Диеро
-- Run these commands manually after replacing the emails:

-- UPDATE users SET can_approve_applications = true WHERE email = 'alar@example.com';
-- UPDATE users SET can_approve_applications = true WHERE email = 'kesa@example.com';
-- UPDATE users SET can_approve_applications = true WHERE email = 'diero@example.com';

-- Example to grant permissions (uncomment and update with actual emails):
-- UPDATE users SET can_approve_applications = true WHERE email IN (
--   'alar_email@domain.com',
--   'kesa_email@domain.com',
--   'diero_email@domain.com'
-- );
