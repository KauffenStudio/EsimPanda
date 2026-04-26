-- Phase 8: Referral system

CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE, -- 6-char uppercase alphanumeric (e.g., "A3KM9X")
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL REFERENCES referral_codes(code) ON DELETE CASCADE,
  ip TEXT,
  clicked_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  coupon_code TEXT NOT NULL UNIQUE, -- REF-XXXXXXXX format, 100% off single-use
  redeemed BOOLEAN DEFAULT false,
  earned_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 8: Influencer coupons (admin-managed)

CREATE TABLE influencer_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- e.g., "MARIA10"
  influencer_name TEXT NOT NULL,
  social_url TEXT,
  notes TEXT,
  discount_percent INTEGER NOT NULL DEFAULT 10,
  min_order_cents INTEGER NOT NULL DEFAULT 999,
  total_uses INTEGER DEFAULT 0,
  total_revenue_cents INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 9: Push notification subscriptions

CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 9: Notification preferences (per user)

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  expiry_alerts BOOLEAN DEFAULT true,
  usage_alerts BOOLEAN DEFAULT true,
  promotions BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_clicks_code ON referral_clicks(code);
CREATE INDEX idx_referral_rewards_user ON referral_rewards(referrer_user_id);
CREATE INDEX idx_referral_rewards_coupon ON referral_rewards(coupon_code);
CREATE INDEX idx_influencer_coupons_code ON influencer_coupons(code);
CREATE INDEX idx_influencer_coupons_active ON influencer_coupons(is_active) WHERE is_active = true;
CREATE INDEX idx_push_subscriptions_email ON push_subscriptions(user_email);
CREATE INDEX idx_notification_prefs_user ON notification_preferences(user_id);

-- Enable RLS
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Referral codes: users can read their own
CREATE POLICY "Users can read own referral code"
  ON referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral code"
  ON referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Referral rewards: users can read their own
CREATE POLICY "Users can read own referral rewards"
  ON referral_rewards FOR SELECT
  USING (auth.uid() = referrer_user_id);

-- Influencer coupons: public read for active coupons (needed for coupon validation at checkout)
CREATE POLICY "Public can read active influencer coupons"
  ON influencer_coupons FOR SELECT
  USING (is_active = true);

-- Push subscriptions: service role only (server-side management)
CREATE POLICY "Service role manages push subscriptions"
  ON push_subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Notification preferences: users manage their own
CREATE POLICY "Users can read own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Orders: users can read their own orders, service role for inserts
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role updates orders"
  ON orders FOR UPDATE
  USING (true);

-- eSIMs: users can read their own via order join
CREATE POLICY "Users can read own esims"
  ON esims FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = esims.order_id
      AND orders.user_id = auth.uid()
    )
  );
