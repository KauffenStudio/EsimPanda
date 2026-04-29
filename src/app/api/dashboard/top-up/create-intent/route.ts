import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-guard';
import { topUpCreateIntentSchema } from '@/lib/dashboard/schemas';
import { mockTopUpPackages } from '@/lib/mock-data/dashboard';
import { IS_MOCK } from '@/lib/config/mode';

export async function POST(request: Request) {
  const { user, response } = await requireAuth();
  if (response) return response;

  try {
    const body = await request.json();
    const parsed = topUpCreateIntentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { package_id, iccid } = parsed.data;

    // --- Mock mode ---
    if (IS_MOCK) {
      const pkg = mockTopUpPackages.find((p) => p.id === package_id);
      if (!pkg) {
        return NextResponse.json({ error: 'Package not found' }, { status: 404 });
      }
      return NextResponse.json({
        client_secret: 'mock_pi_topup_secret',
        amount: pkg.price_cents,
        tax_amount: Math.round(pkg.price_cents * 0.23),
      });
    }

    // --- Production: create Stripe PaymentIntent for top-up ---
    const { getStripeServer } = await import('@/lib/stripe/server');
    const stripe = getStripeServer();

    // Find the package (from API or mock fallback)
    const pkg = mockTopUpPackages.find((p) => p.id === package_id);
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: pkg.price_cents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        type: 'top_up',
        iccid: iccid || '',
        package_id,
        user_id: user!.id,
      },
    });

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      amount: pkg.price_cents,
      tax_amount: Math.round(pkg.price_cents * 0.23),
    });
  } catch (error) {
    console.error('top-up/create-intent POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
