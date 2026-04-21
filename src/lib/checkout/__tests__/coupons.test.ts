import { describe, it, expect } from 'vitest';
import { validateCoupon } from '../coupons';

describe('validateCoupon', () => {
  it('returns Coupon object for STUDENT30', () => {
    const result = validateCoupon('STUDENT30');
    expect(result).not.toBeNull();
    expect(result!.code).toBe('STUDENT30');
    expect(result!.discount_percent).toBe(30);
    expect(result!.is_active).toBe(true);
  });

  it('returns null for invalid code', () => {
    const result = validateCoupon('INVALID');
    expect(result).toBeNull();
  });

  it('is case-insensitive', () => {
    const result = validateCoupon('student30');
    expect(result).not.toBeNull();
    expect(result!.code).toBe('STUDENT30');
    expect(result!.discount_percent).toBe(30);
  });
});
