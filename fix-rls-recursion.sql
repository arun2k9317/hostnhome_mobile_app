-- ============================================================================
-- FIX RLS INFINITE RECURSION ISSUE
-- ============================================================================
-- This script fixes the infinite recursion in RLS policies
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Step 1: Create a security definer function to check user role
-- This function bypasses RLS to avoid recursion
-- Note: Functions must be in public schema, not auth schema
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role::TEXT
  FROM public.user_profiles
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;

-- Step 2: Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE auth_user_id = auth.uid()
    AND role = 'super_admin'
  );
$$;

-- Step 3: Create function to get vendor_id for current user
CREATE OR REPLACE FUNCTION public.user_vendor_id()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT vendor_id
  FROM public.user_profiles
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;

-- Step 4: Drop all existing policies that use user_profiles queries
-- (We'll recreate them using the functions above)

-- Drop user_profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON user_profiles;

-- Drop policies on other tables that query user_profiles
DROP POLICY IF EXISTS "Super admins can manage subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Super admins can view all vendors" ON vendors;
DROP POLICY IF EXISTS "Super admins can manage vendors" ON vendors;
DROP POLICY IF EXISTS "Super admins can view all resorts" ON resorts;
DROP POLICY IF EXISTS "Super admins can view all rooms" ON rooms;
DROP POLICY IF EXISTS "Super admins can view all staff" ON staff;
DROP POLICY IF EXISTS "Vendors can view own profile" ON vendors;
DROP POLICY IF EXISTS "Vendors can manage own resorts" ON resorts;
DROP POLICY IF EXISTS "Vendors can view own resorts" ON resorts;
DROP POLICY IF EXISTS "Vendors can insert own resorts" ON resorts;
DROP POLICY IF EXISTS "Vendors can update own resorts" ON resorts;
DROP POLICY IF EXISTS "Vendors can delete own resorts" ON resorts;
DROP POLICY IF EXISTS "Vendors can manage own resort rooms" ON rooms;
DROP POLICY IF EXISTS "Vendors can view own resort rooms" ON rooms;
DROP POLICY IF EXISTS "Vendors can insert own resort rooms" ON rooms;
DROP POLICY IF EXISTS "Vendors can update own resort rooms" ON rooms;
DROP POLICY IF EXISTS "Vendors can delete own resort rooms" ON rooms;
DROP POLICY IF EXISTS "Vendors and staff can view own organization staff" ON staff;
DROP POLICY IF EXISTS "Vendors can manage staff" ON staff;
DROP POLICY IF EXISTS "Vendors can update staff" ON staff;
DROP POLICY IF EXISTS "Vendors can delete staff" ON staff;

-- Step 5: Recreate user_profiles policies (simple - no recursion)
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Step 6: Recreate vendor policies using functions
CREATE POLICY "Vendors can view own profile"
  ON vendors FOR SELECT
  TO authenticated
  USING (id = public.user_vendor_id());

CREATE POLICY "Super admins can view all vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Super admins can manage vendors"
  ON vendors FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Step 7: Recreate resort policies using functions
CREATE POLICY "Vendors can view own resorts"
  ON resorts FOR SELECT
  TO authenticated
  USING (
    vendor_id = public.user_vendor_id()
    OR public.is_super_admin()
  );

CREATE POLICY "Vendors can manage own resorts"
  ON resorts FOR ALL
  TO authenticated
  USING (
    vendor_id = public.user_vendor_id()
    OR public.is_super_admin()
  )
  WITH CHECK (
    vendor_id = public.user_vendor_id()
    OR public.is_super_admin()
  );

-- Step 8: Recreate room policies using functions
-- First, we need a function to check if user owns the resort
CREATE OR REPLACE FUNCTION public.user_owns_resort(resort_id BIGINT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.resorts r
    INNER JOIN public.user_profiles up ON r.vendor_id = up.vendor_id
    WHERE r.id = resort_id
    AND up.auth_user_id = auth.uid()
  )
  OR public.is_super_admin();
$$;

CREATE POLICY "Vendors can manage own resort rooms"
  ON rooms FOR ALL
  TO authenticated
  USING (
    public.user_owns_resort(resort_id)
  )
  WITH CHECK (
    public.user_owns_resort(resort_id)
  );

-- Step 9: Recreate staff policies using functions
CREATE POLICY "Vendors and staff can view own organization staff"
  ON staff FOR SELECT
  TO authenticated
  USING (
    vendor_id = public.user_vendor_id()
    OR public.is_super_admin()
  );

CREATE POLICY "Vendors can manage staff"
  ON staff FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id = public.user_vendor_id()
    AND public.user_role() = 'vendor'
  );

CREATE POLICY "Vendors can update staff"
  ON staff FOR UPDATE
  TO authenticated
  USING (
    vendor_id = public.user_vendor_id()
    AND public.user_role() = 'vendor'
  );

CREATE POLICY "Vendors can delete staff"
  ON staff FOR DELETE
  TO authenticated
  USING (
    vendor_id = public.user_vendor_id()
    AND public.user_role() = 'vendor'
  );

-- Step 10: Recreate subscription plans policies
CREATE POLICY "Super admins can manage subscription plans"
  ON subscription_plans FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- Verification
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ RLS POLICIES FIXED!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  - public.user_role()';
  RAISE NOTICE '  - public.is_super_admin()';
  RAISE NOTICE '  - public.user_vendor_id()';
  RAISE NOTICE '  - public.user_owns_resort()';
  RAISE NOTICE '';
  RAISE NOTICE 'All policies recreated using functions';
  RAISE NOTICE 'This avoids infinite recursion!';
  RAISE NOTICE '============================================';
END $$;

