import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../status/route';
import { provisioningState } from '@/lib/delivery/provision';

// Mock the delivery modules to avoid side effects
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

describe('GET /api/delivery/status', () => {
  beforeEach(() => {
    provisioningState.clear();
  });

  it('returns current status for known payment_intent', async () => {
    // Pre-populate the map with a known entry
    provisioningState.set('pi_known_123', {
      status: 'ready',
      order_id: 'ORD-KNOWN123',
      data: {
        iccid: '8901234567890123456',
        activation_qr_base64: 'data:image/png;base64,test',
        manual_activation_code: 'K2-ABC123',
        smdp_address: 'smdp.example.com',
      },
    });

    const request = new NextRequest('http://localhost/api/delivery/status?payment_intent=pi_known_123');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('ready');
    expect(body.order_id).toBe('ORD-KNOWN123');
    expect(body.data.iccid).toBe('8901234567890123456');
  });

  it('returns { status: "pending" } for unknown payment_intent', async () => {
    const request = new NextRequest('http://localhost/api/delivery/status?payment_intent=pi_unknown_999');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('pending');
  });

  it('returns 400 without payment_intent param', async () => {
    const request = new NextRequest('http://localhost/api/delivery/status');
    const response = await GET(request);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });
});
