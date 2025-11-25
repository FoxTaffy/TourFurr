-- Fix infinite recursion in admin policies
-- Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all data" ON users;
DROP POLICY IF EXISTS "Admins can update all data" ON users;
DROP POLICY IF EXISTS "Users cannot modify admin status" ON users;

-- Keep the admin field and index
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Create a trigger function to prevent users from modifying their own is_admin field
CREATE OR REPLACE FUNCTION prevent_admin_modification()
RETURNS TRIGGER AS $$
BEGIN
    -- If is_admin is being changed, prevent it
    IF OLD.is_admin IS DISTINCT FROM NEW.is_admin THEN
        RAISE EXCEPTION 'Cannot modify admin status';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and create it
DROP TRIGGER IF EXISTS trigger_prevent_admin_modification ON users;
CREATE TRIGGER trigger_prevent_admin_modification
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION prevent_admin_modification();

-- Admin checks will be handled in the application layer
-- The frontend checks authStore.user?.isAdmin in AdminPage.vue
-- Only database administrators can modify is_admin field directly via SQL

COMMENT ON COLUMN users.is_admin IS 'Whether user has admin privileges (modifiable only via direct SQL)';
