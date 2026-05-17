import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fixturePlans } from '@/lib/__test-fixtures__/catalog';

// ── Supabase read-layer mock ─────────────────────────────────────────────────
// calculatePrice resolves plans via getPlanById (Supabase). Mock the read module
// with the stable catalog fixtures so the cutover does not cascade test breakage.
vi.mock('@/lib/db/destinations', () => ({
  getPlanById: vi.fn(async (planId: string) =>
    fixturePlans.find((p) => p.id === planId) ?? null,
  ),
}));

import { calculatePrice } from '../pricing';

// Fixture plans (src/lib/__test-fixtures__/catalog.ts):
//   plan-france-5gb → retail 1199 (≥ 999, coupon-eligible)
//   plan-france-1gb → retail  449 (< 999, below the coupon minimum)
const VALID_PLAN_ID = 'plan-france-5gb';
const VALID_RETAIL_CENTS = 1199;
const SMALL_PLAN_ID = 'plan-france-1gb';
const SMALL_RETAIL_CENTS = 449;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('calculatePrice', () => {
  it('returns pricing for a valid plan', async () => {
    const result = await calculatePrice(VALID_PLAN_ID);
    expect(result).toMatchObject({
      retail_price_cents: VALID_RETAIL_CENTS,
      discount_cents: 0,
      subtotal_cents: VALID_RETAIL_CENTS,
    });
  });

  it('applies STUDENT15 coupon for 15% discount', async () => {
    const result = await calculatePrice(VALID_PLAN_ID, 'STUDENT15');
    const expectedDiscount = Math.round((VALID_RETAIL_CENTS * 15) / 100);
    expect(result).toMatchObject({
      retail_price_cents: VALID_RETAIL_CENTS,
      discount_cents: expectedDiscount,
      subtotal_cents: VALID_RETAIL_CENTS - expectedDiscount,
    });
  });

  it('rejects coupon for a plan below the currency-aware minimum order', async () => {
    const result = await calculatePrice(SMALL_PLAN_ID, 'STUDENT15');
    expect(result).toMatchObject({
      discount_cents: 0,
      subtotal_cents: SMALL_RETAIL_CENTS,
    });
  });

  it('returns full price for an invalid coupon', async () => {
    const result = await calculatePrice(VALID_PLAN_ID, 'INVALID');
    expect(result).toMatchObject({
      discount_cents: 0,
      subtotal_cents: VALID_RETAIL_CENTS,
    });
  });

  it('returns null for an unknown plan ID (no mock IDs accepted — CHK-06)', async () => {
    const result = await calculatePrice('00000000-0000-0000-0000-000000000000');
    expect(result).toBeNull();
  });
});
