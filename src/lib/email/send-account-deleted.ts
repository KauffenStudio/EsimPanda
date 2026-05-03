import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export async function sendAccountDeletedEmail(params: {
  to: string;
}): Promise<{ id: string } | null> {
  if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') {
    console.log('[MOCK] Would send account-deleted email to:', params.to);
    return { id: 'mock_account_deleted_id' };
  }

  const text = [
    'Hi,',
    '',
    'This email confirms that your eSIM Panda account has been permanently deleted.',
    '',
    'Your personal data has been erased. Past orders are kept in anonymised form for tax-law retention.',
    '',
    'If you did NOT request this deletion, contact us immediately at geral@kauffen.com.',
    '',
    '— eSIM Panda',
  ].join('\n');

  const { data, error } = await getResend().emails.send({
    from: 'eSIM Panda <noreply@esimpanda.com>',
    to: params.to,
    subject: 'Your eSIM Panda account has been deleted',
    text,
  });

  if (error) {
    console.error('Failed to send account-deleted email:', error);
    return null;
  }

  return data;
}
