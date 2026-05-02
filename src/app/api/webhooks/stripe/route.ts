import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { provisionEsim } from '@/lib/delivery/provision';
import { IS_MOCK } from '@/lib/config/mode';
import { updateOrderStatus } from '@/lib/db/orders';

const IS_PROD = process.env.NODE_ENV === 'production';
const ALLOW_MOCK = IS_MOCK && !IS_PROD;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event: Stripe.Event;

    if (ALLOW_MOCK) {
      try {
        event = JSON.parse(body) as Stripe.Event;
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      }
    } else {
      if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
      }

      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error('[stripe webhook] STRIPE_WEBHOOK_SECRET is not configured');
        return NextResponse.json({ error: 'Webhook misconfigured' }, { status: 500 });
      }

      try {
        const { getStripeServer } = await import('@/lib/stripe/server');
        const stripe = getStripeServer();
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'unknown';
        console.error('[stripe webhook] signature verification failed:', message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        if (!ALLOW_MOCK) {
          await updateOrderStatus(paymentIntent.id, 'payment_confirmed');
        }
        await provisionEsim(paymentIntent.id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        if (!ALLOW_MOCK) {
          await updateOrderStatus(paymentIntent.id, 'provision_failed');
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[stripe webhook] handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
