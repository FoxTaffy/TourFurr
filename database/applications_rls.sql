-- ====================================================================
-- RLS POLICIES FOR APPLICATIONS AND EVENT_CONFIG TABLES
-- ====================================================================
-- Date: 2026-01-31
-- Secure policies for event registration system
-- ====================================================================

-- ========================
-- PREREQUISITE CHECK
-- ========================
-- This file requires applications table to exist first
-- Please run database/applications_schema.sql before this file

DO $$
BEGIN
    -- Check if applications table exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'applications'
    ) THEN
        RAISE EXCEPTION '
        ❌ ERROR: Applications table does not exist!

        You must run database/applications_schema.sql FIRST before running this file.

        Setup order:
        1. database/applications_schema.sql (creates applications table)
        2. database/applications_rls.sql (this file - RLS policies)

        See database/README.md for detailed setup instructions.
        ';
    END IF;

    -- Check if event_config table exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'event_config'
    ) THEN
        RAISE EXCEPTION '
        ❌ ERROR: event_config table does not exist!

        You must run database/event_config_schema.sql FIRST before running this file.

        See database/README.md for detailed setup instructions.
        ';
    END IF;

    RAISE NOTICE '✅ Prerequisite check passed: applications and event_config tables exist';
END $$;

-- Enable RLS on applications table
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_config ENABLE ROW LEVEL SECURITY;

-- ========================
-- PART 1: APPLICATIONS TABLE - RLS POLICIES
-- ========================

-- Drop all existing policies for applications
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'applications')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON applications';
    END LOOP;
END $$;

-- ========================================
-- SELECT POLICIES
-- ========================================

-- 1. Users can view their own applications
CREATE POLICY "Users can view own applications" ON applications
    FOR SELECT
    USING (user_id = auth.uid());

-- 2. Admins can view all applications
CREATE POLICY "Admins can view all applications" ON applications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS admin
            WHERE admin.id = auth.uid() AND admin.is_admin = true
        )
    );

-- ========================================
-- INSERT POLICIES
-- ========================================

-- Users can submit applications (with validation)
CREATE POLICY "Users can submit applications" ON applications
    FOR INSERT
    WITH CHECK (
        -- Must be authenticated
        auth.uid() IS NOT NULL
        -- Must be inserting own application
        AND user_id = auth.uid()
        -- User must be approved in users table
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
                AND users.status = 'approved'
                AND users.email_verified = true
        )
        -- Can only create one application per user (enforced by UNIQUE constraint too)
        AND NOT EXISTS (
            SELECT 1 FROM applications AS existing
            WHERE existing.user_id = auth.uid()
        )
    );

-- ========================================
-- UPDATE POLICIES
-- ========================================

-- Users can update their own pending applications
CREATE POLICY "Users can update own pending applications" ON applications
    FOR UPDATE
    USING (
        user_id = auth.uid()
        AND status = 'pending'
    )
    WITH CHECK (
        user_id = auth.uid()
        -- Users cannot change status, payment fields, or admin fields
        AND status = 'pending'
        AND payment_status = (SELECT payment_status FROM applications WHERE id = applications.id)
        AND admin_notes IS NULL
        AND reviewed_by IS NULL
    );

-- Admins can update any application
CREATE POLICY "Admins can update any application" ON applications
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users AS admin
            WHERE admin.id = auth.uid() AND admin.is_admin = true
        )
    );

-- ========================================
-- DELETE POLICIES
-- ========================================

-- Users can delete their own pending applications
CREATE POLICY "Users can delete own pending applications" ON applications
    FOR DELETE
    USING (
        user_id = auth.uid()
        AND status = 'pending'
    );

-- Admins can delete any application
CREATE POLICY "Admins can delete any application" ON applications
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users AS admin
            WHERE admin.id = auth.uid() AND admin.is_admin = true
        )
    );

-- ========================
-- PART 2: EVENT_CONFIG TABLE - RLS POLICIES
-- ========================

-- Drop all existing policies for event_config
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'event_config')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON event_config';
    END LOOP;
END $$;

