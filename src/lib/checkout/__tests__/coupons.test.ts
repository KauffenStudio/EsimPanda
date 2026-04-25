import { describe, it, expect } from 'vitest';
import { validateCoupon } from '../coupons';

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
});
