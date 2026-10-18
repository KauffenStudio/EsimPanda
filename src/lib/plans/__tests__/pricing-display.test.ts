import { describe, it, expect } from 'vitest';
import {
  tagPlans,
  getOriginalPrice,
  getDiscountPercent,
  isSoldOut,
  DISPLAY_DISCOUNT_PERCENT,
} from '../pricing-display';

describe('tagPlans', () => {
  it('tags plan with lowest price-per-GB as bestValue', () => {
    const plans = [
      { id: 'a', data_gb: 3, duration_days: 14, retail_price_cents: 899 },
      { id: 'b', data_gb: 5, duration_days: 14, retail_price_cents: 1299 },
      { id: 'c', data_gb: 10, duration_days: 30, retail_price_cents: 2499 },
    ];
    const tagged = tagPlans(plans);
    const bestValue = tagged.find((p) => p.isBestValue);
    expect(bestValue?.id).toBe('c'); // 249.9 cents/GB is lowest
  });

  it('tags plan with most common duration as mostPopular', () => {
    const plans = [
      { id: 'a', data_gb: 3, duration_days: 14, retail_price_cents: 899 },
      { id: 'b', data_gb: 5, duration_days: 14, retail_price_cents: 1299 },
      { id: 'c', data_gb: 10, duration_days: 30, retail_price_cents: 2499 },
    ];
    const tagged = tagPlans(plans);
    const mostPopular = tagged.find((p) => p.isMostPopular);
    // 14-day is most common (2 plans), first match is 'a'
    expect(mostPopular?.id).toBe('a');
  });

  it('returns empty array for empty input', () => {
    const tagged = tagPlans([]);
    expect(tagged).toEqual([]);
  });

  it('single plan gets bestValue but not mostPopular', () => {
    const plans = [
      { id: 'x', data_gb: 5, duration_days: 7, retail_price_cents: 999 },
    ];
    const tagged = tagPlans(plans);
    expect(tagged[0].isBestValue).toBe(true);
    expect(tagged[0].isMostPopular).toBe(false);
  });

  it('does not assign bestValue and mostPopular to same plan (no double-badge)', () => {
    // Make plan 'a' both cheapest per GB and most common duration
    const plans = [
      { id: 'a', data_gb: 20, duration_days: 7, retail_price_cents: 1000 }, // 50 cents/GB, duration 7
      { id: 'b', data_gb: 1, duration_days: 7, retail_price_cents: 500 },   // 500 cents/GB, duration 7
      { id: 'c', data_gb: 2, duration_days: 30, retail_price_cents: 800 },  // 400 cents/GB, duration 30
    ];
    const tagged = tagPlans(plans);
    const doubleTagged = tagged.filter((p) => p.isBestValue && p.isMostPopular);
    expect(doubleTagged).toHaveLength(0);
    // 'a' should be bestValue (lowest cents/GB)
    expect(tagged.find((p) => p.id === 'a')?.isBestValue).toBe(true);
    // mostPopular should go to 'b' (next plan with duration 7)
    expect(tagged.find((p) => p.id === 'b')?.isMostPopular).toBe(true);
  });
});

describe('getOriginalPrice', () => {
  it('returns 0 for a 1GB plan (no discount tier)', () => {
    expect(getOriginalPrice(449, 1)).toBe(0);
  });

  it('returns the price the live price is 15% off', () => {
    // 899 / 0.85 = 1057.6 → 1058
    expect(getOriginalPrice(899, 3)).toBe(1058);
    expect(getOriginalPrice(1299, 5)).toBe(1528);
  });
});

describe('getDiscountPercent', () => {
  it('returns 0 for a 1GB plan', () => {
    expect(getDiscountPercent(449, 1)).toBe(0);
  });

  it('is a flat 15% on every tier above 1GB', () => {
    for (const gb of [3, 5, 8, 20, 50]) {
      expect(getDiscountPercent(1299, gb)).toBe(DISPLAY_DISCOUNT_PERCENT);
    }
  });

  it('agrees with the struck-through price it sits beside', () => {
    const retail = 2099;
    const original = getOriginalPrice(retail, 20);
    expect(Math.round(((original - retail) / original) * 100)).toBe(getDiscountPercent(retail, 20));
  });
});

describe('sold-out 2GB tier', () => {
  it('marks only 2GB plans as sold out', () => {
    expect(isSoldOut(2)).toBe(true);
    for (const gb of [1, 3, 5, 8, 20, 50]) expect(isSoldOut(gb)).toBe(false);
  });

  it('never badges a sold-out plan', () => {
    const plans = [
      { id: 'two', data_gb: 2, duration_days: 30, retail_price_cents: 100 }, // cheapest per GB
      { id: 'three', data_gb: 3, duration_days: 30, retail_price_cents: 999 },
      { id: 'five', data_gb: 5, duration_days: 30, retail_price_cents: 1299 },
    ];
    const tagged = tagPlans(plans);
    const two = tagged.find((p) => p.id === 'two')!;
    expect(two.isBestValue).toBe(false);
    expect(two.isMostPopular).toBe(false);
    expect(tagged.find((p) => p.id === 'five')?.isBestValue).toBe(true);
  });
});
