import { describe, it, expect } from 'vitest';
import { validateCoupon, getCouponMinOrderCents } from '../coupons';
import { getRate } from '@/lib/currency/rates';
import { generateReferralCode, checkAndFulfillReward, getReferralData } from '@/lib/referral/actions';

describe('validateCoupon', () => {
  it('returns Coupon object for STUDENT15', () => {
    const result = validateCoupon('STUDENT15');
    expect(result).not.toBeNull();
    expect(result!.code).toBe('STUDENT15');
    expect(result!.discount_percent).toBe(15);
    expect(result!.is_active).toBe(true);
  });

  it('returns null for invalid code', () => {
    const result = validateCoupon('INVALID');
    expect(result).toBeNull();
  });

  it('validates WELCOME10 at 10% with no minimum order', () => {
    const result = validateCoupon('WELCOME10', 100);
    expect(result).not.toBeNull();
    expect(result!.code).toBe('WELCOME10');
    expect(result!.discount_percent).toBe(10);
  });

  it('WELCOME10 is case-insensitive', () => {
    const result = validateCoupon('welcome10');
    expect(result).not.toBeNull();
    expect(result!.code).toBe('WELCOME10');
  });

  it('is case-insensitive', () => {
    const result = validateCoupon('student15');
    expect(result).not.toBeNull();
    expect(result!.code).toBe('STUDENT15');
    expect(result!.discount_percent).toBe(15);
  });

  it('returns null when order is below min_order_cents', () => {
    const result = validateCoupon('STUDENT15', 499);
    expect(result).toBeNull();
  });

  it('returns coupon when order meets min_order_cents', () => {
    const result = validateCoupon('STUDENT15', 999);
    expect(result).not.toBeNull();
    expect(result!.code).toBe('STUDENT15');
  });

  it('returns coupon when no order amount provided', () => {
    const result = validateCoupon('STUDENT15');
    expect(result).not.toBeNull();
  });

  it('validates influencer coupons at 10% discount', () => {
    const result = validateCoupon('MARIA10', 1500);
    expect(result).not.toBeNull();
    expect(result?.discount_percent).toBe(10);
  });

  it('rejects influencer coupon below min order', () => {
    const result = validateCoupon('MARIA10', 500); // below 999 cents
    expect(result).toBeNull();
  });

  it('rejects unknown coupon code', () => {
    const result = validateCoupon('UNKNOWN999');
    expect(result).toBeNull();
  });

  it('validates referral reward coupon at 100% discount', async () => {
    const code = await generateReferralCode('coupon-test-user', 'ctest@test.com');
    await checkAndFulfillReward(code.code, 'buyer-ctest@test.com');
    const data = await getReferralData('coupon-test-user');
    const rewardCode = data.rewards[0].coupon_code;

    const result = validateCoupon(rewardCode);
    expect(result).not.toBeNull();
    expect(result?.discount_percent).toBe(100);
    expect(result?.type).toBe('referral_reward');
  });

  it('rejects referral reward coupon after redemption (single-use)', async () => {
    const code = await generateReferralCode('coupon-test-user-2', 'ctest2@test.com');
    await checkAndFulfillReward(code.code, 'buyer-ctest2@test.com');
    const data = await getReferralData('coupon-test-user-2');
    const rewardCode = data.rewards[0].coupon_code;

    // First validation should succeed (and mark as redeemed)
    const first = validateCoupon(rewardCode);
    expect(first).not.toBeNull();

    // Second validation should fail (redeemed = true, no longer in active pool)
    const second = validateCoupon(rewardCode);
    expect(second).toBeNull();
  });
});

describe('currency-aware minimum order', () => {
  it('getCouponMinOrderCents returns a flat 999 for USD/EUR/GBP', () => {
    expect(getCouponMinOrderCents('USD')).toBe(999);
    expect(getCouponMinOrderCents('EUR')).toBe(999);
    expect(getCouponMinOrderCents('GBP')).toBe(999);
  });

  it('getCouponMinOrderCents converts the €9.99 base via USD cross-rate for BRL/JPY/CNY', () => {
    // 999 EUR-cents → USD (999 / RATES.EUR) → target (* RATES[target]).
    for (const target of ['BRL', 'JPY', 'CNY'] as const) {
      const expected = Math.round((999 / getRate('EUR')) * getRate(target));
      expect(getCouponMinOrderCents(target)).toBe(expected);
    }
    // Concrete values pinned to the static rate table.
    expect(getCouponMinOrderCents('BRL')).toBe(5560);
    expect(getCouponMinOrderCents('JPY')).toBe(168853);
    expect(getCouponMinOrderCents('CNY')).toBe(7862);
  });

  it('validateCoupon rejects when the order total is below the currency-aware override', () => {
    // STUDENT15 has min_order_cents 999. An order one cent below the EUR override
    // (also 999) must be rejected even though it would pass a zero override.
    const eurOverride = getCouponMinOrderCents('EUR');
    expect(validateCoupon('STUDENT15', eurOverride - 1, eurOverride)).toBeNull();
    expect(validateCoupon('STUDENT15', eurOverride, eurOverride)).not.toBeNull();
  });

  it('validateCoupon does NOT floor a zero-minimum coupon (WELCOME10) with an override', () => {
    // WELCOME10 has min_order_cents 0 — the currency-aware override must not impose
    // a minimum on it.
    const largeOverride = getCouponMinOrderCents('JPY'); // ~168853
    const result = validateCoupon('WELCOME10', 100, largeOverride);
    expect(result).not.toBeNull();
    expect(result!.code).toBe('WELCOME10');
  });
});
