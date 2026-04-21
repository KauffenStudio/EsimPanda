import { NextResponse } from 'next/server';
import { mockCreateIntent } from '@/lib/mock-data/checkout';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { payment_intent_id, coupon_code, plan_id } = body as {
      payment_intent_id: string;
      coupon_code?: string;
      plan_id: string;
    };

    if (!plan_id) {
      return NextResponse.json({ error: 'plan_id is required' }, { status: 400 });
    }

    // --- Development: mock response ---
    const result = mockCreateIntent(plan_id, coupon_code);

    if (!result) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json(result);

    // --- Production: Stripe Payment Intent update ---
    // import { getStripeServer } from '@/lib/stripe/server';
    // const stripe = getStripeServer();
    //
    // Recalculate pricing with new coupon, then:
    // const updatedIntent = await stripe.paymentIntents.update(payment_intent_id, {
    //   amount: newTotal,
    //   metadata: { coupon_code: coupon_code || '', discount_cents: String(discount_cents) },
    // });
    //
    // return NextResponse.json({
    //   client_secret: updatedIntent.client_secret,
    //   amount: updatedIntent.amount,
    //   tax_amount: taxAmount,
    //   subtotal: subtotal,
    //   discount: discount,
    // });
  } catch (error) {
    console.error('update-intent error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
