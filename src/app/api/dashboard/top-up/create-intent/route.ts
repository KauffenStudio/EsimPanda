import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-guard';
import { topUpCreateIntentSchema } from '@/lib/dashboard/schemas';
import { mockTopUpPackages } from '@/lib/mock-data/dashboard';

export async function POST(request: Request) {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const body = await request.json();
    const parsed = topUpCreateIntentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { package_id } = parsed.data;

    // --- Development: mock response (authenticated only) ---
    if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') {
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

    // --- Production: verify iccid belongs to user, then create Stripe payment intent ---
    // TODO: implement with Stripe + ownership verification
    return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
  } catch (error) {
    console.error('top-up/create-intent POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
