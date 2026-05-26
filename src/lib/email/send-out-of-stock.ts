import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export interface OutOfStockEmailParams {
  to: string;
  destination: string;
  orderId: string;
  amount: string;
  currency: string;
  refundId?: string;
}

/**
 * Customer-facing apology when their destination ran out of Celitech stock.
 * Sent alongside the Stripe refund. The customer should see the refund in
 * their bank statement within 5-10 business days; this email closes the loop
 * so they know the missing eSIM and the missing money are connected.
 */
export async function sendOutOfStockEmail(
  params: OutOfStockEmailParams,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') {
    console.log('[MOCK] Would send out-of-stock email to:', params.to);
    return { ok: true, id: 'mock_oos_email_id' };
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Plus Jakarta Sans', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1A1A1A;">
      <h1 style="font-size: 22px; margin: 0 0 16px;">We owe you an apology</h1>
      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
        Hi — your eSIM for <b>${escape(params.destination)}</b> couldn't be activated because our supplier ran out of stock for that destination right as your payment went through. We are genuinely sorry.
      </p>
      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
        <b>You have been refunded in full: ${escape(params.amount)} ${escape(params.currency)}.</b> The refund usually appears in your bank statement within 5–10 business days.
      </p>
      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
        If you still need data for ${escape(params.destination)}, we recommend trying again in a few hours — our supplier usually restocks within the day. Alternatively, a nearby region plan (e.g. Europe) may work for your trip.
      </p>
      <p style="font-size: 14px; color: #666666; margin: 24px 0 0;">
        Order reference: ${escape(params.orderId)}<br/>
        ${params.refundId ? `Refund reference: ${escape(params.refundId)}<br/>` : ''}
        Questions? Reply to this email and we will help.
      </p>
    </div>
  `;

  try {
    const response = await getResend().emails.send({
      from: 'eSIM Panda <noreply@esimpanda.co>',
      replyTo: 'geral@kauffen.com',
      to: params.to,
      subject: `${params.destination} is temporarily out of stock — you've been refunded`,
      html,
    });
    if (response.error) {
      const message = (response.error as { message?: string }).message ?? JSON.stringify(response.error);
      return { ok: false, error: `resend-api: ${message}` };
    }
    return { ok: true, id: response.data?.id ?? 'unknown' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[send-out-of-stock] threw:', err);
    return { ok: false, error: `resend-sdk: ${msg}` };
  }
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
