-- ====================================================================
-- MIGRATION: Update existing applications table to latest schema
-- ====================================================================
-- This script updates an existing applications table to match the
-- current schema requirements. Run this if you get errors about
-- missing columns like "payment_status does not exist".
-- ====================================================================

-- Drop existing table and recreate with correct schema
-- WARNING: This will delete all existing application data!
-- If you need to preserve data, backup first with pg_dump

DROP TABLE IF EXISTS applications CASCADE;

-- Now create the table with the complete, correct schema
CREATE TABLE applications (
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
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_payment_status ON applications(payment_status);
CREATE INDEX idx_applications_created_at ON applications(created_at);

-- Trigger function
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS applications_updated_at_trigger ON applications;
CREATE TRIGGER applications_updated_at_trigger
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_applications_updated_at();

-- Enable RLS
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE applications IS 'Event registration applications for TourFurr 2026';
COMMENT ON COLUMN applications.motivation IS 'Why the user wants to attend (50-1000 characters)';
COMMENT ON COLUMN applications.experience_level IS 'User furry community experience level';
COMMENT ON COLUMN applications.status IS 'Application approval status: pending, approved, rejected, or waitlist';
COMMENT ON COLUMN applications.payment_status IS 'Payment tracking: unpaid, partial, paid, or refunded';
COMMENT ON COLUMN applications.payment_deadline IS 'Deadline for full payment (May 30, 2026)';

SELECT '
================================================================================
✅ APPLICATIONS TABLE RECREATED
================================================================================

The applications table has been dropped and recreated with the correct schema.

⚠️ WARNING: All previous application data was deleted!

Next steps:
1. Run applications_rls.sql to add RLS policies
2. Run voting_system_schema.sql to add voting system
3. Grant yourself admin privileges

================================================================================
' AS migration_status;
