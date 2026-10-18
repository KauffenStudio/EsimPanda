import type { Coupon } from './types';
import {
  getMockInfluencerCoupons,
  getAllActiveRewardCoupons,
  markRewardRedeemed,
} from '@/lib/referral/mock';
import { getRate, type CurrencyCode } from '@/lib/currency/rates';

export const WELCOME_COUPON_CODE = 'WELCOME10';

/** Homepage promo code: €5 off orders from €20 (VAT-inclusive). */
export const PANDA5_COUPON_CODE = 'PANDA5';
export const PANDA5_AMOUNT_EUR_CENTS = 500;
export const PANDA5_MIN_TOTAL_EUR_CENTS = 2000;

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
  {
    code: PANDA5_COUPON_CODE,
    discount_percent: 0,
    discount_amount_eur_cents: PANDA5_AMOUNT_EUR_CENTS,
    // Below ~€15 pre-tax a €5 discount eats the whole margin on a slice of the
    // catalog; €20 VAT-inclusive keeps every eligible plan profitable.
    min_total_eur_cents: PANDA5_MIN_TOTAL_EUR_CENTS,
    max_uses: 999999,
    current_uses: 0,
    valid_from: '2026-01-01T00:00:00Z',
    valid_until: null,
    is_active: true,
  },
];

/**
 * Discount a coupon takes off a plan, in USD cents (the currency Stripe
 * charges). Fixed-euro coupons convert at the static rate and never exceed
 * the price itself.
 */
export function getCouponDiscountCents(coupon: Coupon, retailUsdCents: number): number {
  if (coupon.discount_amount_eur_cents) {
    const usdCents = Math.round(coupon.discount_amount_eur_cents / getRate('EUR'));
    return Math.min(usdCents, retailUsdCents);
  }
  return Math.round((retailUsdCents * coupon.discount_percent) / 100);
}

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
  grossTotalEurCents?: number,
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

  // VAT-inclusive euro minimum (PANDA5). Skipped when the caller has no order
  // context, the same way the min_order_cents gate is.
  if (
    coupon.min_total_eur_cents &&
    grossTotalEurCents !== undefined &&
    grossTotalEurCents < coupon.min_total_eur_cents
  ) {
    return null;
  }

  // Mark referral reward coupons as redeemed (single-use enforcement)
  if (coupon.type === 'referral_reward') {
    markRewardRedeemed(coupon.code);
  }

  return coupon;
}
