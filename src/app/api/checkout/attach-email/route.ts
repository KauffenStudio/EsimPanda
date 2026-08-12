import { NextResponse } from 'next/server';
import { z } from 'zod';
import { IS_MOCK } from '@/lib/config/mode';
import { attachOrderEmail } from '@/lib/db/orders';

/**
 * Attach the buyer's email to their in-flight PaymentIntent and order row,
 * while they are still on the checkout form.
 *
 * Previously the address only reached the server through the `confirmPayment`
 * return_url, so the webhook — which normally wins the provisioning claim —
 * provisioned with no email: no delivery mail was sent, the order row stayed
 * blank, and the delivery-status poller could never authorize the buyer, which
 * left the success page spinning until it timed out. Capturing the address up
 * front removes that dependency on the redirect entirely.
 *
 * AUTHORIZATION: the caller must present the PaymentIntent's `client_secret`,
 * which only the browser that created the intent holds. The payment_intent id
 * alone would be too weak — it leaks through Referer headers, history and
 * logs, and accepting it would let anyone repoint a stranger's eSIM delivery
 * at their own inbox.
 */
const attachEmailSchema = z.object({
  client_secret: z.string().min(1),
  email: z.string().email(),
});

/** `pi_123_secret_abc` → `pi_123`. Returns '' when the shape is unexpected. */
function paymentIntentIdFromSecret(clientSecret: string): string {
  const [id] = clientSecret.split('_secret_');
  return id?.startsWith('pi_') ? id : '';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = attachEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { client_secret, email } = parsed.data;
    const paymentIntentId = paymentIntentIdFromSecret(client_secret);

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Invalid client_secret' }, { status: 400 });
    }

    // Mock mode has no Stripe and no real orders to protect.
    if (IS_MOCK) {
      return NextResponse.json({ attached: true });
    }

    const { getStripeServer } = await import('@/lib/stripe/server');
    const stripe = getStripeServer();

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // The capability check: only the browser holding the real client_secret
    // may name the delivery address for this payment.
    if (paymentIntent.client_secret !== client_secret) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Once payment has settled the address is already locked in downstream;
    // re-pointing it here would only create a second, conflicting target.
    if (paymentIntent.status === 'succeeded') {
      return NextResponse.json({ attached: false, reason: 'already_paid' });
    }

    await stripe.paymentIntents.update(paymentIntentId, {
      receipt_email: email,
      metadata: { ...paymentIntent.metadata, email },
    });

    await attachOrderEmail(paymentIntentId, email);

    return NextResponse.json({ attached: true });
  } catch (error) {
    console.error('attach-email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
