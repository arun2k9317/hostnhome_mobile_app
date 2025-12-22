-- ============================================================================
-- HOSTNHOME MOBILE APP - COMPLETE DATABASE SETUP
-- ============================================================================
-- Run this script in your Supabase SQL Editor to set up all required tables
-- ============================================================================

-- ============================================================================
-- PART 1: Create helper function for updated_at timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 2: Create all tables (drop if exist for fresh start)
-- ============================================================================

-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS resorts CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;

-- SUBSCRIPTION PLANS TABLE
CREATE TABLE subscription_plans (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  duration_months INTEGER NOT NULL CHECK (duration_months > 0),
  max_resorts INTEGER NOT NULL CHECK (max_resorts > 0),
  max_staff INTEGER NOT NULL CHECK (max_staff > 0),
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VENDORS TABLE
CREATE TABLE vendors (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  about TEXT,
  logo TEXT,
  tagline VARCHAR(255),
  subscription_plan_id BIGINT REFERENCES subscription_plans(id) ON DELETE SET NULL,
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RESORTS TABLE
CREATE TABLE resorts (
  id BIGSERIAL PRIMARY KEY,
  vendor_id BIGINT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  amenities TEXT[],
  images TEXT[],
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vendor_id, slug)
);

-- ROOMS TABLE
CREATE TABLE rooms (
  id BIGSERIAL PRIMARY KEY,
  resort_id BIGINT NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  size DECIMAL(10, 2),
  amenities TEXT[],
  images TEXT[],
  availability_status VARCHAR(20) NOT NULL DEFAULT 'available' 
    CHECK (availability_status IN ('available', 'booked', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STAFF TABLE
CREATE TABLE staff (
  id BIGSERIAL PRIMARY KEY,
  vendor_id BIGINT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'agent' CHECK (role IN ('manager', 'agent')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QUOTATIONS TABLE
CREATE TABLE quotations (
  id BIGSERIAL PRIMARY KEY,
  vendor_id BIGINT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  resort_id BIGINT NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  guest_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  check_in TIMESTAMP WITH TIME ZONE NOT NULL,
  check_out TIMESTAMP WITH TIME ZONE NOT NULL,
  adults INTEGER NOT NULL CHECK (adults > 0),
  children INTEGER NOT NULL DEFAULT 0 CHECK (children >= 0),
  rooms INTEGER NOT NULL CHECK (rooms > 0),
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BOOKINGS TABLE
CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  vendor_id BIGINT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  quotation_id BIGINT REFERENCES quotations(id) ON DELETE SET NULL,
  resort_id BIGINT NOT NULL REFERENCES resorts(id) ON DELETE CASCADE,
  guest_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  check_in TIMESTAMP WITH TIME ZONE NOT NULL,
  check_out TIMESTAMP WITH TIME ZONE NOT NULL,
  adults INTEGER NOT NULL CHECK (adults > 0),
  children INTEGER NOT NULL DEFAULT 0 CHECK (children >= 0),
  rooms INTEGER NOT NULL CHECK (rooms > 0),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER PROFILES TABLE (links Supabase Auth users to app roles)
CREATE TABLE user_profiles (
  id BIGSERIAL PRIMARY KEY,
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'vendor', 'staff')),
  vendor_id BIGINT REFERENCES vendors(id) ON DELETE CASCADE,
  staff_id BIGINT REFERENCES staff(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT vendor_role_check CHECK (
    (role = 'super_admin' AND vendor_id IS NULL AND staff_id IS NULL) OR
    (role = 'vendor' AND vendor_id IS NOT NULL AND staff_id IS NULL) OR
    (role = 'staff' AND vendor_id IS NOT NULL AND staff_id IS NOT NULL)
  )
);

-- ============================================================================
-- PART 3: Create indexes for performance
-- ============================================================================
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX idx_vendors_slug ON vendors(slug);
CREATE INDEX idx_vendors_email ON vendors(email);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_resorts_vendor_id ON resorts(vendor_id);
CREATE INDEX idx_resorts_slug ON resorts(slug);
CREATE INDEX idx_resorts_status ON resorts(status);
CREATE INDEX idx_rooms_resort_id ON rooms(resort_id);
CREATE INDEX idx_rooms_type ON rooms(type);
CREATE INDEX idx_rooms_availability_status ON rooms(availability_status);
CREATE INDEX idx_staff_vendor_id ON staff(vendor_id);
CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_status ON staff(status);
CREATE INDEX idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);
CREATE INDEX idx_user_profiles_vendor_id ON user_profiles(vendor_id);
CREATE INDEX idx_user_profiles_staff_id ON user_profiles(staff_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_quotations_vendor_id ON quotations(vendor_id);
CREATE INDEX idx_quotations_resort_id ON quotations(resort_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_created_at ON quotations(created_at);
CREATE INDEX idx_bookings_vendor_id ON bookings(vendor_id);
CREATE INDEX idx_bookings_resort_id ON bookings(resort_id);
CREATE INDEX idx_bookings_quotation_id ON bookings(quotation_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_check_in ON bookings(check_in);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);

-- ============================================================================
-- PART 4: Enable Row Level Security (RLS)
-- ============================================================================
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE resorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 5: Create RLS Policies
-- ============================================================================

-- SUBSCRIPTION PLANS - Anyone can view active plans
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Super admins can manage subscription plans"
  ON subscription_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- VENDORS POLICIES
CREATE POLICY "Public can view active vendors"
  ON vendors FOR SELECT
  TO anon
  USING (status = 'active');

CREATE POLICY "Vendors can view own profile"
  ON vendors FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT vendor_id FROM user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage vendors"
  ON vendors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- RESORTS POLICIES
CREATE POLICY "Public can view active resorts"
  ON resorts FOR SELECT
  TO anon
  USING (
    status = 'active' AND
    vendor_id IN (SELECT id FROM vendors WHERE status = 'active')
  );

CREATE POLICY "Vendors can manage own resorts"
  ON resorts FOR ALL
  TO authenticated
  USING (
    vendor_id IN (
      SELECT vendor_id FROM user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
      AND vendor_id IS NOT NULL
    )
  );

CREATE POLICY "Super admins can view all resorts"
  ON resorts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- ROOMS POLICIES
CREATE POLICY "Public can view available rooms"
  ON rooms FOR SELECT
  TO anon
  USING (
    resort_id IN (
      SELECT resorts.id FROM resorts
      WHERE resorts.status = 'active'
      AND resorts.vendor_id IN (SELECT id FROM vendors WHERE status = 'active')
    )
  );

CREATE POLICY "Vendors can manage own resort rooms"
  ON rooms FOR ALL
  TO authenticated
  USING (
    resort_id IN (
      SELECT resorts.id FROM resorts
      INNER JOIN user_profiles ON resorts.vendor_id = user_profiles.vendor_id
      WHERE user_profiles.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can view all rooms"
  ON rooms FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- STAFF POLICIES
CREATE POLICY "Vendors and staff can view own organization staff"
  ON staff FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT vendor_id FROM user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
      AND vendor_id IS NOT NULL
    )
  );

CREATE POLICY "Vendors can manage staff"
  ON staff FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id IN (
      SELECT vendor_id FROM user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
      AND role = 'vendor'
    )
  );

CREATE POLICY "Vendors can update staff"
  ON staff FOR UPDATE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT vendor_id FROM user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
      AND role = 'vendor'
    )
  );

CREATE POLICY "Vendors can delete staff"
  ON staff FOR DELETE
  TO authenticated
  USING (
    vendor_id IN (
      SELECT vendor_id FROM user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
      AND role = 'vendor'
    )
  );

CREATE POLICY "Super admins can view all staff"
  ON staff FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- QUOTATIONS POLICIES
CREATE POLICY "Vendors can view own quotations"
  ON quotations FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT vendor_id FROM user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
      AND vendor_id IS NOT NULL
    )
  );

CREATE POLICY "Vendors can manage own quotations"
  ON quotations FOR ALL
  TO authenticated
  USING (
    vendor_id IN (
      SELECT vendor_id FROM user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
      AND vendor_id IS NOT NULL
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT vendor_id FROM user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
      AND vendor_id IS NOT NULL
    )
  );

CREATE POLICY "Super admins can view all quotations"
  ON quotations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- BOOKINGS POLICIES
CREATE POLICY "Vendors can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (
      SELECT vendor_id FROM user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
      AND vendor_id IS NOT NULL
    )
  );

