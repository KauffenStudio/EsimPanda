import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * The webhook used to call `provisionEsim(paymentIntent.id)` with no second
 * argument. Because it normally wins the provisioning claim against the
 * browser's success page, that meant the delivery email was skipped for real
 * paying customers — the eSIM existed but nothing ever reached their inbox.
 * These tests pin the address to the call.
 */
const provisionEsim = vi.hoisted(() => vi.fn().mockResolvedValue({ status: 'ready' }));
const updateOrderStatus = vi.hoisted(() => vi.fn().mockResolvedValue(true));

vi.mock('@/lib/delivery/provision', () => ({ provisionEsim }));
vi.mock('@/lib/db/orders', () => ({ updateOrderStatus }));

const { POST } = await import('../stripe/route');

function webhookRequest(paymentIntent: Record<string, unknown>): Request {
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body: JSON.stringify({
      id: 'evt_test',
      type: 'payment_intent.succeeded',
      data: { object: paymentIntent },
    }),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/webhooks/stripe — buyer email forwarding', () => {
  beforeEach(() => {
    provisionEsim.mockClear();
    process.env.NEXT_PUBLIC_STRIPE_MOCK = 'true';
  });

  it('forwards receipt_email to provisioning so the delivery email is sent', async () => {
    const response = await POST(
      webhookRequest({ id: 'pi_with_receipt', receipt_email: 'buyer@example.com' }),
    );

    expect(response.status).toBe(200);
    expect(provisionEsim).toHaveBeenCalledWith('pi_with_receipt', 'buyer@example.com');
  });

  it('falls back to the metadata email captured at create-intent', async () => {
    await POST(
      webhookRequest({
        id: 'pi_with_metadata',
        receipt_email: null,
        metadata: { email: 'buyer@example.com' },
      }),
    );

    expect(provisionEsim).toHaveBeenCalledWith('pi_with_metadata', 'buyer@example.com');
  });

  it('passes undefined when Stripe has no address, leaving the server-side lookup to run', async () => {
    await POST(webhookRequest({ id: 'pi_no_email', receipt_email: null }));

    expect(provisionEsim).toHaveBeenCalledWith('pi_no_email', undefined);
  });
});
