import { mockPlans } from '@/lib/mock-data/plans';
import { validateCoupon } from './coupons';

interface PriceResult {
  retail_price_cents: number;
  discount_cents: number;
  subtotal_cents: number;
}

export function calculatePrice(planId: string, couponCode?: string): PriceResult | null {
  const plan = mockPlans.find((p) => p.id === planId);
  if (!plan) return null;

  const retail_price_cents = plan.retail_price_cents;

  if (couponCode) {
    const coupon = validateCoupon(couponCode);
    if (coupon) {
      const discount_cents = Math.round(retail_price_cents * coupon.discount_percent / 100);
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
