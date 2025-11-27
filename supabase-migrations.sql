-- Migration: Add allergies and pet fields to users table
-- Created: 2025-11-26
-- Description: Adds support for user allergies and pet information

-- Add new columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS has_allergies BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergies_description TEXT,
ADD COLUMN IF NOT EXISTS bringing_pet BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pet_description TEXT;

-- Add comments for documentation
COMMENT ON COLUMN users.has_allergies IS 'Indicates if user has allergies';
COMMENT ON COLUMN users.allergies_description IS 'Description of user allergies';
COMMENT ON COLUMN users.bringing_pet IS 'Indicates if user wants to bring a pet to the event';
COMMENT ON COLUMN users.pet_description IS 'Description of the pet (type, breed, name, special needs)';

-- Update existing users to have default values
UPDATE users
SET has_allergies = false,
    bringing_pet = false
WHERE has_allergies IS NULL OR bringing_pet IS NULL;
