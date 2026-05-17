import { NextResponse } from 'next/server';
import { validateCoupon, getCouponMinOrderCents } from '@/lib/checkout/coupons';
import { getPlanById } from '@/lib/db/destinations';
import { convertPrice, type CurrencyCode } from '@/lib/currency/rates';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, plan_id, currency = 'USD' } = body as {
      code: string;
      plan_id?: string;
      currency?: CurrencyCode;
    };

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, error: 'Code is required' }, { status: 400 });
    }

    // Resolve the plan from Supabase for the currency-aware min-order check.
    // plan_id is optional (the WELCOME10 auto-apply path has no order context).
    let orderTotalInCurrency: number | undefined;
    let minOrder: number | undefined;
    if (plan_id) {
      const plan = await getPlanById(plan_id);
      if (!plan) {
        return NextResponse.json({ valid: false, error: 'Plan not found' }, { status: 404 });
      }
      orderTotalInCurrency = convertPrice(plan.retail_price_cents, currency);
      minOrder = getCouponMinOrderCents(currency);
    }

    const coupon = validateCoupon(code, orderTotalInCurrency, minOrder);

    if (coupon) {
      return NextResponse.json({
        valid: true,
        code: coupon.code,
        discount_percent: coupon.discount_percent,
      });
    }

    // Check if the coupon exists but failed the currency-aware min-order gate.
    const rawCoupon = validateCoupon(code);
    if (
      rawCoupon &&
      minOrder !== undefined &&
      orderTotalInCurrency !== undefined &&
      orderTotalInCurrency < minOrder
    ) {
      return NextResponse.json({ valid: false, error: 'min_order' });
    }

    return NextResponse.json({ valid: false, error: 'Invalid code' });
  } catch (error) {
    console.error('validate-coupon error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
