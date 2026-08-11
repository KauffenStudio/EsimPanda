import type Stripe from 'stripe';

/**
 * Resolving the buyer's email address from Stripe.
 *
 * The order row is created in /api/checkout/create-intent at checkout-mount
 * time, before the customer has typed anything, so `orders.email` starts out
 * empty. The typed value historically reached provisioning through exactly one
 * path: the `confirmPayment` return_url query string → success page →
 * /api/delivery/provision. The Stripe webhook has no browser context, and it
 * normally wins the provisioning claim (a server-to-server call beats a
 * redirect + page load), so the webhook path used to provision with no email
 * at all — sendDeliveryEmail's `if (email)` gate then silently skipped, the
 * order row kept `email=''`, and the customer's only copy of the QR code was
 * the success page they were about to close.
 *
 * Stripe already holds the address (the pay button sets `receipt_email` on
 * confirm, create-intent copies it into metadata, and wallet flows attach it
 * to the charge's billing details), so treat Stripe as the fallback source of
 * truth rather than depending on the redirect surviving.
 */

/** Read a buyer email off an in-hand PaymentIntent. No network call. */
export function emailFromPaymentIntent(paymentIntent: Stripe.PaymentIntent): string {
  const fromReceipt = paymentIntent.receipt_email?.trim();
  if (fromReceipt) return fromReceipt;

  const fromMetadata = paymentIntent.metadata?.email?.trim();
  if (fromMetadata) return fromMetadata;

  // `latest_charge` is only an object when the caller expanded it; webhook
  // payloads deliver it as a bare id, in which case there is nothing to read.
  const charge =
    typeof paymentIntent.latest_charge === 'object' && paymentIntent.latest_charge !== null
      ? (paymentIntent.latest_charge as Stripe.Charge)
      : null;

  return charge?.billing_details?.email?.trim() ?? '';
}

/**
 * Fetch the PaymentIntent (with its charge expanded, so wallet-supplied
 * billing emails are visible) and resolve the buyer's address.
 *
 * Returns '' when Stripe has no address on file or the lookup fails — callers
 * treat that as "no email available" and must not block provisioning on it.
 */
export async function fetchBuyerEmail(paymentIntentId: string): Promise<string> {
  try {
    const { getStripeServer } = await import('@/lib/stripe/server');
    const stripe = getStripeServer();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge'],
    });
    return emailFromPaymentIntent(paymentIntent);
  } catch (error) {
    console.error('[buyer-email] Stripe lookup failed:', error);
    return '';
  }
}
