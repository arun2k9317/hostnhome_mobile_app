-- ============================================================================
-- CREATE USER PROFILES FOR AUTH USERS
-- ============================================================================
-- Run this AFTER creating auth users in Supabase Auth dashboard
-- This links the auth users to user_profiles table
-- ============================================================================

-- Step 1: Create Super Admin user profile
INSERT INTO user_profiles (auth_user_id, email, role)
SELECT id, email, 'super_admin'
FROM auth.users
WHERE email = 'admin@travelb2b.com'
ON CONFLICT (auth_user_id) DO UPDATE
SET email = EXCLUDED.email, role = EXCLUDED.role;

-- Step 2: Create Vendor user profile (links to vendor with matching email)
INSERT INTO user_profiles (auth_user_id, email, role, vendor_id)
SELECT au.id, au.email, 'vendor', v.id
FROM auth.users au
CROSS JOIN vendors v
WHERE au.email = 'vendor@example.com'
  AND v.email = 'vendor@example.com'
ON CONFLICT (auth_user_id) DO UPDATE
SET email = EXCLUDED.email, 
    role = EXCLUDED.role,
    vendor_id = EXCLUDED.vendor_id;

-- Step 3: Create Staff user profile (links to staff with matching email)
INSERT INTO user_profiles (auth_user_id, email, role, vendor_id, staff_id)
SELECT au.id, au.email, 'staff', s.vendor_id, s.id
FROM auth.users au
CROSS JOIN staff s
WHERE au.email = 'staff@example.com'
  AND s.email = 'staff@example.com'
ON CONFLICT (auth_user_id) DO UPDATE
SET email = EXCLUDED.email,
    role = EXCLUDED.role,
    vendor_id = EXCLUDED.vendor_id,
    staff_id = EXCLUDED.staff_id;

-- Verification: Check created user profiles
SELECT 
  up.id,
  up.email,
  up.role,
  v.name as vendor_name,
  s.name as staff_name
FROM user_profiles up
LEFT JOIN vendors v ON up.vendor_id = v.id
LEFT JOIN staff s ON up.staff_id = s.id
ORDER BY up.role, up.email;

