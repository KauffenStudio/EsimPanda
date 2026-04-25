import { describe, it, expect } from 'vitest';
import { calculatePrice } from '../pricing';

// Use the first mock plan ID from plans.ts
const VALID_PLAN_ID = 'p001-0001-4000-8000-000000000001'; // Europe 5GB 7 Days, retail: 1499
const SMALL_PLAN_ID = 'p002-0001-4000-8000-000000000001'; // France 1GB 1 Day, retail: 499

describe('calculatePrice', () => {
  it('returns pricing for a valid plan', () => {
    const result = calculatePrice(VALID_PLAN_ID);
    expect(result).not.toBeNull();
    expect(result!.retail_price_cents).toBe(1499);
    expect(result!.discount_cents).toBe(0);
    expect(result!.subtotal_cents).toBe(1499);
  });

  it('applies STUDENT15 coupon for 15% discount', () => {
    const result = calculatePrice(VALID_PLAN_ID, 'STUDENT15');
    expect(result).not.toBeNull();
    expect(result!.retail_price_cents).toBe(1499);
    expect(result!.discount_cents).toBe(Math.round(1499 * 15 / 100)); // 225
    expect(result!.subtotal_cents).toBe(1499 - Math.round(1499 * 15 / 100)); // 1274
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
    expect(result!.subtotal_cents).toBe(1499);
  });

  it('returns null for unknown plan ID', () => {
    const result = calculatePrice('nonexistent-plan-id');
    expect(result).toBeNull();
  });
});
