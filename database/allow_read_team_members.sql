-- Allow authenticated users to see approved/paid team members
-- Run this in Supabase SQL Editor

-- Drop if re-running
DROP POLICY IF EXISTS "Authenticated users can view approved team members" ON users;

CREATE POLICY "Authenticated users can view approved team members" ON users
    FOR SELECT
    USING (
        -- Any logged-in user can read these rows if the target user is approved/paid
        auth.uid() IS NOT NULL
        AND status IN ('approved', 'paid')
    );
