import { mockPlans } from './plans';
import { calculatePrice } from '@/lib/checkout/pricing';
import { calculateTax } from '@/lib/checkout/tax';

export const MOCK_CLIENT_SECRET = 'pi_mock_secret_test123';

export function mockCreateIntent(
  planId: string,
  couponCode?: string,
  countryCode = 'PT'
): {
  client_secret: string;
  amount: number;
  tax_amount: number;
  subtotal: number;
  discount: number;
} | null {
  const plan = mockPlans.find((p) => p.id === planId);
  if (!plan) return null;

  const pricing = calculatePrice(planId, couponCode);
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
