import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock resend
const mockSend = vi.fn();
vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = { send: mockSend };
    },
  };
});

// Mock react email template
vi.mock('../templates/reset-email', () => ({
  ResetEmail: vi.fn(({ resetUrl }: { resetUrl: string }) => `<ResetEmail resetUrl="${resetUrl}" />`),
}));

describe('sendResetEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset module cache to re-evaluate env checks
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_STRIPE_MOCK;
  });

  it('returns mock_reset_email_id in mock mode without calling Resend', async () => {
    process.env.NEXT_PUBLIC_STRIPE_MOCK = 'true';
    const { sendResetEmail } = await import('../send-reset');

    const result = await sendResetEmail({
      to: 'test@example.com',
      resetUrl: 'https://example.com/reset',
    });

    expect(result).toEqual({ id: 'mock_reset_email_id' });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('calls Resend.emails.send with correct from/to/subject in production mode', async () => {
    process.env.NEXT_PUBLIC_STRIPE_MOCK = 'false';
    mockSend.mockResolvedValue({ data: { id: 'real_id' }, error: null });

    const { sendResetEmail } = await import('../send-reset');

    await sendResetEmail({
      to: 'user@example.com',
      resetUrl: 'https://example.com/reset-link',
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'eSIM Panda <noreply@esimpanda.com>',
        to: 'user@example.com',
        subject: 'Reset your eSIM Panda password',
      }),
    );
  });

  it('passes resetUrl through to the React Email template', async () => {
    process.env.NEXT_PUBLIC_STRIPE_MOCK = 'false';
    mockSend.mockResolvedValue({ data: { id: 'real_id' }, error: null });

    const { sendResetEmail } = await import('../send-reset');
    const { ResetEmail } = await import('../templates/reset-email');

    await sendResetEmail({
      to: 'user@example.com',
      resetUrl: 'https://example.com/my-reset-link',
    });

    expect(ResetEmail).toHaveBeenCalledWith({ resetUrl: 'https://example.com/my-reset-link' });
  });

  it('returns null when Resend returns an error', async () => {
    process.env.NEXT_PUBLIC_STRIPE_MOCK = 'false';
    mockSend.mockResolvedValue({ data: null, error: { message: 'Send failed' } });

    const { sendResetEmail } = await import('../send-reset');

    const result = await sendResetEmail({
      to: 'user@example.com',
      resetUrl: 'https://example.com/reset',
    });

    expect(result).toBeNull();
  });
});
