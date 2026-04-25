import type { Coupon } from './types';

export const COUPONS: Coupon[] = [
  {
    code: 'STUDENT15',
    discount_percent: 15,
    min_order_cents: 999,
    max_uses: 999999,
    current_uses: 0,
    valid_from: '2026-01-01T00:00:00Z',
    valid_until: null,
    is_active: true,
  },
];

export function validateCoupon(code: string, orderAmountCents?: number): Coupon | null {
  const normalized = code.toUpperCase();
  const coupon = COUPONS.find((c) => c.code === normalized);

  if (!coupon) return null;
  if (!coupon.is_active) return null;
  if (coupon.current_uses >= coupon.max_uses) return null;

  const now = new Date();
  if (new Date(coupon.valid_from) > now) return null;
  if (coupon.valid_until && new Date(coupon.valid_until) < now) return null;

  if (coupon.min_order_cents && orderAmountCents !== undefined && orderAmountCents < coupon.min_order_cents) {
    return null;
  }

  return coupon;
}
