import type {
  ReferralCode,
  ReferralClick,
  ReferralReward,
  ReferralStats,
  InfluencerCoupon,
} from './types';
import type { Coupon } from '@/lib/checkout/types';

// In-memory Maps for dev mode (consistent with Phase 4 pattern)
const referralCodes = new Map<string, ReferralCode>();
const referralClicks = new Map<string, ReferralClick[]>();
const referralRewards = new Map<string, ReferralReward[]>();

// Pre-seed mock referral code
referralCodes.set('mock-user-1', {
  code: 'ABC123',
  user_id: 'mock-user-1',
  user_email: 'test@example.com',
  created_at: '2026-04-01T00:00:00Z',
});

// Pre-seed mock influencer coupons
const influencerCoupons: InfluencerCoupon[] = [
  {
    code: 'MARIA10',
    influencer_name: 'Maria Silva',
    social_url: 'https://instagram.com/mariasilva',
    notes: 'Travel blogger, Portugal focus',
    discount_percent: 10,
    min_order_cents: 999,
    total_uses: 23,
    total_revenue_cents: 34500,
    last_used: '2026-04-20T14:30:00Z',
    is_active: true,
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    code: 'JOAO15',
    influencer_name: 'Joao Santos',
    social_url: 'https://youtube.com/joaosantos',
    notes: 'Tech reviewer, Lisbon',
    discount_percent: 10,
    min_order_cents: 999,
    total_uses: 8,
    total_revenue_cents: 12000,
    last_used: '2026-04-18T09:15:00Z',
    is_active: true,
    created_at: '2026-03-15T00:00:00Z',
  },
];

// --- Referral Code helpers ---

export function getMockReferralCode(userId: string): ReferralCode | undefined {
  return referralCodes.get(userId);
}

export function findMockReferralCodeByCode(code: string): ReferralCode | undefined {
  for (const rc of referralCodes.values()) {
    if (rc.code === code) return rc;
  }
  return undefined;
}

export function setMockReferralCode(userId: string, code: ReferralCode): void {
  referralCodes.set(userId, code);
}

// --- Referral Stats ---

export function getMockReferralStats(userId: string): ReferralStats {
  const rewards = referralRewards.get(userId) || [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyRewards = rewards.filter((r) => {
    const earned = new Date(r.earned_at);
    return earned.getMonth() === currentMonth && earned.getFullYear() === currentYear;
  });

  // Next month reset date
  const nextMonth = new Date(currentYear, currentMonth + 1, 1);

  return {
    friends_invited: rewards.length,
    free_plans_earned: rewards.length,
    free_plans_remaining: Math.max(0, 5 - monthlyRewards.length),
    monthly_cap: 5,
    cap_resets_at: nextMonth.toISOString(),
  };
}

// --- Rewards ---

export function getMockRewards(userId: string): ReferralReward[] {
  return referralRewards.get(userId) || [];
}

export function addMockReward(userId: string, reward: ReferralReward): void {
  const existing = referralRewards.get(userId) || [];
  existing.push(reward);
  referralRewards.set(userId, existing);
}

// --- Influencer Coupons ---

export function getMockInfluencerCoupons(): InfluencerCoupon[] {
  return influencerCoupons;
}

export function addMockInfluencerCoupon(coupon: InfluencerCoupon): void {
  influencerCoupons.push(coupon);
}

export function updateMockInfluencerCoupon(
  code: string,
  updates: Partial<InfluencerCoupon>,
): void {
  const index = influencerCoupons.findIndex((c) => c.code === code);
  if (index !== -1) {
    influencerCoupons[index] = { ...influencerCoupons[index], ...updates };
  }
}

// --- Bridge: Referral Rewards -> Coupon pool ---

export function getAllActiveRewardCoupons(): Coupon[] {
  const coupons: Coupon[] = [];
  for (const rewards of referralRewards.values()) {
    for (const reward of rewards) {
      if (!reward.redeemed) {
        coupons.push({
          code: reward.coupon_code,
          discount_percent: 100,
          min_order_cents: 0,
          max_uses: 1,
          current_uses: 0,
          valid_from: reward.earned_at,
          valid_until: null,
          is_active: true,
          type: 'referral_reward',
        });
      }
    }
  }
  return coupons;
}

export function markRewardRedeemed(couponCode: string): void {
  for (const rewards of referralRewards.values()) {
    const reward = rewards.find((r) => r.coupon_code === couponCode);
    if (reward) {
      reward.redeemed = true;
      return;
    }
  }
}
