-- Destinations synced from CELITECH
CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  iso_code TEXT NOT NULL UNIQUE,
  region TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Plans/packages synced from CELITECH
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
  wholesale_plan_id TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'celitech',
  name TEXT NOT NULL,
  data_gb NUMERIC NOT NULL,
  duration_days INTEGER NOT NULL,
  wholesale_price_cents INTEGER NOT NULL,
  retail_price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(wholesale_plan_id, provider)
);

-- User profiles extending Supabase Auth
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  referral_code TEXT UNIQUE,
  referral_credits_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Orders (guest + authenticated)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  email TEXT NOT NULL,
  plan_id UUID REFERENCES plans(id),
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount_paid_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  coupon_code TEXT,
  discount_cents INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'payment_confirmed', 'provisioning',
                      'provisioned', 'delivered', 'active', 'expired',
                      'provision_failed', 'refund_initiated', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- eSIMs provisioned from wholesale
CREATE TABLE esims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  iccid TEXT UNIQUE,
  wholesale_esim_id TEXT,
  activation_code_encrypted TEXT,
  manual_activation_code TEXT,
  smdp_address TEXT,
  ios_activation_link TEXT,
  android_activation_link TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'expired', 'deactivated')),
  data_total_gb NUMERIC,
  data_used_gb NUMERIC DEFAULT 0,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  last_usage_check TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_destinations_iso ON destinations(iso_code);
CREATE INDEX idx_destinations_slug ON destinations(slug);
CREATE INDEX idx_plans_destination ON plans(destination_id);
CREATE INDEX idx_plans_active ON plans(is_active) WHERE is_active = true;
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_esims_iccid ON esims(iccid);
CREATE INDEX idx_esims_order ON esims(order_id);

-- Enable RLS on all tables
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE esims ENABLE ROW LEVEL SECURITY;

-- Public read access for catalog (destinations + plans)
CREATE POLICY "Public can read active destinations"
  ON destinations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can read active plans"
  ON plans FOR SELECT
  USING (is_active = true);

-- Profile access (own data only)
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
