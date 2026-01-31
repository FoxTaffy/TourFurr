-- ====================================================================
-- TourFurr 2026 - COMPLETE DATABASE SETUP (ALL-IN-ONE)
-- ====================================================================
-- This file contains ALL database schemas in the correct order.
-- Run this ONCE in Supabase SQL Editor to set up everything.
-- ====================================================================
--
-- ⚠️ IMPORTANT: Make sure PRODUCTION_SECURE_RLS_FIXED.sql was already applied!
--
-- After running this file, you still need to:
-- 1. Grant yourself admin privileges (see bottom of this file)
-- 2. Set RESEND_API_KEY in Supabase secrets
-- 3. Set TURNSTILE_SECRET_KEY in Supabase secrets
--
-- ====================================================================

-- ====================================================================
-- PART 1: EVENT CONFIG SCHEMA
-- ====================================================================

CREATE TABLE IF NOT EXISTS event_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(255) NOT NULL,
    event_year INTEGER NOT NULL,
    event_start_date DATE NOT NULL,
    event_end_date DATE NOT NULL,
    registration_open_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_close_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER NOT NULL DEFAULT 121,
    payment_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert TourFurr 2026 event configuration
INSERT INTO event_config (
    event_name,
    event_year,
    event_start_date,
    event_end_date,
    registration_open_date,
    registration_close_date,
    max_participants,
    payment_deadline
) VALUES (
    'TourFurr 2026',
    2026,
    '2026-08-06',
    '2026-08-09',
    '2026-03-01 00:00:00+00',
    '2026-05-30 23:59:59+00',
    121,
    '2026-05-30 23:59:59+00'
)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE event_config IS 'Event-wide configuration for TourFurr 2026';

-- ====================================================================
-- PART 2: APPLICATIONS SCHEMA
-- ====================================================================

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Application content
    motivation TEXT NOT NULL CHECK (char_length(motivation) >= 50 AND char_length(motivation) <= 1000),
    experience_level VARCHAR(50) NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'experienced', 'veteran')),
    skills TEXT,
    additional_info TEXT,

    -- Application status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'waitlist')),
    admin_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,

    -- Payment tracking
    payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
    payment_amount DECIMAL(10, 2),
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_deadline TIMESTAMP WITH TIME ZONE DEFAULT '2026-05-30 23:59:59+00',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one application per user
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_payment_status ON applications(payment_status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_applications_updated_at ON applications;
CREATE TRIGGER trigger_update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_applications_updated_at();

COMMENT ON TABLE applications IS 'Event registration applications for TourFurr 2026';

-- ====================================================================
-- PART 3: APPLICATIONS RLS POLICIES
-- ====================================================================

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_config ENABLE ROW LEVEL SECURITY;

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

-- Users can view their own applications
CREATE POLICY "Users can view own applications" ON applications
    FOR SELECT
    USING (user_id = auth.uid());

-- Admins can view all applications
CREATE POLICY "Admins can view all applications" ON applications
    FOR SELECT
    USING (is_admin_user(auth.uid()));

-- Users can submit applications
CREATE POLICY "Users can submit applications" ON applications
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND NOT EXISTS (SELECT 1 FROM applications WHERE user_id = auth.uid())
    );

-- Users can update their own pending applications
CREATE POLICY "Users can update own pending applications" ON applications
    FOR UPDATE
    USING (user_id = auth.uid() AND status = 'pending')
    WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Admins can update any application
CREATE POLICY "Admins can update applications" ON applications
    FOR UPDATE
    USING (is_admin_user(auth.uid()));

-- Admins can delete applications
CREATE POLICY "Admins can delete applications" ON applications
    FOR DELETE
    USING (is_admin_user(auth.uid()));

-- Event config policies
CREATE POLICY "Everyone can view event config" ON event_config
    FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify event config" ON event_config
    FOR ALL
    USING (is_admin_user(auth.uid()));

-- ====================================================================
-- PART 4: VOTING SYSTEM SCHEMA
-- ====================================================================

CREATE TABLE IF NOT EXISTS admin_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote BOOLEAN NOT NULL,
    comment TEXT,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(application_id, admin_id)
);

CREATE INDEX IF NOT EXISTS idx_admin_votes_application ON admin_votes(application_id);
CREATE INDEX IF NOT EXISTS idx_admin_votes_admin ON admin_votes(admin_id);

COMMENT ON TABLE admin_votes IS '9/9 unanimous voting system for application approval';

