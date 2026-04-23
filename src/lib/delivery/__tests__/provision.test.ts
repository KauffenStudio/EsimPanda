import { describe, it, expect, vi, beforeEach } from 'vitest';
import { provisionEsim, provisioningState } from '../provision';

// Mock the mock-data delivery module to avoid 3-5s delay in tests
vi.mock('@/lib/mock-data/delivery', () => ({
  mockProvision: vi.fn().mockResolvedValue({
    iccid: '8901234567890123456',
    activationQrBase64: 'data:image/png;base64,iVBORw0KGgo=',
    manualActivationCode: 'LPA:1$smdp.example.com$K2-ABC123-DEF456',
    iosActivationLink: 'https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=LPA:1$smdp.example.com$K2-ABC123-DEF456',
    androidActivationLink: 'LPA:1$smdp.example.com$K2-ABC123-DEF456',
    status: 'active',
  }),
}));

// Mock ESIMProvider to avoid real API calls
vi.mock('@/lib/esim/provider', () => ({
  createProvider: vi.fn().mockReturnValue({
    purchase: vi.fn().mockResolvedValue({
      iccid: '8901234567890123456',
      activationQrBase64: 'data:image/png;base64,iVBORw0KGgo=',
      manualActivationCode: 'LPA:1$smdp.example.com$K2-ABC123-DEF456',
      status: 'active',
    }),
  }),
}));

describe('provisionEsim', () => {
  beforeEach(() => {
    provisioningState.clear();
    process.env.NEXT_PUBLIC_STRIPE_MOCK = 'true';
  });

  it('returns status "ready" with DeliveryData shape', async () => {
    const result = await provisionEsim('pi_test_123');

    expect(result.status).toBe('ready');
    expect(result.data).toBeDefined();
    expect(result.data!.iccid).toBe('8901234567890123456');
    expect(result.data!.activation_qr_base64).toBeDefined();
    expect(result.data!.manual_activation_code).toBeDefined();
    expect(result.data!.smdp_address).toBe('smdp.example.com');
  });

  it('is idempotent: calling twice returns same result', async () => {
    const result1 = await provisionEsim('pi_test_idem');
    const result2 = await provisionEsim('pi_test_idem');

    expect(result1).toEqual(result2);
    expect(result1.status).toBe('ready');
  });

  it('contains order_id matching ORD- + last 8 chars pattern', async () => {
    const result = await provisionEsim('pi_test_abcdefgh');

    expect(result.order_id).toMatch(/^ORD-[A-Z0-9]{8}$/);
    expect(result.order_id).toBe('ORD-ABCDEFGH');
  });

  it('different payment intents get different order IDs', async () => {
    const result1 = await provisionEsim('pi_test_aaa11111');
    const result2 = await provisionEsim('pi_test_bbb22222');

    expect(result1.order_id).not.toBe(result2.order_id);
  });
});
