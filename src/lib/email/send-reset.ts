import { Resend } from 'resend';
import { ResetEmail } from './templates/reset-email';

// Lazy-initialize to avoid constructor error when RESEND_API_KEY is not set (e.g. in tests/mock mode)
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export async function sendResetEmail(params: {
  to: string;
  resetUrl: string;
}): Promise<{ id: string } | null> {
  // In mock mode, skip actual sending
  if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') {
    console.log('[MOCK] Would send reset email to:', params.to);
    return { id: 'mock_reset_email_id' };
  }

  const { data, error } = await getResend().emails.send({
    from: 'eSIM Panda <noreply@esimpanda.com>',
    to: params.to,
    subject: 'Reset your eSIM Panda password',
    react: ResetEmail({ resetUrl: params.resetUrl }),
  });

  if (error) {
    console.error('Failed to send reset email:', error);
    return null;
  }

  return data;
}
