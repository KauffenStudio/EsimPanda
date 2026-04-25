export interface ReferralCode {
  code: string; // 6-char uppercase alphanumeric (e.g., "A3KM9X")
  user_id: string;
  user_email: string;
  created_at: string;
}

export interface ReferralStats {
  friends_invited: number;
  free_plans_earned: number;
  free_plans_remaining: number;
  monthly_cap: number; // always 5
  cap_resets_at: string; // ISO date of next month reset
}

export interface ReferralReward {
  id: string;
  referrer_user_id: string;
  referred_email: string;
  coupon_code: string; // REF-XXXXXXXX format, 100% off single-use
  redeemed: boolean;
  earned_at: string;
}

export interface ReferralClick {
  code: string;
  clicked_at: string;
  ip?: string;
}

export interface InfluencerCoupon {
  code: string;
  influencer_name: string;
  social_url: string;
  notes: string;
  discount_percent: 10; // Always 10% per locked decision
  min_order_cents: 999; // Always EUR 9.99 per locked decision
  total_uses: number;
  total_revenue_cents: number;
  last_used: string | null;
  is_active: boolean;
  created_at: string;
}
