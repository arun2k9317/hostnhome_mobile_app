# 🚀 HostnHome Mobile App - Database Setup Instructions

## Step 1: Run the SQL Script

1. Open your **Supabase project dashboard**
2. Go to **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Open `database-setup.sql` from this project
5. Copy the entire contents
6. Paste into the SQL Editor
7. Click **"Run"** (or press Ctrl+Enter)

✅ You should see: "DATABASE SETUP COMPLETE!"

---

## Step 2: Create Auth Users in Supabase

The SQL script creates the database tables, but you need to create the authentication users manually.

### Option A: Via Supabase Dashboard (Recommended)

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click **"Add user"** → **"Create new user"**
3. Create the following users:

#### Super Admin User
- **Email**: `admin@travelb2b.com`
- **Password**: `admin123`
- **Auto Confirm User**: ✅ (check this box)

#### Vendor User
- **Email**: `vendor@example.com`
- **Password**: `password123`
- **Auto Confirm User**: ✅ (check this box)

#### Staff User
- **Email**: `staff@example.com`
- **Password**: `password123`
- **Auto Confirm User**: ✅ (check this box)

---

### Option B: Via SQL (After creating auth users)

After creating the auth users above, run this SQL to link them to user_profiles:

```sql
-- Link Super Admin (replace 'ADMIN_AUTH_USER_ID' with actual UUID from auth.users)
INSERT INTO user_profiles (auth_user_id, email, role)
SELECT id, email, 'super_admin'
FROM auth.users
WHERE email = 'admin@travelb2b.com'
ON CONFLICT (auth_user_id) DO NOTHING;

-- Link Vendor (replace 'VENDOR_AUTH_USER_ID' with actual UUID from auth.users)
INSERT INTO user_profiles (auth_user_id, email, role, vendor_id)
SELECT au.id, au.email, 'vendor', v.id
FROM auth.users au
CROSS JOIN vendors v
WHERE au.email = 'vendor@example.com'
  AND v.email = 'vendor@example.com'
ON CONFLICT (auth_user_id) DO NOTHING;

-- Link Staff (replace 'STAFF_AUTH_USER_ID' with actual UUID from auth.users)
INSERT INTO user_profiles (auth_user_id, email, role, vendor_id, staff_id)
SELECT au.id, au.email, 'staff', s.vendor_id, s.id
FROM auth.users au
CROSS JOIN staff s
WHERE au.email = 'staff@example.com'
  AND s.email = 'staff@example.com'
ON CONFLICT (auth_user_id) DO NOTHING;
```

---

## Step 3: Test Login Credentials

Use these credentials in your mobile app:

### Super Admin
- **Email**: `admin@travelb2b.com`
- **Password**: `admin123`
- **Access**: Full platform access

### Vendor
- **Email**: `vendor@example.com`
- **Password**: `password123`
- **Access**: Vendor dashboard with resorts, bookings, etc.

### Staff
- **Email**: `staff@example.com`
- **Password**: `password123`
- **Access**: Staff dashboard (limited access)

---

## Step 4: Verify Setup

Run this SQL to verify everything is set up correctly:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('vendors', 'resorts', 'rooms', 'user_profiles', 'subscription_plans', 'staff')
ORDER BY table_name;

-- Check subscription plans
SELECT id, name, price, max_resorts, max_staff FROM subscription_plans;

-- Check vendors
SELECT id, name, email, status FROM vendors;

-- Check user profiles
SELECT up.id, up.email, up.role, v.name as vendor_name
FROM user_profiles up
LEFT JOIN vendors v ON up.vendor_id = v.id;
```

---

## Troubleshooting

### Error: "relation does not exist"
- Make sure you ran the entire SQL script
- Check if all tables were created (run verification query above)

### Error: "permission denied"
- Make sure you're running the SQL as the project owner
- Check RLS policies are created correctly

### Can't login with test credentials
- Verify auth users were created in Supabase Auth dashboard
- Verify user_profiles records were created and linked correctly
- Check that email matches exactly (case-sensitive)

### Auth user created but app shows "user not found"
- Run the SQL linking script (Option B above) to connect auth users to user_profiles
- Verify the auth_user_id in user_profiles matches the UUID in auth.users

---

## Next Steps

After setup is complete:

1. ✅ Update your `.env` file with Supabase credentials
2. ✅ Test login with the credentials above
3. ✅ Start building features!

---

**Need help?** Check the main README.md for more information.

