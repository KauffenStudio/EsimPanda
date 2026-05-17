import type { Coupon } from './types';
import {
  getMockInfluencerCoupons,
  getAllActiveRewardCoupons,
  markRewardRedeemed,
} from '@/lib/referral/mock';
import { getRate, type CurrencyCode } from '@/lib/currency/rates';

export const WELCOME_COUPON_CODE = 'WELCOME10';

const FLAT_MIN_CURRENCIES: ReadonlySet<CurrencyCode> = new Set(['USD', 'EUR', 'GBP']);
const COUPON_MIN_BASE_CENTS = 999;

/**
 * Per-currency coupon minimum order, expressed in that currency's cents.
 * USD/EUR/GBP use a flat 999. BRL/JPY/CNY convert from a €9.99 base via the
 * USD cross-rate: 999 EUR-cents → USD (/ RATES.EUR) → target (* RATES[target]).
 */
export function getCouponMinOrderCents(currency: CurrencyCode): number {
  if (FLAT_MIN_CURRENCIES.has(currency)) return COUPON_MIN_BASE_CENTS;
  const usdCents = COUPON_MIN_BASE_CENTS / getRate('EUR'); // 999 / 0.92 ≈ 1086
  return Math.round(usdCents * getRate(currency)); // BRL/JPY/CNY
}

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

export function validateCoupon(
  code: string,
  orderAmountCents?: number,
  minOrderOverride?: number,
): Coupon | null {
  const normalized = code.toUpperCase();
  const allCoupons = [...COUPONS, ...getInfluencerCoupons(), ...getAllActiveRewardCoupons()];
  const coupon = allCoupons.find((c) => c.code === normalized);

  if (!coupon) return null;
  if (!coupon.is_active) return null;
  if (coupon.current_uses >= coupon.max_uses) return null;

  const now = new Date();
  if (new Date(coupon.valid_from) > now) return null;
  if (coupon.valid_until && new Date(coupon.valid_until) < now) return null;

  // Currency-aware override applies ONLY to coupons that already have a non-zero
  // minimum — a zero-minimum coupon (WELCOME10) is never floored by the override.
  const staticMin = coupon.min_order_cents ?? 0;
  const effectiveMin = staticMin > 0 ? (minOrderOverride ?? staticMin) : 0;
  if (effectiveMin && orderAmountCents !== undefined && orderAmountCents < effectiveMin) {
    return null;
  }

  // Mark referral reward coupons as redeemed (single-use enforcement)
  if (coupon.type === 'referral_reward') {
    markRewardRedeemed(coupon.code);
  }

  return coupon;
}
