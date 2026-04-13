-- Migration: Fix users_status_check constraint
-- Created: 2026-03-08
-- Description: Adds 'paid' and 'deferred' to the allowed values for users.status

-- Drop the old constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;

-- Add new constraint with all required statuses
ALTER TABLE users ADD CONSTRAINT users_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'paid', 'deferred'));

-- Update column comment
COMMENT ON COLUMN users.status IS 'User approval status: pending, approved, rejected, paid, or deferred';

-- Fix Ночной Дозор crest path (SVG instead of missing PNG)
INSERT INTO teams (name, slug, description, crest_url, color)
VALUES ('Ночной Дозор', 'nights-watch', 'Девиза нет. Есть клятва — но это на другой раз. И вообще мы отдыхаем.', '/images/the-wall-bg.png', '#555565')
ON CONFLICT (slug) DO UPDATE SET crest_url = '/images/the-wall-bg.png';
