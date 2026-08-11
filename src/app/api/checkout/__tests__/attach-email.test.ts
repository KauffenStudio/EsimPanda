import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Capturing the buyer's address at checkout time is what makes delivery
 * independent of the post-payment redirect. These tests pin both halves:
 * that the address actually lands on the PaymentIntent and the order row,
 * and that a leaked payment_intent id alone cannot repoint someone else's
 * eSIM at an attacker's inbox.
 */
const retrieve = vi.hoisted(() => vi.fn());
const update = vi.hoisted(() => vi.fn());
const attachOrderEmail = vi.hoisted(() => vi.fn().mockResolvedValue(true));

vi.mock('@/lib/config/mode', () => ({ IS_MOCK: false }));
vi.mock('@/lib/db/orders', () => ({ attachOrderEmail }));
vi.mock('@/lib/stripe/server', () => ({
  getStripeServer: () => ({ paymentIntents: { retrieve, update } }),
}));

const { POST } = await import('../attach-email/route');

const CLIENT_SECRET = 'pi_test_123_secret_abc';

function post(body: unknown): Promise<Response> {
  return POST(
    new Request('http://localhost/api/checkout/attach-email', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

describe('POST /api/checkout/attach-email', () => {
  beforeEach(() => {
    retrieve.mockReset();
    update.mockReset();
    attachOrderEmail.mockClear();
    retrieve.mockResolvedValue({
      client_secret: CLIENT_SECRET,
      status: 'requires_payment_method',
      metadata: { plan_id: 'plan_1' },
    });
  });

  it('writes the address to both Stripe and the order row', async () => {
    const response = await post({ client_secret: CLIENT_SECRET, email: 'buyer@example.com' });

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith(
      'pi_test_123',
      expect.objectContaining({ receipt_email: 'buyer@example.com' }),
    );
    expect(attachOrderEmail).toHaveBeenCalledWith('pi_test_123', 'buyer@example.com');
  });

  it('preserves existing PaymentIntent metadata', async () => {
    await post({ client_secret: CLIENT_SECRET, email: 'buyer@example.com' });

    expect(update).toHaveBeenCalledWith(
      'pi_test_123',
      expect.objectContaining({
        metadata: { plan_id: 'plan_1', email: 'buyer@example.com' },
      }),
    );
  });

  it('rejects a caller holding only the payment_intent id', async () => {
    const response = await post({
      client_secret: 'pi_test_123_secret_WRONG',
      email: 'attacker@example.com',
    });

    expect(response.status).toBe(403);
    expect(update).not.toHaveBeenCalled();
    expect(attachOrderEmail).not.toHaveBeenCalled();
  });

  it('refuses to repoint delivery once the payment has settled', async () => {
    retrieve.mockResolvedValue({
      client_secret: CLIENT_SECRET,
      status: 'succeeded',
      metadata: {},
    });

    const body = await (await post({ client_secret: CLIENT_SECRET, email: 'late@example.com' })).json();

    expect(body.attached).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });

  it('rejects a malformed email rather than storing it', async () => {
    const response = await post({ client_secret: CLIENT_SECRET, email: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it('rejects a client_secret that is not a payment intent secret', async () => {
    const response = await post({ client_secret: 'seti_123_secret_abc', email: 'buyer@example.com' });

    expect(response.status).toBe(400);
    expect(retrieve).not.toHaveBeenCalled();
  });
});
