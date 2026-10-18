export type PaymentStatus = 'idle' | 'creating' | 'processing' | 'succeeded' | 'failed';

export interface CheckoutPricing {
  retail_price_cents: number;
  discount_cents: number;
  subtotal_cents: number;
  tax_amount_cents: number;
  tax_rate: number;
  total_cents: number;
  currency: 'USD';
}

export interface CouponResult {
  valid: boolean;
  code: string;
  discount_percent: number;
  /** Fixed-amount coupons (PANDA5): euros off, in euro cents. 0 for percent coupons. */
  discount_amount_eur_cents?: number;
  error?: string;
}

export interface CreateIntentRequest {
  plan_id: string;
  email: string;
  coupon_code?: string;
}

export interface CreateIntentResponse {
  client_secret: string;
  amount: number;
  tax_amount: number;
  subtotal: number;
  discount: number;
}

export interface Coupon {
  code: string;
  discount_percent: number;
  /**
   * Fixed amount off, in EURO cents (PANDA5 = 500). When set it replaces
   * discount_percent. Converted to USD at the static rate because Stripe
   * charges USD.
   */
  discount_amount_eur_cents?: number;
  min_order_cents?: number;
  /**
   * Minimum on the price the buyer actually sees — VAT-inclusive, in euro
   * cents. Promo copy says "on orders from €20", so the gate has to measure
   * the same number the plan card shows, not the pre-tax USD base.
   */
  min_total_eur_cents?: number;
  max_uses: number;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  type?: 'standard' | 'influencer' | 'referral_reward';
}
