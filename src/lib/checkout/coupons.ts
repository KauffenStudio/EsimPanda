import type { Coupon } from './types';

export const COUPONS: Coupon[] = [
  {
    code: 'STUDENT30',
    discount_percent: 30,
    max_uses: 999999,
    current_uses: 0,
    valid_from: '2026-01-01T00:00:00Z',
    valid_until: null,
    is_active: true,
  },
];

export function validateCoupon(code: string): Coupon | null {
  const normalized = code.toUpperCase();
  const coupon = COUPONS.find((c) => c.code === normalized);

  if (!coupon) return null;
  if (!coupon.is_active) return null;
  if (coupon.current_uses >= coupon.max_uses) return null;

  const now = new Date();
  if (new Date(coupon.valid_from) > now) return null;
  if (coupon.valid_until && new Date(coupon.valid_until) < now) return null;

  return coupon;
}
