import { NextResponse } from 'next/server';
import { provisionRequestSchema } from '@/lib/delivery/schemas';
import { provisionEsim } from '@/lib/delivery/provision';

const isMockMode = () => process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = provisionRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { payment_intent_id } = parsed.data;

    // In real mode, verify the payment intent actually succeeded
    if (!isMockMode()) {
      try {
        const { getStripeServer } = await import('@/lib/stripe/server');
        const stripe = getStripeServer();
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

        if (paymentIntent.status !== 'succeeded') {
          return NextResponse.json(
            { error: 'Payment has not succeeded' },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Failed to verify payment' },
          { status: 500 }
        );
      }
    }

    const result = await provisionEsim(payment_intent_id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('provision error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
