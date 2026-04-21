export const EU_VAT_RATES: Record<string, number> = {
  PT: 23,
  DE: 19,
  FR: 20,
  ES: 21,
  IT: 22,
  NL: 21,
  BE: 21,
  AT: 20,
  IE: 23,
  PL: 23,
  SE: 25,
  DK: 25,
  FI: 24,
  GR: 24,
  CZ: 21,
  RO: 19,
  HR: 25,
  BG: 20,
  HU: 27,
  SK: 20,
  SI: 22,
  LT: 21,
  LV: 21,
  EE: 22,
  CY: 19,
  MT: 18,
  LU: 17,
};

interface TaxResult {
  tax_amount_cents: number;
  tax_rate: number;
  total_cents: number;
}

export function calculateTax(amount_cents: number, country_code: string): TaxResult {
  const tax_rate = EU_VAT_RATES[country_code] ?? 0;
  const tax_amount_cents = Math.round(amount_cents * tax_rate / 100);

  return {
    tax_amount_cents,
    tax_rate,
    total_cents: amount_cents + tax_amount_cents,
  };
}
