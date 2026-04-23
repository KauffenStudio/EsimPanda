import { NextResponse } from 'next/server';
import { provisionEsim } from '@/lib/delivery/provision';

const isMockMode = () => process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true';

export async function POST(request: Request) {
  try {
    // Critical: read raw body text for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event;

    if (isMockMode()) {
      // Mock mode: parse body as JSON directly, skip signature verification
      try {
        event = JSON.parse(body);
      } catch {
        return NextResponse.json(
          { error: 'Invalid JSON body' },
          { status: 400 }
        );
      }
    } else {
      // Real mode: verify webhook signature
      if (!signature) {
        return NextResponse.json(
          { error: 'Missing stripe-signature header' },
          { status: 400 }
        );
      }

      try {
        const { getStripeServer } = await import('@/lib/stripe/server');
        const stripe = getStripeServer();
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      } catch {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        );
      }
    }

    // Handle event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        // Idempotent: safe to call even if success page already triggered provisioning
        await provisionEsim(paymentIntent.id);
        break;
      }
      default:
        // Unhandled event type - acknowledge receipt
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
