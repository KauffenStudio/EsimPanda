import { describe, it, expect } from 'vitest';
import { calculatePrice } from '../pricing';

// Plan IDs match mockPlans in src/lib/mock-data/plans.ts.
const VALID_PLAN_ID = 'p001-0001-4000-8000-000000000000'; // Europe 5GB 7 Days, retail: 1599
const VALID_RETAIL_CENTS = 1599;
const SMALL_PLAN_ID = 'p010-0001-4000-8000-000000000000'; // France 1GB 1 Day, retail: 499

describe('calculatePrice', () => {
  it('returns pricing for a valid plan', () => {
    const result = calculatePrice(VALID_PLAN_ID);
    expect(result).not.toBeNull();
    expect(result!.retail_price_cents).toBe(VALID_RETAIL_CENTS);
    expect(result!.discount_cents).toBe(0);
    expect(result!.subtotal_cents).toBe(VALID_RETAIL_CENTS);
  });

  it('applies STUDENT15 coupon for 15% discount', () => {
    const result = calculatePrice(VALID_PLAN_ID, 'STUDENT15');
    const expectedDiscount = Math.round((VALID_RETAIL_CENTS * 15) / 100);
    expect(result).not.toBeNull();
    expect(result!.retail_price_cents).toBe(VALID_RETAIL_CENTS);
    expect(result!.discount_cents).toBe(expectedDiscount);
    expect(result!.subtotal_cents).toBe(VALID_RETAIL_CENTS - expectedDiscount);
  });

  it('rejects coupon for plan below minimum order (€9.99)', () => {
    const result = calculatePrice(SMALL_PLAN_ID, 'STUDENT15');
    expect(result).not.toBeNull();
    expect(result!.discount_cents).toBe(0);
    expect(result!.subtotal_cents).toBe(499);
  });

  it('returns full price for invalid coupon', () => {
    const result = calculatePrice(VALID_PLAN_ID, 'INVALID');
    expect(result).not.toBeNull();
    expect(result!.discount_cents).toBe(0);
    expect(result!.subtotal_cents).toBe(VALID_RETAIL_CENTS);
  });

  it('returns null for unknown plan ID', () => {
    const result = calculatePrice('nonexistent-plan-id');
    expect(result).toBeNull();
  });
});
