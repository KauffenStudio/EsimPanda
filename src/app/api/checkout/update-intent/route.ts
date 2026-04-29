import { NextResponse } from 'next/server';
import { mockCreateIntent } from '@/lib/mock-data/checkout';
import { calculatePrice } from '@/lib/checkout/pricing';
import { calculateTax } from '@/lib/checkout/tax';
import { IS_MOCK } from '@/lib/config/mode';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { payment_intent_id, coupon_code, plan_id } = body as {
      payment_intent_id?: string;
      coupon_code?: string;
      plan_id: string;
    };

    if (!plan_id) {
      return NextResponse.json({ error: 'plan_id is required' }, { status: 400 });
    }

    // --- Mock mode ---
    if (IS_MOCK) {
      const result = mockCreateIntent(plan_id, coupon_code);
      if (!result) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }
      return NextResponse.json(result);
    }

    // --- Production: update real Stripe PaymentIntent ---
    const pricing = calculatePrice(plan_id, coupon_code);
    if (!pricing) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const tax = calculateTax(pricing.subtotal_cents, 'PT');

    if (payment_intent_id) {
      const { getStripeServer } = await import('@/lib/stripe/server');
      const stripe = getStripeServer();

      await stripe.paymentIntents.update(payment_intent_id, {
        amount: tax.total_cents,
        metadata: {
          coupon_code: coupon_code || '',
          discount_cents: String(pricing.discount_cents),
        },
      });
    }

    return NextResponse.json({
      amount: tax.total_cents,
      tax_amount: tax.tax_amount_cents,
      subtotal: pricing.subtotal_cents,
      discount: pricing.discount_cents,
    });
  } catch (error) {
    console.error('update-intent error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