CREATE POLICY "Vendors can manage own bookings"
  ON bookings FOR ALL
  TO authenticated
  USING (
    vendor_id IN (
      SELECT vendor_id FROM user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
      AND vendor_id IS NOT NULL
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT vendor_id FROM user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
      AND vendor_id IS NOT NULL
    )
  );

CREATE POLICY "Super admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.auth_user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- USER PROFILES POLICIES
-- Users can view their own profile (simple - no recursion)
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Note: For policies on other tables, use SECURITY DEFINER functions
-- See fix-rls-recursion.sql for the complete solution

-- ============================================================================
-- PART 6: Create triggers for updated_at timestamps
-- ============================================================================
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resorts_updated_at
  BEFORE UPDATE ON resorts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 7: Insert sample subscription plans
-- ============================================================================
INSERT INTO subscription_plans (name, description, price, duration_months, max_resorts, max_staff, features, is_active)
VALUES
  ('Basic', 'Perfect for small agencies getting started', 29.99, 1, 5, 3, 
   '["5 Resorts", "3 Staff Members", "Email Support", "Basic Analytics"]'::jsonb, true),
  ('Professional', 'Ideal for growing businesses', 99.99, 1, 20, 10, 
   '["20 Resorts", "10 Staff Members", "Priority Support", "Advanced Analytics", "Custom Branding"]'::jsonb, true),
  ('Enterprise', 'For large organizations with unlimited needs', 299.99, 1, 100, 100, 
   '["Unlimited Resorts", "Unlimited Staff", "24/7 Support", "Advanced Analytics", "Custom Branding", "API Access"]'::jsonb, true);

