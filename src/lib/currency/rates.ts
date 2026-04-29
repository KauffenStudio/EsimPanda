// Static exchange rates (base: USD). Update periodically or fetch from API.
const RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  BRL: 5.12,
  JPY: 155.5,
  CNY: 7.24,
};

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

/** Convert USD cents to target currency cents */
export function convertPrice(usdCents: number, to: CurrencyCode): number {
  const rate = RATES[to] ?? 1;
  return Math.round(usdCents * rate);
}

/** Format cents in the given currency for display */
export function formatPrice(usdCents: number, currency: CurrencyCode = 'USD'): string {
  const converted = convertPrice(usdCents, currency);
  const info = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  // JPY has no decimal places
  if (currency === 'JPY') {
    return `${info.symbol}${converted}`;
  }

  return `${info.symbol}${(converted / 100).toFixed(2)}`;
}

/** Get the symbol for a currency code */
export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCIES.find((c) => c.code === currency)?.symbol ?? '$';
}
