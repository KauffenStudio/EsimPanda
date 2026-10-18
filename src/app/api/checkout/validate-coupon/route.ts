import { NextResponse } from 'next/server';
import { validateCoupon, getCouponMinOrderCents } from '@/lib/checkout/coupons';
import { getPlanById } from '@/lib/db/destinations';
import { convertPrice, type CurrencyCode } from '@/lib/currency/rates';
import { calculateTax } from '@/lib/checkout/tax';
import { getCountry } from '@/lib/geo/country';

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
    let grossTotalEur: number | undefined;
    if (plan_id) {
      const plan = await getPlanById(plan_id);
      if (!plan) {
        return NextResponse.json({ valid: false, error: 'Plan not found' }, { status: 404 });
      }
      orderTotalInCurrency = convertPrice(plan.retail_price_cents, currency);
      minOrder = getCouponMinOrderCents(currency);
      // What the plan card shows: VAT-inclusive, here in euros (ILOVEPANDA gate).
      const taxCountry = getCountry(request.headers) ?? '';
      grossTotalEur = convertPrice(
        calculateTax(plan.retail_price_cents, taxCountry).total_cents,
        'EUR',
      );
    }

    const coupon = validateCoupon(code, orderTotalInCurrency, minOrder, grossTotalEur);

    if (coupon) {
      return NextResponse.json({
        valid: true,
        code: coupon.code,
        discount_percent: coupon.discount_percent,
        discount_amount_eur_cents: coupon.discount_amount_eur_cents ?? 0,
      });
    }

    // Check if the coupon exists but failed one of the minimum-order gates.
    const rawCoupon = validateCoupon(code);
    if (
      rawCoupon?.min_total_eur_cents &&
      grossTotalEur !== undefined &&
      grossTotalEur < rawCoupon.min_total_eur_cents
    ) {
      return NextResponse.json({
        valid: false,
        error: 'min_total_eur',
        min_total_eur: rawCoupon.min_total_eur_cents / 100,
      });
    }
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
