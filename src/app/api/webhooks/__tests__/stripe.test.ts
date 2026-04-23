import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../stripe/route';
import { provisioningState } from '@/lib/delivery/provision';

// Mock the delivery modules
vi.mock('@/lib/mock-data/delivery', () => ({
  mockProvision: vi.fn().mockResolvedValue({
    iccid: '8901234567890123456',
    activationQrBase64: 'data:image/png;base64,test',
    manualActivationCode: 'LPA:1$smdp.example.com$K2-ABC123',
    status: 'active',
  }),
}));

vi.mock('@/lib/esim/provider', () => ({
  createProvider: vi.fn(),
}));

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    provisioningState.clear();
    process.env.NEXT_PUBLIC_STRIPE_MOCK = 'true';
  });

  it('returns 400 when real mode and missing stripe-signature', async () => {
    process.env.NEXT_PUBLIC_STRIPE_MOCK = 'false';

    const request = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify({ type: 'payment_intent.succeeded', data: { object: { id: 'pi_test' } } }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Missing stripe-signature header');
  });

  it('triggers provisioning in mock mode with valid payment_intent.succeeded event', async () => {
    const event = {
      id: 'evt_test_123',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_webhook_test_456',
        },
      },
    };

    const request = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify(event),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.received).toBe(true);

    // Verify provisioning was triggered
    const state = provisioningState.get('pi_webhook_test_456');
    expect(state).toBeDefined();
    expect(state!.status).toBe('ready');
  });

  it('returns 400 for invalid JSON in mock mode', async () => {
    const request = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: 'not valid json {{{',
      headers: { 'Content-Type': 'text/plain' },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
