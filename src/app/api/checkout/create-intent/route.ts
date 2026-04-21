import { NextResponse } from 'next/server';
import { mockCreateIntent } from '@/lib/mock-data/checkout';
import { createIntentRequestSchema } from '@/lib/checkout/schemas';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createIntentRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { plan_id, email, coupon_code } = parsed.data;

    // --- Development: mock response ---
    const result = mockCreateIntent(plan_id, coupon_code);

    if (!result) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json(result);

    // --- Production: Stripe Tax + Payment Intent ---
    // TODO Phase 3 production: replace mock with stripe.tax.calculations.create and stripe.paymentIntents.create -- see RESEARCH.md Pattern 1
    //
    // import { getStripeServer } from '@/lib/stripe/server';
    // const stripe = getStripeServer();
    //
    // // 1. Calculate tax via Stripe Tax API
    // const taxCalc = await stripe.tax.calculations.create({
    //   currency: 'eur',
    //   line_items: [
    //     {
    //       amount: subtotal_cents,
    //       reference: plan_id,
    //       tax_code: 'txcd_10000000', // General - Electronically Supplied Services
    //     },
    //   ],
    //   customer_details: {
    //     address: {
    //       country: customer_country_code,
    //     },
    //     address_source: 'billing',
    //   },
    // });
    //
    // // 2. Create Payment Intent with 3D Secure and Stripe Tax
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: taxCalc.amount_total,
    //   currency: 'eur',
    //   automatic_payment_methods: { enabled: true },
    //   payment_method_options: {
    //     card: {
    //       request_three_d_secure: 'any', // SCA/3DS compliance (INF-05)
    //     },
    //   },
    //   metadata: {
    //     plan_id,
    //     email,
    //     coupon_code: coupon_code || '',
    //     discount_cents: String(discount_cents),
    //   },
    //   receipt_email: email,
    //   hooks: {
    //     inputs: {
    //       tax: {
    //         calculation: taxCalc.id,
    //       },
    //     },
    //   },
    // });
    //
    // return NextResponse.json({
    //   client_secret: paymentIntent.client_secret,
    //   amount: paymentIntent.amount,
    //   tax_amount: taxCalc.tax_amount_exclusive,
    //   subtotal: subtotal_cents,
    //   discount: discount_cents,
    // });
  } catch (error) {
    console.error('create-intent error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
