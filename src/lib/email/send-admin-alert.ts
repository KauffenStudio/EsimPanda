import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const ADMIN_EMAIL = 'geral@kauffen.com';

export interface DeliveryFailureAlertParams {
  orderId: string;
  paymentIntentId: string;
  customerEmail: string;
  destination: string;
  failureReason: string;
}

/**
 * Fire-and-forget admin alert when a customer-facing email fails to send.
 * Resolves silently on its own failure — the goal here is best-effort
 * notification, not a second source of cascading errors. The primary record
 * of failure is the Vercel log line; this notification is a courtesy ping.
 */
export async function sendDeliveryFailureAlert(
  params: DeliveryFailureAlertParams,
): Promise<void> {
  if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') {
    console.log('[MOCK] Would send admin alert for failed delivery:', params.orderId);
    return;
  }

  const subject = `[eSIM Panda] Delivery email FAILED — ${params.orderId}`;
  const html = `
    <div style="font-family: -apple-system, sans-serif; padding: 20px; max-width: 600px;">
      <h2 style="color: #B91C1C; margin-bottom: 8px;">Delivery email failed to send</h2>
      <p>A customer paid for an eSIM but the delivery email did not reach them. The eSIM itself was provisioned successfully (or the order entered the provision path) — only the email was lost.</p>
      <table style="border-collapse: collapse; margin: 16px 0; width: 100%;">
        <tr><td style="padding: 6px 12px; background: #F3F4F6;"><b>Order</b></td><td style="padding: 6px 12px;">${escape(params.orderId)}</td></tr>
        <tr><td style="padding: 6px 12px; background: #F3F4F6;"><b>Payment intent</b></td><td style="padding: 6px 12px;">${escape(params.paymentIntentId)}</td></tr>
        <tr><td style="padding: 6px 12px; background: #F3F4F6;"><b>Customer email</b></td><td style="padding: 6px 12px;">${escape(params.customerEmail)}</td></tr>
        <tr><td style="padding: 6px 12px; background: #F3F4F6;"><b>Destination</b></td><td style="padding: 6px 12px;">${escape(params.destination)}</td></tr>
        <tr><td style="padding: 6px 12px; background: #F3F4F6;"><b>Reason</b></td><td style="padding: 6px 12px; font-family: monospace; font-size: 13px;">${escape(params.failureReason)}</td></tr>
      </table>
      <p style="margin-top: 16px;"><b>Action:</b> Re-send manually via the admin dashboard, or directly via the Resend dashboard, then investigate the failure cause in Vercel logs.</p>
    </div>
  `;

  try {
    await getResend().emails.send({
      from: 'eSIM Panda Alerts <noreply@esimpanda.co>',
      to: ADMIN_EMAIL,
      subject,
      html,
    });
  } catch (err) {
    console.error('[send-admin-alert] failed to deliver alert:', err);
  }
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
