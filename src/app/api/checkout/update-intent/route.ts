import { NextResponse } from 'next/server';
import { mockCreateIntent } from '@/lib/mock-data/checkout';
import { calculatePrice } from '@/lib/checkout/pricing';
import { calculateTax } from '@/lib/checkout/tax';
import { getCountry } from '@/lib/geo/country';
import { IS_MOCK } from '@/lib/config/mode';
import { updateOrderPricing } from '@/lib/db/orders';
import { type CurrencyCode } from '@/lib/currency/rates';

/** `pi_123_secret_abc` → `pi_123`. Returns '' when the shape is unexpected. */
function paymentIntentIdFromSecret(clientSecret: string): string {
  const [id] = clientSecret.split('_secret_');
  return id?.startsWith('pi_') ? id : '';
}

/**
 * Re-price the in-flight PaymentIntent when a coupon is applied or removed.
 *
 * The coupon field used to call this without naming the intent, so the order
 * summary showed the discount while Stripe still charged the full price. The
 * caller now presents the intent's `client_secret` (same capability check as
 * attach-email), and the amount on Stripe and on the order row move together.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { client_secret, coupon_code, plan_id, currency } = body as {
      client_secret?: string;
      coupon_code?: string;
      plan_id: string;
      currency?: CurrencyCode;
    };

    if (!plan_id) {
      return NextResponse.json({ error: 'plan_id is required' }, { status: 400 });
    }

    // Tax country comes from the edge geo header, not a hardcoded 'PT'. See
    // create-intent for why: every customer worldwide was billed Portuguese
    // VAT. Unknown location means no VAT.
    const taxCountry = getCountry(request.headers) ?? '';

    // --- Mock mode ---
    if (IS_MOCK) {
      const result = await mockCreateIntent(plan_id, coupon_code, taxCountry, currency ?? 'USD');
      if (!result) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }
      return NextResponse.json(result);
    }

    // --- Production: update real Stripe PaymentIntent ---
    const paymentIntentId = client_secret ? paymentIntentIdFromSecret(client_secret) : '';
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'client_secret is required' }, { status: 400 });
    }

    const { getStripeServer } = await import('@/lib/stripe/server');
    const stripe = getStripeServer();

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.client_secret !== client_secret) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing') {
      return NextResponse.json({ error: 'already_paid' }, { status: 409 });
    }

    // Price the plan the intent was created for, not whatever the body names —
    // otherwise a cheap plan_id could re-price an expensive plan's payment.
    const intentPlanId = paymentIntent.metadata?.plan_id || plan_id;
    const pricing = await calculatePrice(intentPlanId, coupon_code, currency ?? 'USD', taxCountry);
    if (!pricing) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const tax = calculateTax(pricing.subtotal_cents, taxCountry);
    // An invalid code prices at zero discount; don't record it as applied.
    const appliedCode = pricing.discount_cents > 0 ? (coupon_code ?? '') : '';

    await stripe.paymentIntents.update(paymentIntentId, {
      amount: tax.total_cents,
      metadata: {
        ...paymentIntent.metadata,
        coupon_code: appliedCode,
        discount_cents: String(pricing.discount_cents),
      },
    });

    await updateOrderPricing(paymentIntentId, {
      amount_paid_cents: tax.total_cents,
      coupon_code: appliedCode || null,
      discount_cents: pricing.discount_cents,
    });

    return NextResponse.json({
      amount: tax.total_cents,
      tax_amount: tax.tax_amount_cents,
      tax_rate: tax.tax_rate,
      subtotal: pricing.subtotal_cents,
      discount: pricing.discount_cents,
    });
  } catch (error) {
    console.error('update-intent error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
