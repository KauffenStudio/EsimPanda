import { describe, it, expect } from 'vitest';
import { migrateCart } from '../cart';

// migrateCart is the persist `migrate` function for the cart store.
// CHK-08: any persisted cart from a version < 2 holds dead v1.0 mock plan IDs
// that no longer resolve in Supabase, so it is purged to a clean empty cart.
// The v2 case is a passthrough — the persisted state is already current.
const EMPTY_CART = { items: [], coupon_code: null, discount_percent: 0 };

// A representative pre-v1.1 persisted payload: items hold mock plan objects.
const stalePersistedState = {
  items: [{ plan: { id: 'p010-0001-4000-8000-000000000000' } }],
  coupon_code: 'WELCOME10',
  discount_percent: 10,
};

describe('migrateCart', () => {
  it('migrate(state, 0) returns a clean empty cart (implicit v1.0 cart)', () => {
    expect(migrateCart(stalePersistedState, 0)).toEqual(EMPTY_CART);
  });

  it('migrate(state, 1) returns a clean empty cart (any version < 2)', () => {
    expect(migrateCart(stalePersistedState, 1)).toEqual(EMPTY_CART);
  });

  it('migrate(state, 2) returns the passed state unchanged (current version passthrough)', () => {
    const currentState = {
      items: [{ plan: { id: 'plan-france-5gb' } }],
      coupon_code: null,
      discount_percent: 0,
    };
    expect(migrateCart(currentState, 2)).toBe(currentState);
  });
});
