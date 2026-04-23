import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSend, mockToDataURL } = vi.hoisted(() => ({
  mockSend: vi.fn().mockResolvedValue({ data: { id: 'test_id' }, error: null }),
  mockToDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mock'),
}));

vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: mockSend };
  },
}));

vi.mock('qrcode', () => ({
  default: { toDataURL: mockToDataURL },
}));

import { sendDeliveryEmail } from '../send-delivery';

const baseParams = {
  to: 'test@example.com',
  orderId: 'ORD-12345678',
  planName: 'Europe 5GB',
  destination: 'Europe',
  dataGb: '5',
  durationDays: '30',
  smdpAddress: 'smdp.example.com',
  activationCode: 'ABCD-1234-EFGH',
  amountPaid: '29.99',
  currency: 'EUR',
};

describe('sendDeliveryEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns mock_email_id in mock mode', async () => {
    process.env.NEXT_PUBLIC_STRIPE_MOCK = 'true';
    const result = await sendDeliveryEmail(baseParams);
    expect(result).toEqual({ id: 'mock_email_id' });
  });

  it('generates QR code with correct LPA content format', async () => {
    process.env.NEXT_PUBLIC_STRIPE_MOCK = 'true';
    await sendDeliveryEmail(baseParams);

    expect(mockToDataURL).toHaveBeenCalledWith(
      `LPA:1$${baseParams.smdpAddress}$${baseParams.activationCode}`,
      expect.objectContaining({ width: 200, margin: 2 })
    );
  });

  it('calls resend.emails.send with correct params in real mode', async () => {
    process.env.NEXT_PUBLIC_STRIPE_MOCK = 'false';
    await sendDeliveryEmail(baseParams);

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'eSIM Panda <noreply@esimpanda.com>',
        to: 'test@example.com',
        subject: 'Your eSIM for Europe is ready!',
      })
    );
  });

  it('returns null when resend returns an error', async () => {
    process.env.NEXT_PUBLIC_STRIPE_MOCK = 'false';
    mockSend.mockResolvedValueOnce({ data: null, error: { message: 'Rate limited' } });

    const result = await sendDeliveryEmail(baseParams);
    expect(result).toBeNull();
  });
});

describe('DeliveryEmail component', () => {
  it('can be imported and renders without error', async () => {
    const { DeliveryEmail } = await import('../templates/delivery-email');
    expect(DeliveryEmail).toBeDefined();
    expect(typeof DeliveryEmail).toBe('function');

    const element = DeliveryEmail({
      ...baseParams,
      qrCodeDataUrl: 'data:image/png;base64,mock',
      setupGuideUrl: 'https://esimpanda.com/en/setup?order=ORD-12345678',
      email: 'test@example.com',
    });
    expect(element).toBeTruthy();
  });
});
