-- Debug: Check user account status
-- Replace 'your_email@example.com' with your actual email

-- 1. Find all records for this email
SELECT
  id,
  email,
  nickname,
  password_hash,
  email_verified,
  created_at,
  CASE
    WHEN password_hash = '' THEN '✅ Supabase Auth user'
    WHEN password_hash IS NULL THEN '⚠️ No password set'
    WHEN LENGTH(password_hash) > 0 THEN '🔐 Has bcrypt password (old user)'
  END as auth_status
FROM users
WHERE email = 'your_email@example.com';  -- ⚠️ ЗАМЕНИТЕ НА ВАШИ EMAIL!

-- 2. Check if user exists in Supabase Auth
-- Run this in Supabase Dashboard > Authentication > Users
-- Search for your email there

-- 3. Count total records for this email
SELECT
  COUNT(*) as record_count,
  CASE
    WHEN COUNT(*) = 0 THEN '❌ User not found in database'
    WHEN COUNT(*) = 1 THEN '✅ Single record (correct)'
    WHEN COUNT(*) > 1 THEN '⚠️ Duplicate records (need cleanup)'
  END as status
FROM users
WHERE email = 'your_email@example.com';  -- ⚠️ ЗАМЕНИТЕ НА ВАШИ EMAIL!
