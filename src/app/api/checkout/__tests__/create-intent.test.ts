import { describe, it, expect } from 'vitest';
import { POST } from '../create-intent/route';

const VALID_PLAN_ID = 'p001-0001-4000-8000-000000000001';

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/checkout/create-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/checkout/create-intent', () => {
  it('returns mock response with correct shape', async () => {
    const res = await POST(makeRequest({
      plan_id: VALID_PLAN_ID,
      email: 'test@example.com',
    }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveProperty('client_secret');
    expect(data).toHaveProperty('amount');
    expect(data).toHaveProperty('tax_amount');
    expect(data).toHaveProperty('subtotal');
    expect(data).toHaveProperty('discount');
    expect(data.amount).toBeGreaterThan(0);
    expect(data.tax_amount).toBeGreaterThanOrEqual(0);
  });

  it('returns 404 for invalid plan_id', async () => {
    const res = await POST(makeRequest({
      plan_id: 'nonexistent-plan-id',
      email: 'test@example.com',
    }));

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data).toHaveProperty('error');
  });

  it('applies coupon discount in response', async () => {
    const res = await POST(makeRequest({
      plan_id: VALID_PLAN_ID,
      email: 'test@example.com',
      coupon_code: 'STUDENT15',
    }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.discount).toBeGreaterThan(0);
    expect(data.subtotal).toBeLessThan(data.subtotal + data.discount);
  });

  // TODO production: test that payment_method_options.card.request_three_d_secure === 'any'
  // TODO production: test that hooks.inputs.tax.calculation is set
  // TODO production: test that automatic_payment_methods.enabled === true
  // These stubs document the expected production Stripe Payment Intent configuration
  // for SCA/3DS compliance (INF-05) and Stripe Tax integration (CHK-05)
});
