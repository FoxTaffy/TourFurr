# Database Setup Guide

## 📋 Setup Order

Execute the SQL files in **this exact order** in Supabase SQL Editor:

### 1. **PRODUCTION_SECURE_RLS_FIXED.sql** ✅ (Already applied)
- Fixes RLS infinite recursion
- Creates `is_admin_user()` function
- Must be applied first

### 2. **event_config_schema.sql** ⚠️ **Run this SECOND**
- Creates `event_config` table with TourFurr 2026 settings
- Stores max participants (121), registration dates, payment deadline
- Required by applications_rls.sql

### 3. **applications_schema.sql** ⚠️ **Run this THIRD**
- Creates `applications` table with:
  - motivation, experience_level
  - status (pending/approved/rejected/waitlist)
  - payment_status, payment tracking
- Creates indexes and triggers
- **CRITICAL: This must be run before any other schema that references applications!**

### 4. **applications_rls.sql** ⚠️ **Run this FOURTH**
- Depends on `applications` and `event_config` tables
- Creates RLS policies for applications
- Validates registration open/closed status
- Enforces participant limit (121)

### 5. **voting_system_schema.sql** ⚠️ **Run this FIFTH**
- Depends on `applications` table existing
- Creates:
  - `admin_votes` table
  - `calculate_vote_result()` function
  - Voting triggers and views
  - RLS policies for voting

### 6. **fixes_and_cleanup.sql** (Optional)
- Removes `email_subscribed` column
- Grants admin privileges (uncomment your email)
- Creates auto-cleanup function for unverified users

---

## 🚀 Step-by-Step Instructions

### Step 1: Apply Event Config Schema

Open Supabase Dashboard → SQL Editor:

```sql
-- Copy and paste the entire contents of:
-- database/event_config_schema.sql
```

Click "Run" and verify success.

### Step 2: Apply Applications Schema (CRITICAL!)

In the same SQL Editor:

```sql
-- Copy and paste the entire contents of:
-- database/applications_schema.sql
```

Click "Run" and verify success.

### Step 3: Apply Applications RLS Policies

In the same SQL Editor:

```sql
-- Copy and paste the entire contents of:
-- database/applications_rls.sql
```

Click "Run" and verify success.

### Step 4: Apply Voting System Schema

In the same SQL Editor:

```sql
-- Copy and paste the entire contents of:
-- database/voting_system_schema.sql
```

Click "Run" and verify success.

### Step 5: Grant Admin Privileges (Important!)

In the same SQL Editor:

```sql
-- Copy and paste from database/fixes_and_cleanup.sql
-- BUT: Uncomment the UPDATE statement with YOUR email:
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
```

Replace `'your-email@example.com'` with your actual email.

---

## ✅ Verification

After running all schemas, verify everything is set up correctly:

```sql
-- Check if applications table exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'applications';

-- Check if admin_votes table exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'admin_votes';

-- Check if voting functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'calculate_vote_result',
    'get_pending_applications_for_admin',
    'force_approve_application'
  );

-- Verify you have admin privileges
SELECT email, is_admin FROM users WHERE email = 'your-email@example.com';
```

---

## 🔧 Troubleshooting

### Error: "column a.motivation does not exist"
**Cause:** You ran `voting_system_schema.sql` before `applications_schema.sql`

**Fix:**
1. Run `applications_schema.sql` first
2. Then run `voting_system_schema.sql` again

### Error: "column payment_status does not exist"
**Cause:** You ran `applications_rls.sql` before `applications_schema.sql`

**Fix:**
1. Run `applications_schema.sql` first
2. Then run `applications_rls.sql` again

### Error: "table applications already exists"
**Cause:** You already ran `applications_schema.sql`

**Fix:** This is fine! Just proceed to the next schema in the order.

### Error: "infinite recursion detected"
**Cause:** RLS policies not fixed

**Fix:** Run `PRODUCTION_SECURE_RLS_FIXED.sql` first

### General Rule: Always run applications_schema.sql BEFORE anything else!
If you see **any** error mentioning a missing column from the `applications` table:
1. Stop immediately
2. Run `applications_schema.sql`
3. Then run the failing schema again

---

## 📊 What Each Schema Creates

### applications_schema.sql
- ✅ `applications` table
- ✅ 4 indexes for performance
- ✅ `update_applications_updated_at()` trigger

### voting_system_schema.sql
- ✅ `admin_votes` table
- ✅ `calculate_vote_result()` function (9/9 voting logic)
- ✅ `trigger_recalculate_votes` trigger
- ✅ `application_vote_summary` view
- ✅ `get_pending_applications_for_admin()` function
- ✅ `force_approve_application()` function
- ✅ RLS policies for voting

### fixes_and_cleanup.sql
- ✅ Removes `email_subscribed` column
- ✅ Admin privilege grant helper
- ✅ `cleanup_unverified_users()` function

---

## 🔐 Security Notes

- Never commit `.env` file with real keys
- Keep `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY` in Supabase secrets
- Grant admin privileges only to trusted users
- RLS policies prevent non-admins from accessing voting data

---

## 📝 Next Steps After Database Setup

1. ✅ Verify RESEND_API_KEY is set in Supabase secrets:
   ```bash
   supabase secrets list
   ```

2. ✅ Test email sending with verification code

3. ✅ Access admin panel and verify voting tab appears

4. ✅ Set up cron job for `cleanup_unverified_users()` (runs every 15 minutes)

5. ✅ Update environment variables in Vercel for production deployment
