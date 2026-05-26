import { getStripeServer } from '@/lib/stripe/server';

/**
 * Refund a charge because the upstream eSIM provider (Celitech) had no profile
 * available for the destination the customer chose. We use a stable
 * idempotency key so retrying provisioning will never trigger a double refund:
 * if the original refund succeeded, Stripe returns the same refund object on
 * subsequent calls instead of creating a second one.
 */
export async function refundChargeForOutOfStock(
  paymentIntentId: string,
): Promise<{ ok: true; refundId: string } | { ok: false; error: string }> {
  try {
    const stripe = getStripeServer();
    const refund = await stripe.refunds.create(
      {
        payment_intent: paymentIntentId,
        reason: 'requested_by_customer',
        metadata: { reason_detail: 'destination_out_of_stock' },
      },
      { idempotencyKey: `refund-oos-${paymentIntentId}` },
    );
    return { ok: true, refundId: refund.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[refund] Stripe refund failed:', err);
    return { ok: false, error: msg };
  }
}
