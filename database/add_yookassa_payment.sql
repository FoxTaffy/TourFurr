-- Migration: Add YooKassa payment integration fields
-- This adds the yookassa_payment_id column to track online payments

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS yookassa_payment_id TEXT;

-- Index for faster lookup by payment ID
CREATE INDEX IF NOT EXISTS idx_applications_yookassa_payment_id
  ON applications(yookassa_payment_id)
  WHERE yookassa_payment_id IS NOT NULL;

COMMENT ON COLUMN applications.yookassa_payment_id IS 'YooKassa payment ID for online payment tracking';
