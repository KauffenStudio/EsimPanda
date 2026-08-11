import { describe, it, expect } from 'vitest';
import type Stripe from 'stripe';
import { emailFromPaymentIntent } from '../buyer-email';

/**
 * Regression cover for the silent delivery failure: the Stripe webhook
 * provisioned with no email, so `sendDeliveryEmail`'s `if (email)` gate
 * skipped and paying customers never received their eSIM. Live orders sat at
 * `email=''` with the profile never installed.
 */
function paymentIntent(overrides: Partial<Stripe.PaymentIntent>): Stripe.PaymentIntent {
  return { id: 'pi_test', metadata: {}, ...overrides } as Stripe.PaymentIntent;
}

describe('emailFromPaymentIntent', () => {
  it('prefers receipt_email, which the pay button sets on confirm', () => {
    const result = emailFromPaymentIntent(
      paymentIntent({
        receipt_email: 'buyer@example.com',
        metadata: { email: 'stale@example.com' },
      }),
    );

    expect(result).toBe('buyer@example.com');
  });

  it('falls back to the metadata copy written by create-intent', () => {
    const result = emailFromPaymentIntent(
      paymentIntent({ receipt_email: null, metadata: { email: 'buyer@example.com' } }),
    );

    expect(result).toBe('buyer@example.com');
  });

  it('falls back to the expanded charge billing details for wallet payments', () => {
    const result = emailFromPaymentIntent(
      paymentIntent({
        receipt_email: null,
        metadata: {},
        latest_charge: {
          billing_details: { email: 'wallet@example.com' },
        } as Stripe.Charge,
      }),
    );

    expect(result).toBe('wallet@example.com');
  });

  it('ignores an unexpanded latest_charge id rather than throwing', () => {
    const result = emailFromPaymentIntent(
      paymentIntent({ receipt_email: null, metadata: {}, latest_charge: 'ch_test_123' }),
    );

    expect(result).toBe('');
  });

  it('treats a whitespace-only address as absent so the caller keeps looking', () => {
    const result = emailFromPaymentIntent(
      paymentIntent({ receipt_email: '   ', metadata: { email: 'buyer@example.com' } }),
    );

    expect(result).toBe('buyer@example.com');
  });

  it('returns empty string when Stripe holds no address at all', () => {
    expect(emailFromPaymentIntent(paymentIntent({ receipt_email: null }))).toBe('');
  });
});
