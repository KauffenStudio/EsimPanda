import { getPlanById } from '@/lib/db/destinations';
import { validateCoupon, getCouponMinOrderCents, getCouponDiscountCents } from './coupons';
import { calculateTax } from './tax';
import { convertPrice, type CurrencyCode } from '@/lib/currency/rates';
import { isSoldOut } from '@/lib/plans/pricing-display';

interface PriceResult {
  retail_price_cents: number;
  discount_cents: number;
  subtotal_cents: number;
}

/**
 * Resolve a plan's price from Supabase and apply an optional coupon.
 *
 * The plan is looked up by real plan ID via getPlanById — unknown IDs return null
 * (CHK-06; no mock IDs accepted). The coupon eligibility gate is currency-aware:
 * the order total is converted into `currency` and compared against that
 * currency's minimum (CHK-07). The discount amount itself stays in USD cents,
 * since retail_price_cents is USD and Stripe charges USD.
 *
 * Sold-out plans (2GB) resolve to null, so no route can build a payment for
 * one even from a stale or hand-typed checkout link.
 */
export async function calculatePrice(
  planId: string,
  couponCode?: string,
  currency: CurrencyCode = 'USD',
  taxCountry = '',
): Promise<PriceResult | null> {
  const plan = await getPlanById(planId);
  if (!plan || isSoldOut(plan.data_gb)) return null;

  const retail_price_cents = plan.retail_price_cents;

  if (couponCode) {
    // Currency-aware gate: convert the order total into the selected currency
    // and compare against that currency's minimum.
    const orderTotalInCurrency = convertPrice(retail_price_cents, currency);
    const minOrder = getCouponMinOrderCents(currency);
    const grossTotalEur = convertPrice(calculateTax(retail_price_cents, taxCountry).total_cents, 'EUR');
    const coupon = validateCoupon(couponCode, orderTotalInCurrency, minOrder, grossTotalEur);
    if (coupon) {
      const discount_cents = getCouponDiscountCents(coupon, retail_price_cents);
      return {
        retail_price_cents,
        discount_cents,
        subtotal_cents: retail_price_cents - discount_cents,
      };
    }
  }

  return {
    retail_price_cents,
    discount_cents: 0,
    subtotal_cents: retail_price_cents,
  };
}
