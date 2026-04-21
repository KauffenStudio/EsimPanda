export type PaymentStatus = 'idle' | 'creating' | 'processing' | 'succeeded' | 'failed';

export interface CheckoutPricing {
  retail_price_cents: number;
  discount_cents: number;
  subtotal_cents: number;
  tax_amount_cents: number;
  tax_rate: number;
  total_cents: number;
  currency: 'EUR';
}

export interface CouponResult {
  valid: boolean;
  code: string;
  discount_percent: number;
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
  max_uses: number;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
}