-- Calculate vote result function
CREATE OR REPLACE FUNCTION calculate_vote_result(app_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    votes_for INTEGER;
    votes_against INTEGER;
    total_votes INTEGER;
    new_status VARCHAR(20);
BEGIN
    SELECT
        COUNT(*) FILTER (WHERE vote = true),
        COUNT(*) FILTER (WHERE vote = false),
        COUNT(*)
    INTO votes_for, votes_against, total_votes
    FROM admin_votes
    WHERE application_id = app_id;

    IF votes_against > 0 THEN
        new_status := 'rejected';
    ELSIF votes_for = 9 THEN
        new_status := 'approved';
    ELSIF total_votes = 9 AND votes_for = 8 THEN
        new_status := 'waitlist';
    ELSE
        new_status := 'pending';
    END IF;

    UPDATE applications
    SET status = new_status, updated_at = NOW()
    WHERE id = app_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate votes
CREATE OR REPLACE FUNCTION trigger_recalculate_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM calculate_vote_result(OLD.application_id);
        RETURN OLD;
    ELSE
        PERFORM calculate_vote_result(NEW.application_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS recalculate_votes_on_change ON admin_votes;
CREATE TRIGGER recalculate_votes_on_change
    AFTER INSERT OR UPDATE OR DELETE ON admin_votes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_votes();

-- Application vote summary view
CREATE OR REPLACE VIEW application_vote_summary AS
SELECT
    a.id AS application_id,
    a.user_id,
    a.status,
    a.motivation,
    a.created_at,
    COUNT(av.id) FILTER (WHERE av.vote = true) AS votes_for,
    COUNT(av.id) FILTER (WHERE av.vote = false) AS votes_against,
    COUNT(av.id) AS total_votes,
    9 - COUNT(av.id) AS votes_remaining,
    ROUND(COUNT(av.id) FILTER (WHERE av.vote = true)::NUMERIC / NULLIF(COUNT(av.id), 0) * 100, 1) AS approval_percentage
FROM applications a
LEFT JOIN admin_votes av ON a.id = av.application_id
GROUP BY a.id, a.user_id, a.status, a.motivation, a.created_at;

-- Get pending applications for admin
CREATE OR REPLACE FUNCTION get_pending_applications_for_admin(admin_user_id UUID)
RETURNS TABLE (
    application_id UUID,
    user_id UUID,
    user_nickname VARCHAR,
    user_email VARCHAR,
    motivation TEXT,
    experience_level VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    votes_for BIGINT,
    votes_against BIGINT,
    already_voted BOOLEAN
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.user_id,
        u.nickname,
        u.email,
        a.motivation,
        a.experience_level,
        a.created_at,
        COUNT(av.id) FILTER (WHERE av.vote = true) AS votes_for,
        COUNT(av.id) FILTER (WHERE av.vote = false) AS votes_against,
        EXISTS (
            SELECT 1 FROM admin_votes
            WHERE application_id = a.id AND admin_id = admin_user_id
        ) AS already_voted
    FROM applications a
    INNER JOIN users u ON a.user_id = u.id
    LEFT JOIN admin_votes av ON a.id = av.application_id
    WHERE a.status = 'pending'
    GROUP BY a.id, a.user_id, u.nickname, u.email, a.motivation, a.experience_level, a.created_at
    ORDER BY a.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Force approve function
CREATE OR REPLACE FUNCTION force_approve_application(app_id UUID, admin_user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT is_admin_user(admin_user_id) THEN
        RAISE EXCEPTION 'Only admins can force approve applications';
    END IF;

    UPDATE applications
    SET status = 'approved', updated_at = NOW()
    WHERE id = app_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- RLS policies for voting
ALTER TABLE admin_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all votes" ON admin_votes;
CREATE POLICY "Admins can view all votes" ON admin_votes
    FOR SELECT
    USING (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can vote" ON admin_votes;
CREATE POLICY "Admins can vote" ON admin_votes
    FOR INSERT
    WITH CHECK (
        is_admin_user(auth.uid())
        AND admin_id = auth.uid()
    );

DROP POLICY IF EXISTS "Admins can update own votes" ON admin_votes;
CREATE POLICY "Admins can update own votes" ON admin_votes
    FOR UPDATE
    USING (
        is_admin_user(auth.uid())
        AND admin_id = auth.uid()
    )
    WITH CHECK (admin_id = auth.uid());

-- ====================================================================
-- ✅ SETUP COMPLETE!
-- ====================================================================

SELECT '
================================================================================
✅ DATABASE SETUP COMPLETE!
================================================================================

Created:
- event_config table (TourFurr 2026 configuration)
- applications table (with RLS policies)
- admin_votes table (9/9 voting system)
- All necessary functions, triggers, and views

NEXT STEPS:

1. Grant yourself admin privileges:
   UPDATE users SET is_admin = true WHERE email = ''your-email@example.com'';

2. Set Supabase secrets (via Supabase CLI or Dashboard):
   - RESEND_API_KEY
   - TURNSTILE_SECRET_KEY

3. Test the application registration and voting system!

================================================================================
' AS setup_status;
