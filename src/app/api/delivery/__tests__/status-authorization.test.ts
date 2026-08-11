import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * Regression cover for the "stuck on the loading spinner" report.
 *
 * The order row is created with email='' and only receives the buyer's address
 * when provisioning writes it back. Authorization compared the polled email
 * against that stored value alone, so while the row was still blank — and
 * permanently when the backfill never happened — every poll returned
 * `pending`. The customer watched the spinner for 60s and got a timeout error
 * while their fully-provisioned eSIM sat in the same row.
 */
const getOrderByPaymentIntent = vi.hoisted(() => vi.fn());
const fetchBuyerEmail = vi.hoisted(() => vi.fn());

vi.mock('@/lib/config/mode', () => ({ IS_MOCK: false }));
vi.mock('@/lib/db/orders', () => ({ getOrderByPaymentIntent }));
vi.mock('@/lib/delivery/buyer-email', () => ({ fetchBuyerEmail }));
vi.mock('@/lib/delivery/encryption', () => ({
  decrypt: () =>
    JSON.stringify({
      activation_code: 'K2-ABC123',
      smdp_address: 'smdp.example.com',
      qr_base64: 'data:image/png;base64,test',
    }),
}));

const { GET } = await import('../status/route');

const DELIVERED_ORDER_WITH_BLANK_EMAIL = {
  email: '',
  status: 'delivered',
  esim_iccid: '8901234567890123456',
  esim_qr_encrypted: 'iv:tag:ciphertext',
};

function poll(email: string): Promise<Response> {
  return GET(
    new NextRequest(
      `http://localhost/api/delivery/status?payment_intent=pi_test_123&email=${encodeURIComponent(email)}`,
    ),
  );
}

describe('GET /api/delivery/status — authorization', () => {
  beforeEach(() => {
    getOrderByPaymentIntent.mockReset();
    fetchBuyerEmail.mockReset();
  });

  it('serves the eSIM when the row email is blank but Stripe confirms the buyer', async () => {
    getOrderByPaymentIntent.mockResolvedValue(DELIVERED_ORDER_WITH_BLANK_EMAIL);
    fetchBuyerEmail.mockResolvedValue('buyer@example.com');

    const body = await (await poll('buyer@example.com')).json();

    expect(body.status).toBe('ready');
    expect(body.data.iccid).toBe('8901234567890123456');
    expect(body.data.smdp_address).toBe('smdp.example.com');
  });

  it('still refuses a stranger who guesses the payment_intent', async () => {
    getOrderByPaymentIntent.mockResolvedValue(DELIVERED_ORDER_WITH_BLANK_EMAIL);
    fetchBuyerEmail.mockResolvedValue('buyer@example.com');

    const body = await (await poll('attacker@example.com')).json();

    expect(body.status).toBe('pending');
    expect(body.data).toBeUndefined();
  });

  it('skips the Stripe lookup when the stored email already matches', async () => {
    getOrderByPaymentIntent.mockResolvedValue({
      ...DELIVERED_ORDER_WITH_BLANK_EMAIL,
      email: 'Buyer@Example.com  ',
    });

    const body = await (await poll('buyer@example.com')).json();

    expect(body.status).toBe('ready');
    expect(fetchBuyerEmail).not.toHaveBeenCalled();
  });

  it('reports pending while provisioning is still running', async () => {
    getOrderByPaymentIntent.mockResolvedValue({
      email: '',
      status: 'provisioning',
      esim_iccid: null,
      esim_qr_encrypted: null,
    });
    fetchBuyerEmail.mockResolvedValue('buyer@example.com');

    const body = await (await poll('buyer@example.com')).json();

    expect(body.status).toBe('provisioning');
  });

  it('stays pending when Stripe has no address either', async () => {
    getOrderByPaymentIntent.mockResolvedValue(DELIVERED_ORDER_WITH_BLANK_EMAIL);
    fetchBuyerEmail.mockResolvedValue('');

    const body = await (await poll('buyer@example.com')).json();

    expect(body.status).toBe('pending');
  });
});
