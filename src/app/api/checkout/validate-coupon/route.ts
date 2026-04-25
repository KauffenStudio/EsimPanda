import { NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/checkout/coupons';
import { mockPlans } from '@/lib/mock-data/plans';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, plan_id } = body as { code: string; plan_id?: string };

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, error: 'Code is required' }, { status: 400 });
    }

    // Look up plan price for min order check
    let orderAmountCents: number | undefined;
    if (plan_id) {
      const plan = mockPlans.find((p) => p.id === plan_id);
      if (plan) {
        orderAmountCents = plan.retail_price_cents;
      }
    }

    const coupon = validateCoupon(code, orderAmountCents);

    if (coupon) {
      return NextResponse.json({
        valid: true,
        code: coupon.code,
        discount_percent: coupon.discount_percent,
      });
    }

    // Check if coupon exists but failed min order check
    const rawCoupon = validateCoupon(code);
    if (rawCoupon && rawCoupon.min_order_cents && orderAmountCents !== undefined && orderAmountCents < rawCoupon.min_order_cents) {
      return NextResponse.json({ valid: false, error: 'min_order' });
    }

    return NextResponse.json({ valid: false, error: 'Invalid code' });
  } catch (error) {
    console.error('validate-coupon error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
