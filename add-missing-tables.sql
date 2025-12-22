-- ============================================================================
-- ADD MISSING TABLES: quotations and bookings
-- ============================================================================
-- Run this if you already have the database setup but missing these tables
-- ============================================================================

-- QUOTATIONS TABLE
CREATE TABLE IF NOT EXISTS quotations (
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
CREATE TABLE IF NOT EXISTS bookings (
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

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_quotations_vendor_id ON quotations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_quotations_resort_id ON quotations(resort_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON quotations(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_vendor_id ON bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_resort_id ON bookings(resort_id);
CREATE INDEX IF NOT EXISTS idx_bookings_quotation_id ON bookings(quotation_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON bookings(check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- ENABLE RLS
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- DROP EXISTING POLICIES IF THEY EXIST
DROP POLICY IF EXISTS "Vendors can view own quotations" ON quotations;
DROP POLICY IF EXISTS "Vendors can manage own quotations" ON quotations;
DROP POLICY IF EXISTS "Super admins can view all quotations" ON quotations;
DROP POLICY IF EXISTS "Vendors can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Vendors can manage own bookings" ON bookings;
DROP POLICY IF EXISTS "Super admins can view all bookings" ON bookings;

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

-- TRIGGERS
DROP TRIGGER IF EXISTS update_quotations_updated_at ON quotations;
CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verification
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ QUOTATIONS AND BOOKINGS TABLES ADDED!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Tables created with RLS policies';
  RAISE NOTICE 'You can now use bookings and quotations in your app';
  RAISE NOTICE '============================================';
END $$;

