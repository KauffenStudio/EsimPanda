import { getPlanById } from '@/lib/db/destinations';
import { calculatePrice } from '@/lib/checkout/pricing';
import { calculateTax } from '@/lib/checkout/tax';
import { type CurrencyCode } from '@/lib/currency/rates';

export const MOCK_CLIENT_SECRET = 'pi_mock_secret_test123';

export async function mockCreateIntent(
  planId: string,
  couponCode?: string,
  countryCode = 'PT',
  currency: CurrencyCode = 'USD',
): Promise<{
  client_secret: string;
  amount: number;
  tax_amount: number;
  subtotal: number;
  discount: number;
} | null> {
  const plan = await getPlanById(planId);
  if (!plan) return null;

  const pricing = await calculatePrice(planId, couponCode, currency);
  if (!pricing) return null;

  const tax = calculateTax(pricing.subtotal_cents, countryCode);

  return {
    client_secret: MOCK_CLIENT_SECRET,
    amount: tax.total_cents,
    tax_amount: tax.tax_amount_cents,
    subtotal: pricing.subtotal_cents,
    discount: pricing.discount_cents,
  };
}
