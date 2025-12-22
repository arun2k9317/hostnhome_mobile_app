-- ============================================================================
-- FIX RLS POLICIES - Remove infinite recursion
-- ============================================================================
-- Run this to fix the user_profiles policy recursion issue
-- ============================================================================

-- Drop the problematic super admin policy
DROP POLICY IF EXISTS "Super admins can view all profiles" ON user_profiles;

-- The "Users can view own profile" policy is sufficient
-- Super admins can still access data through other tables (vendors, resorts, etc.)
-- which have their own policies that check user_profiles correctly

-- If you need super admins to view all user_profiles, use a service role
-- or create a function that bypasses RLS for super admins