-- ========================================
-- SELECT POLICIES
-- ========================================

-- Everyone can view event configuration (public information)
CREATE POLICY "Anyone can view event config" ON event_config
    FOR SELECT
    USING (true);

-- ========================================
-- INSERT POLICIES
-- ========================================

-- Only admins can create event configurations
CREATE POLICY "Only admins can create event config" ON event_config
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users AS admin
            WHERE admin.id = auth.uid() AND admin.is_admin = true
        )
    );

-- ========================================
-- UPDATE POLICIES
-- ========================================

-- Only admins can update event configurations
CREATE POLICY "Only admins can update event config" ON event_config
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users AS admin
            WHERE admin.id = auth.uid() AND admin.is_admin = true
        )
    );

-- ========================================
-- DELETE POLICIES
-- ========================================

-- Only admins can delete event configurations
CREATE POLICY "Only admins can delete event config" ON event_config
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users AS admin
            WHERE admin.id = auth.uid() AND admin.is_admin = true
        )
    );

-- ========================
-- PART 3: HELPER FUNCTIONS
-- ========================

-- Function to check if registration is currently open
CREATE OR REPLACE FUNCTION is_registration_open()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_config RECORD;
BEGIN
    SELECT * INTO v_config
    FROM event_config
    WHERE is_active = true
    ORDER BY event_year DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Check if current time is within registration period
    RETURN (
        NOW() >= v_config.registration_open_date
        AND (v_config.registration_close_date IS NULL OR NOW() <= v_config.registration_close_date)
    );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION is_registration_open() TO anon, authenticated;

COMMENT ON FUNCTION is_registration_open IS 'Check if event registration is currently open';

-- Function to get approved applications count
CREATE OR REPLACE FUNCTION get_approved_count()
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM applications
    WHERE status = 'approved';

    RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_approved_count() TO anon, authenticated;

COMMENT ON FUNCTION get_approved_count IS 'Get count of approved applications';

-- Function to check if space is available
CREATE OR REPLACE FUNCTION is_space_available()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_config RECORD;
    v_approved_count INTEGER;
BEGIN
    -- Get active event config
    SELECT * INTO v_config
    FROM event_config
    WHERE is_active = true
    ORDER BY event_year DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Get approved count
    SELECT get_approved_count() INTO v_approved_count;

    -- Check if under limit
    RETURN v_approved_count < v_config.max_participants;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION is_space_available() TO anon, authenticated;

COMMENT ON FUNCTION is_space_available IS 'Check if space is available for new participants';

-- ========================
-- PART 4: VERIFICATION
-- ========================

SELECT '===================================';
SELECT '✅ APPLICATIONS RLS APPLIED ✅';
SELECT '===================================';

-- Show policies for applications
SELECT
    'APPLICATIONS POLICIES' as section,
    policyname,
    cmd,
    qual::text as using_clause
FROM pg_policies
WHERE tablename = 'applications'
ORDER BY cmd, policyname;

-- Show policies for event_config
SELECT
    'EVENT_CONFIG POLICIES' as section,
    policyname,
    cmd,
    qual::text as using_clause
FROM pg_policies
WHERE tablename = 'event_config'
ORDER BY cmd, policyname;

SELECT '
================================================================================
🔒 APPLICATIONS SECURITY ENABLED
================================================================================

Policies applied:

1. ✅ APPLICATIONS table:
   - Users can view ONLY their own applications
   - Admins can view all applications
   - Users can submit applications (if approved and verified)
   - Users can update ONLY pending applications
   - Users cannot modify status/payment/admin fields
   - Users can delete ONLY pending applications

2. ✅ EVENT_CONFIG table:
   - Everyone can view configuration (public info)
   - Only admins can create/update/delete configs

3. ✅ Helper functions:
   - is_registration_open() - Check registration window
   - get_approved_count() - Count approved applications
   - is_space_available() - Check if under max_participants (121)

Registration settings:
- Opens: March 1, 2026 00:00 UTC
- Closes: May 30, 2026 23:59 UTC
- Max participants: 121
- Payment deadline: May 30, 2026

================================================================================
' as security_notice;
