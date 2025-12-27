-- ============================================================================
-- VERIFY USER PROFILES SETUP
-- ============================================================================
-- Run this in Supabase SQL Editor to check if user_profiles are set up correctly
-- ============================================================================

-- 1. Check all auth users
SELECT 
  id as auth_user_id,
  email as auth_email,
  created_at
FROM auth.users
ORDER BY email;

-- 2. Check all user_profiles
SELECT 
  up.id,
  up.auth_user_id,
  up.email as profile_email,
  up.role,
  up.vendor_id,
  up.staff_id,
  au.email as auth_email_match
FROM user_profiles up
LEFT JOIN auth.users au ON up.auth_user_id = au.id
ORDER BY up.role, up.email;

-- 3. Check for missing user_profiles (auth users without profiles)
SELECT 
  au.id as auth_user_id,
  au.email as auth_email,
  'MISSING PROFILE' as status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.auth_user_id
WHERE up.id IS NULL;

-- 4. Check for super admin specifically
SELECT 
  up.id,
  up.auth_user_id,
  up.email,
  up.role,
  au.email as auth_email,
  CASE 
    WHEN up.role = 'super_admin' THEN '✅ Correct role'
    ELSE '❌ Wrong role: ' || up.role
  END as status
FROM user_profiles up
LEFT JOIN auth.users au ON up.auth_user_id = au.id
WHERE au.email = 'admin@travelb2b.com' OR up.email = 'admin@travelb2b.com';

-- 5. Check for vendor specifically
SELECT 
  up.id,
  up.auth_user_id,
  up.email,
  up.role,
  up.vendor_id,
  au.email as auth_email,
  v.name as vendor_name,
  CASE 
    WHEN up.role = 'vendor' AND up.vendor_id IS NOT NULL THEN '✅ Correct'
    WHEN up.role = 'vendor' AND up.vendor_id IS NULL THEN '❌ Missing vendor_id'
    ELSE '❌ Wrong role: ' || up.role
  END as status
FROM user_profiles up
LEFT JOIN auth.users au ON up.auth_user_id = au.id
LEFT JOIN vendors v ON up.vendor_id = v.id
WHERE au.email = 'vendor@example.com' OR up.email = 'vendor@example.com';

