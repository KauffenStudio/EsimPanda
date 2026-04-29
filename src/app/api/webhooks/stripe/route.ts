import { NextResponse } from 'next/server';
import { provisionEsim } from '@/lib/delivery/provision';
import { IS_MOCK } from '@/lib/config/mode';
import { updateOrderStatus } from '@/lib/db/orders';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event;

    if (IS_MOCK) {
      try {
        event = JSON.parse(body);
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      }
    } else {
      if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
      }

      try {
        const { getStripeServer } = await import('@/lib/stripe/server');
        const stripe = getStripeServer();
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!,
        );
      } catch {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        // Update order status in DB
        if (!IS_MOCK) {
          await updateOrderStatus(paymentIntent.id, 'payment_confirmed');
        }
        // Trigger eSIM provisioning
        await provisionEsim(paymentIntent.id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        if (!IS_MOCK) {
          await updateOrderStatus(paymentIntent.id, 'provision_failed');
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
