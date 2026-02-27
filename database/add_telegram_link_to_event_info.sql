-- Migration: add telegram_link and payment_url to event_info
-- These fields are confidential and should only be visible to approved/paid participants.

ALTER TABLE event_info
  ADD COLUMN IF NOT EXISTS telegram_link TEXT,
  ADD COLUMN IF NOT EXISTS payment_url TEXT;

-- Drop the overly permissive read policy and replace it with one that
-- requires the authenticated user to have an approved or paid status.
DROP POLICY IF EXISTS "Allow read event info" ON event_info;

CREATE POLICY "Allow read event info for approved users"
  ON event_info
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM users u
      WHERE u.id = auth.uid()
        AND u.status IN ('approved', 'paid')
    )
  );

COMMENT ON COLUMN event_info.telegram_link IS 'Private Telegram group/channel invite link – visible to approved/paid users only';
COMMENT ON COLUMN event_info.payment_url IS 'Payment link (e.g. T-Bank) – visible to approved/paid users only';
