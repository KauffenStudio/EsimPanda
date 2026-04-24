import { NextResponse } from 'next/server';
import { topUpCreateIntentSchema } from '@/lib/dashboard/schemas';
import { mockTopUpPackages } from '@/lib/mock-data/dashboard';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = topUpCreateIntentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { iccid, package_id, email } = parsed.data;

    // --- Development: mock response ---
    const pkg = mockTopUpPackages.find((p) => p.id === package_id);

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json({
      client_secret: 'mock_pi_topup_secret',
      amount: pkg.price_cents,
      tax_amount: Math.round(pkg.price_cents * 0.23),
    });

    // --- Production: create Stripe payment intent ---
    // TODO: import { getStripeServer } from '@/lib/stripe/server';
    // const stripe = getStripeServer();
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: totalWithTax,
    //   currency: 'eur',
    //   automatic_payment_methods: { enabled: true },
    //   metadata: { top_up: 'true', iccid, package_id },
    //   receipt_email: email,
    // });
    // return NextResponse.json({
    //   client_secret: paymentIntent.client_secret,
    //   amount: paymentIntent.amount,
    //   tax_amount: taxAmount,
    // });
  } catch (error) {
    console.error('top-up/create-intent POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
