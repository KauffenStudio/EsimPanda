import { NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/checkout/coupons';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body as { code: string };

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, error: 'Code is required' }, { status: 400 });
    }

    const coupon = validateCoupon(code);

    if (coupon) {
      return NextResponse.json({
        valid: true,
        code: coupon.code,
        discount_percent: coupon.discount_percent,
      });
    }

    return NextResponse.json({ valid: false, error: 'Invalid code' });
  } catch (error) {
    console.error('validate-coupon error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
