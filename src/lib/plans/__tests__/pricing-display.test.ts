import { describe, it, expect } from 'vitest';
import { tagPlans, getOriginalPrice, getDiscountPercent } from '../pricing-display';

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

  it('returns an inflated price ending in 99 for a 3GB plan', () => {
    // 899 * 1.25 = 1123.75 → ceil(11.2375) * 100 - 1 = 1200 - 1 = 1199
    const original = getOriginalPrice(899, 3);
    expect(original).toBe(1199);
    expect(original % 100).toBe(99);
  });

  it('returns an inflated price ending in 99 for a 5GB plan', () => {
    // 1299 * 1.45 = 1883.55 → ceil(18.8355) * 100 - 1 = 1900 - 1 = 1899
    const original = getOriginalPrice(1299, 5);
    expect(original).toBe(1899);
    expect(original % 100).toBe(99);
  });
});

describe('getDiscountPercent', () => {
  it('returns 0 for a 1GB plan', () => {
    expect(getDiscountPercent(449, 1)).toBe(0);
  });

  it('returns roughly 30% for a 5GB plan', () => {
    // original 1899, retail 1299 → (1899-1299)/1899 = 31.6% → round 32
    const pct = getDiscountPercent(1299, 5);
    expect(pct).toBeGreaterThanOrEqual(28);
    expect(pct).toBeLessThanOrEqual(33);
  });

  it('returns roughly 20% for a 3GB plan', () => {
    // original 1199, retail 899 → (1199-899)/1199 = 25% → round 25
    const pct = getDiscountPercent(899, 3);
    expect(pct).toBeGreaterThanOrEqual(18);
    expect(pct).toBeLessThanOrEqual(27);
  });
});
