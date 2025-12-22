# 🔧 Fix RLS Infinite Recursion Error

## Problem
You're seeing this error:
```
infinite recursion detected in policy for relation "user_profiles"
```

This happens because RLS policies on tables query `user_profiles` to check user roles, but `user_profiles` itself has RLS enabled, causing infinite recursion.

## Solution

Run the fix script to use SECURITY DEFINER functions that bypass RLS for role checking.

### Steps:

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor** in the left sidebar

2. **Run the Fix Script**
   - Open `fix-rls-recursion.sql` from this project
   - Copy the entire contents
   - Paste into SQL Editor
   - Click **"Run"**

3. **Verify the Fix**
   - The script will create helper functions in the `public` schema:
     - `public.user_role()` - Gets current user's role
     - `public.is_super_admin()` - Checks if user is super admin
     - `public.user_vendor_id()` - Gets current user's vendor_id
     - `public.user_owns_resort()` - Checks if user owns a resort
   - Note: Functions are in `public` schema (not `auth`) because `auth` schema is protected
   - All RLS policies are recreated to use these functions instead of direct queries

4. **Test Your App**
   - Restart your mobile app
   - Try logging in and navigating to Dashboard/Resorts
   - The error should be gone!

## How It Works

**Before (Causes Recursion):**
```sql
-- Policy queries user_profiles directly
CREATE POLICY "Super admin policy"
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles  -- ❌ This triggers RLS on user_profiles
      WHERE auth_user_id = auth.uid()
      AND role = 'super_admin'
    )
  );
```

**After (No Recursion):**
```sql
-- Policy uses SECURITY DEFINER function
CREATE POLICY "Super admin policy"
  USING (auth.is_super_admin());  -- ✅ Function bypasses RLS
```

SECURITY DEFINER functions run with the permissions of the function creator, bypassing RLS, which breaks the recursion cycle.

## If You Still Have Issues

1. **Check if functions exist:**
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_schema = 'auth';
   ```

2. **Verify policies are using functions:**
   ```sql
   SELECT tablename, policyname, qual 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

3. **Test a function:**
   ```sql
   SELECT public.user_role();
   SELECT public.is_super_admin();
   SELECT public.user_vendor_id();
   ```

4. **Check if functions exist:**
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_schema = 'public'
   AND routine_name IN ('user_role', 'is_super_admin', 'user_vendor_id', 'user_owns_resort');
   ```

---

**After running the fix, your app should work perfectly!** ✅