-- ============================================================================
-- PART 8: Insert dummy vendor data (will be linked to auth users)
-- ============================================================================
-- Note: These vendors will need auth users created via Supabase Auth dashboard
-- See instructions below for creating auth users

INSERT INTO vendors (name, business_name, slug, email, phone, address, about, subscription_plan_id, status)
VALUES
  ('Demo Vendor', 'Demo Travel Agency', 'demo-vendor', 'vendor@example.com', '+1 234 567 8900', 
   '123 Demo Street, Demo City', 'Demo vendor for testing', 2, 'active'),
  ('Test Vendor', 'Test Travel Services', 'test-vendor', 'test@example.com', '+1 234 567 8901', 
   '456 Test Avenue, Test City', 'Another test vendor', 1, 'active');

-- ============================================================================
-- PART 9: Insert dummy resort and room data
-- ============================================================================
INSERT INTO resorts (vendor_id, name, slug, description, location, amenities, status)
VALUES
  (1, 'Paradise Beach Resort', 'paradise-beach', 
   'Luxury beachfront resort with stunning ocean views', 'Malibu, California',
   ARRAY['Swimming Pool', 'Spa', 'Restaurant', 'Beach Access', 'WiFi'], 'active'),
  (1, 'Mountain View Lodge', 'mountain-view', 
   'Cozy mountain lodge with scenic mountain views', 'Aspen, Colorado',
   ARRAY['Fireplace', 'Restaurant', 'Ski Access', 'Hot Tub', 'WiFi'], 'active'),
  (2, 'City Center Hotel', 'city-center', 
   'Modern hotel in the heart of the city', 'New York, NY',
   ARRAY['Fitness Center', 'Restaurant', 'Business Center', 'WiFi'], 'active');

INSERT INTO rooms (resort_id, name, type, description, price, capacity, size, amenities, availability_status)
VALUES
  -- Paradise Beach Resort rooms
  (1, 'Ocean View Suite', 'Suite', 'Spacious suite with panoramic ocean views', 299.99, 2, 450.00,
   ARRAY['King Bed', 'Ocean View', 'Mini Bar', 'Balcony', 'WiFi'], 'available'),
  (1, 'Deluxe Room', 'Deluxe', 'Comfortable room with modern amenities', 199.99, 2, 350.00,
   ARRAY['Queen Bed', 'City View', 'WiFi', 'TV'], 'available'),
  -- Mountain View Lodge rooms
  (2, 'Mountain Suite', 'Suite', 'Cozy suite with fireplace and mountain views', 249.99, 4, 500.00,
   ARRAY['King Bed', 'Fireplace', 'Mountain View', 'Balcony', 'WiFi'], 'available'),
  (2, 'Standard Room', 'Standard', 'Comfortable room for couples', 149.99, 2, 300.00,
   ARRAY['Queen Bed', 'WiFi', 'TV'], 'available'),
  -- City Center Hotel rooms
  (3, 'Executive Suite', 'Suite', 'Luxurious suite with city views', 349.99, 2, 550.00,
   ARRAY['King Bed', 'City View', 'Work Desk', 'Mini Bar', 'WiFi'], 'available'),
  (3, 'Standard Room', 'Standard', 'Modern room with all amenities', 179.99, 2, 320.00,
   ARRAY['Queen Bed', 'WiFi', 'TV', 'Work Desk'], 'available');

-- ============================================================================
-- PART 10: Insert dummy staff data
-- ============================================================================
INSERT INTO staff (vendor_id, name, email, phone, role, status)
VALUES
  (1, 'John Manager', 'staff@example.com', '+1 234 567 8902', 'manager', 'active'),
  (1, 'Jane Agent', 'agent@example.com', '+1 234 567 8903', 'agent', 'active');

-- ============================================================================
-- SETUP COMPLETE MESSAGE
-- ============================================================================
DO $$
DECLARE
  table_count INTEGER;
  plan_count INTEGER;
  vendor_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name IN ('vendors', 'resorts', 'rooms', 'user_profiles', 'subscription_plans', 'staff');
  
  SELECT COUNT(*) INTO plan_count FROM subscription_plans;
  SELECT COUNT(*) INTO vendor_count FROM vendors;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ DATABASE SETUP COMPLETE!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Tables created: % of 6', table_count;
  RAISE NOTICE 'Subscription plans: %', plan_count;
  RAISE NOTICE 'Demo vendors: %', vendor_count;
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: You need to create auth users in Supabase Auth!';
  RAISE NOTICE '   See instructions in the setup guide.';
  RAISE NOTICE '============================================';
END $$;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================

