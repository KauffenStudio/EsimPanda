import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Applying a coupon has to move the amount Stripe will actually charge. The
 * coupon field used to call this route without naming the PaymentIntent, so
 * the buyer saw the discount and was billed full price. These tests pin the
 * re-price, the capability check, and the PANDA5 rules (€5 off from €20 VAT
 * included, never on a sold-out plan).
 */
const retrieve = vi.hoisted(() => vi.fn());
const update = vi.hoisted(() => vi.fn());
const updateOrderPricing = vi.hoisted(() => vi.fn().mockResolvedValue(true));
const country = vi.hoisted(() => ({ code: 'PT' as string | null }));

const PLANS: Record<string, { id: string; data_gb: number; retail_price_cents: number }> = {
  'plan-20gb': { id: 'plan-20gb', data_gb: 20, retail_price_cents: 2599 }, // €29.41 incl. 23% VAT
  'plan-3gb-cheap': { id: 'plan-3gb-cheap', data_gb: 3, retail_price_cents: 999 }, // €11.30 incl. VAT
  'plan-2gb': { id: 'plan-2gb', data_gb: 2, retail_price_cents: 2599 },
};

vi.mock('@/lib/config/mode', () => ({ IS_MOCK: false }));
vi.mock('@/lib/db/orders', () => ({ updateOrderPricing }));
vi.mock('@/lib/geo/country', () => ({ getCountry: () => country.code }));
vi.mock('@/lib/db/destinations', () => ({
  getPlanById: vi.fn(async (id: string) => PLANS[id] ?? null),
}));
vi.mock('@/lib/stripe/server', () => ({
  getStripeServer: () => ({ paymentIntents: { retrieve, update } }),
}));

const { POST } = await import('../update-intent/route');

const CLIENT_SECRET = 'pi_test_123_secret_abc';

function post(body: unknown): Promise<Response> {
  return POST(
    new Request('http://localhost/api/checkout/update-intent', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

function intentFor(planId: string, status = 'requires_payment_method') {
  return { client_secret: CLIENT_SECRET, status, metadata: { plan_id: planId, email: '' } };
}

describe('POST /api/checkout/update-intent', () => {
  beforeEach(() => {
    retrieve.mockReset();
    update.mockReset();
    updateOrderPricing.mockClear();
    country.code = 'PT';
  });

  it('re-prices the PaymentIntent and the order row with PANDA5', async () => {
    retrieve.mockResolvedValue(intentFor('plan-20gb'));

    const res = await post({ plan_id: 'plan-20gb', client_secret: CLIENT_SECRET, coupon_code: 'panda5' });
    const data = await res.json();

    // €5 → 543 USD cents at the static 0.92 rate; VAT on the discounted subtotal.
    expect(data.discount).toBe(543);
    expect(data.subtotal).toBe(2599 - 543);
    const expectedTotal = 2056 + Math.round(2056 * 0.23);
    expect(data.amount).toBe(expectedTotal);

    expect(update).toHaveBeenCalledWith('pi_test_123', {
      amount: expectedTotal,
      metadata: expect.objectContaining({
        plan_id: 'plan-20gb',
        coupon_code: 'panda5',
        discount_cents: '543',
      }),
    });
    expect(updateOrderPricing).toHaveBeenCalledWith('pi_test_123', {
      amount_paid_cents: expectedTotal,
      coupon_code: 'panda5',
      discount_cents: 543,
    });
  });

  it('does not discount below the €20 VAT-inclusive minimum', async () => {
    retrieve.mockResolvedValue(intentFor('plan-3gb-cheap'));

    const res = await post({ plan_id: 'plan-3gb-cheap', client_secret: CLIENT_SECRET, coupon_code: 'PANDA5' });
    const data = await res.json();

    expect(data.discount).toBe(0);
    expect(update).toHaveBeenCalledWith(
      'pi_test_123',
      expect.objectContaining({ metadata: expect.objectContaining({ coupon_code: '' }) }),
    );
  });

  it('prices the plan the intent was created for, not the one in the body', async () => {
    retrieve.mockResolvedValue(intentFor('plan-20gb'));

    const res = await post({ plan_id: 'plan-3gb-cheap', client_secret: CLIENT_SECRET });
    const data = await res.json();

    expect(data.subtotal).toBe(2599);
  });

  it('refuses without the client_secret', async () => {
    const res = await post({ plan_id: 'plan-20gb', coupon_code: 'PANDA5' });
    expect(res.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it('refuses a client_secret that does not match the intent', async () => {
    retrieve.mockResolvedValue({ ...intentFor('plan-20gb'), client_secret: 'pi_test_123_secret_other' });

    const res = await post({ plan_id: 'plan-20gb', client_secret: CLIENT_SECRET, coupon_code: 'PANDA5' });
    expect(res.status).toBe(403);
    expect(update).not.toHaveBeenCalled();
  });

  it('leaves a paid intent alone', async () => {
    retrieve.mockResolvedValue(intentFor('plan-20gb', 'succeeded'));

    const res = await post({ plan_id: 'plan-20gb', client_secret: CLIENT_SECRET, coupon_code: 'PANDA5' });
    expect(res.status).toBe(409);
    expect(update).not.toHaveBeenCalled();
  });

  it('will not price a sold-out 2GB plan', async () => {
    retrieve.mockResolvedValue(intentFor('plan-2gb'));

    const res = await post({ plan_id: 'plan-2gb', client_secret: CLIENT_SECRET });
    expect(res.status).toBe(404);
    expect(update).not.toHaveBeenCalled();
  });
});
