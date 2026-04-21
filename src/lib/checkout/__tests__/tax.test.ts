import { describe, it, expect } from 'vitest';
import { calculateTax } from '../tax';

describe('calculateTax', () => {
  it('calculates 23% VAT for Portugal', () => {
    const result = calculateTax(1000, 'PT');
    expect(result.tax_rate).toBe(23);
    expect(result.tax_amount_cents).toBe(230);
    expect(result.total_cents).toBe(1230);
  });

  it('calculates 19% VAT for Germany', () => {
    const result = calculateTax(1000, 'DE');
    expect(result.tax_rate).toBe(19);
    expect(result.tax_amount_cents).toBe(190);
    expect(result.total_cents).toBe(1190);
  });

  it('calculates 20% VAT for France', () => {
    const result = calculateTax(1000, 'FR');
    expect(result.tax_rate).toBe(20);
    expect(result.tax_amount_cents).toBe(200);
    expect(result.total_cents).toBe(1200);
  });

  it('defaults to 0% for non-EU countries', () => {
    const result = calculateTax(1000, 'US');
    expect(result.tax_rate).toBe(0);
    expect(result.tax_amount_cents).toBe(0);
    expect(result.total_cents).toBe(1000);
  });
});
