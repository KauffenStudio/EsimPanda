import { describe, it, expect } from 'vitest';
import { formatPrice, convertPrice } from '../rates';

// Static RATES table (base USD): USD:1, EUR:0.92, GBP:0.79, BRL:5.12, JPY:155.5, CNY:7.24.
// Expected display strings are computed from convertPrice so the tests stay in sync
// with the rate table.
describe('formatPrice', () => {
  it('renders JPY without subunit decimals — ¥1553 for 999 USD-cents (the JPY-bug fix)', () => {
    // convertPrice(999,'JPY') = round(999 * 155.5) = 155345 cents.
    // Correct display divides by 100 and rounds → ¥1553 (NOT the buggy ¥155345).
    expect(convertPrice(999, 'JPY')).toBe(155345);
    expect(formatPrice(999, 'JPY')).toBe('¥1553');
  });

  it('renders USD with two decimals — $9.99 (regression guard, unchanged path)', () => {
    expect(formatPrice(999, 'USD')).toBe('$9.99');
  });

  it('renders CNY with two decimals (regression guard — /100 + toFixed(2) path)', () => {
    // convertPrice(999,'CNY') = round(999 * 7.24) = 7233 → (7233/100).toFixed(2) = '72.33'.
    const cnyCents = convertPrice(999, 'CNY');
    expect(formatPrice(999, 'CNY')).toBe(`¥${(cnyCents / 100).toFixed(2)}`);
    expect(formatPrice(999, 'CNY')).toBe('¥72.33');
  });

  it('renders BRL with two decimals (regression guard — /100 + toFixed(2) path)', () => {
    // convertPrice(999,'BRL') = round(999 * 5.12) = 5115 → (5115/100).toFixed(2) = '51.15'.
    const brlCents = convertPrice(999, 'BRL');
    expect(formatPrice(999, 'BRL')).toBe(`R$${(brlCents / 100).toFixed(2)}`);
    expect(formatPrice(999, 'BRL')).toBe('R$51.15');
  });
});
