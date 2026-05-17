import { NextResponse } from 'next/server';
import { mockCreateIntent } from '@/lib/mock-data/checkout';
import { createIntentRequestSchema } from '@/lib/checkout/schemas';
import { calculatePrice } from '@/lib/checkout/pricing';
import { calculateTax } from '@/lib/checkout/tax';
import { IS_MOCK } from '@/lib/config/mode';
import { createOrder } from '@/lib/db/orders';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createIntentRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { plan_id, email, coupon_code, currency } = parsed.data;

    // --- Mock mode ---
    if (IS_MOCK) {
      const result = await mockCreateIntent(plan_id, coupon_code, 'PT', currency ?? 'USD');
      if (!result) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }
      return NextResponse.json(result);
    }

    // --- Production: Real Stripe ---
    const pricing = await calculatePrice(plan_id, coupon_code, currency ?? 'USD');
    if (!pricing) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const tax = calculateTax(pricing.subtotal_cents, 'PT');

    const { getStripeServer } = await import('@/lib/stripe/server');
    const stripe = getStripeServer();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: tax.total_cents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        plan_id,
        email: email || '',
        coupon_code: coupon_code || '',
        discount_cents: String(pricing.discount_cents),
      },
      receipt_email: email || undefined,
    });

    // Create order in DB
    await createOrder({
      email: email || '',
      plan_id,
      stripe_payment_intent_id: paymentIntent.id,
      amount_paid_cents: tax.total_cents,
      coupon_code: coupon_code || undefined,
      discount_cents: pricing.discount_cents,
    });

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      amount: tax.total_cents,
      tax_amount: tax.tax_amount_cents,
      subtotal: pricing.subtotal_cents,
      discount: pricing.discount_cents,
    });
  } catch (error) {
    console.error('create-intent error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
