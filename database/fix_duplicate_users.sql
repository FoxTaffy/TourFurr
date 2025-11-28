-- Fix: Remove duplicate user records caused by migration
-- Created: 2025-11-27
-- Description: Fixes duplicate user records that cause "more than one row returned" error

-- IMPORTANT: Backup your data before running this!

-- Step 1: Find and display duplicates (для проверки)
-- Uncomment to see duplicates before fixing:
/*
SELECT email, COUNT(*) as count, array_agg(id) as user_ids
FROM users
GROUP BY email
HAVING COUNT(*) > 1;
*/

-- Step 2: Create a temporary table to store users to keep
CREATE TEMP TABLE users_to_keep AS
SELECT DISTINCT ON (email)
  id,
  email
FROM users
WHERE email_verified = true  -- Keep verified users
  OR password_hash = ''       -- Keep Supabase Auth users (password_hash is empty)
ORDER BY email, created_at DESC;  -- Keep the most recent one

-- Step 3: Delete duplicate users (keeping only the ones in users_to_keep)
DELETE FROM users
WHERE id NOT IN (SELECT id FROM users_to_keep);

-- Step 4: Verify no more duplicates
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ No duplicates found'
    ELSE '⚠️ Still have duplicates!'
  END as status,
  COUNT(*) as duplicate_count
FROM (
  SELECT email, COUNT(*) as count
  FROM users
  GROUP BY email
  HAVING COUNT(*) > 1
) duplicates;

-- Step 5: Show remaining users count
SELECT COUNT(*) as total_users FROM users;
