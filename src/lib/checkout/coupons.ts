import type { Coupon } from './types';
import {
  getMockInfluencerCoupons,
  getAllActiveRewardCoupons,
  markRewardRedeemed,
} from '@/lib/referral/mock';

export const WELCOME_COUPON_CODE = 'WELCOME10';

export const COUPONS: Coupon[] = [
  {
    code: 'STUDENT15',
    discount_percent: 15,
    min_order_cents: 999,
    max_uses: 999999,
    current_uses: 0,
    valid_from: '2026-01-01T00:00:00Z',
    valid_until: null,
    is_active: true,
  },
  {
    code: WELCOME_COUPON_CODE,
    discount_percent: 10,
    min_order_cents: 0,
    max_uses: 999999,
    current_uses: 0,
    valid_from: '2026-01-01T00:00:00Z',
    valid_until: null,
    is_active: true,
  },
];

function getInfluencerCoupons(): Coupon[] {
  return getMockInfluencerCoupons()
    .filter((ic) => ic.is_active)
    .map((ic) => ({
      code: ic.code,
      discount_percent: ic.discount_percent,
      min_order_cents: ic.min_order_cents,
      max_uses: 999999,
      current_uses: ic.total_uses,
      valid_from: ic.created_at,
      valid_until: null,
      is_active: true,
      type: 'influencer' as const,
    }));
}

export function validateCoupon(code: string, orderAmountCents?: number): Coupon | null {
  const normalized = code.toUpperCase();
  const allCoupons = [...COUPONS, ...getInfluencerCoupons(), ...getAllActiveRewardCoupons()];
  const coupon = allCoupons.find((c) => c.code === normalized);

  if (!coupon) return null;
  if (!coupon.is_active) return null;
  if (coupon.current_uses >= coupon.max_uses) return null;

  const now = new Date();
  if (new Date(coupon.valid_from) > now) return null;
  if (coupon.valid_until && new Date(coupon.valid_until) < now) return null;

  if (coupon.min_order_cents && orderAmountCents !== undefined && orderAmountCents < coupon.min_order_cents) {
    return null;
  }

  // Mark referral reward coupons as redeemed (single-use enforcement)
  if (coupon.type === 'referral_reward') {
    markRewardRedeemed(coupon.code);
  }

  return coupon;
}
