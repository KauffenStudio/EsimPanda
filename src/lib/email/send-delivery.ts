import { Resend } from 'resend';
import QRCode from 'qrcode';
import { DeliveryEmail } from './templates/delivery-email';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendDeliveryEmailParams {
  to: string;
  orderId: string;
  planName: string;
  destination: string;
  dataGb: string;
  durationDays: string;
  smdpAddress: string;
  activationCode: string;
  iosLink?: string;
  androidLink?: string;
  amountPaid: string;
  currency: string;
  discount?: string;
  vat?: string;
}

export async function sendDeliveryEmail(
  params: SendDeliveryEmailParams
): Promise<{ id: string } | null> {
  // Generate QR code as data URL for email embedding
  const qrContent = `LPA:1$${params.smdpAddress}$${params.activationCode}`;
  const qrCodeDataUrl = await QRCode.toDataURL(qrContent, {
    width: 200,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
  });

  // In mock mode, skip actual sending
  if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') {
    console.log('[MOCK] Would send delivery email to:', params.to);
    console.log('[MOCK] QR data URL generated, length:', qrCodeDataUrl.length);
    return { id: 'mock_email_id' };
  }

  // TODO: PLACEHOLDER -- /en/setup page does not exist yet. This URL will become
  // a real route in a future phase. For now, the email itself contains all
  // setup instructions inline (manual codes section), so a dead link here
  // is acceptable.
  const setupGuideUrl = `https://esimpanda.com/en/setup?order=${params.orderId}`;

  const { data, error } = await resend.emails.send({
    from: 'eSIM Panda <noreply@esimpanda.com>',
    to: params.to,
    subject: `Your eSIM for ${params.destination} is ready!`,
    react: DeliveryEmail({
      orderId: params.orderId,
      planName: params.planName,
      destination: params.destination,
      dataGb: params.dataGb,
      durationDays: params.durationDays,
      qrCodeDataUrl,
      smdpAddress: params.smdpAddress,
      activationCode: params.activationCode,
      iosLink: params.iosLink,
      androidLink: params.androidLink,
      amountPaid: params.amountPaid,
      currency: params.currency,
      discount: params.discount,
      vat: params.vat,
      setupGuideUrl,
      email: params.to,
    }),
  });

  if (error) {
    console.error('Failed to send delivery email:', error);
    return null;
  }

  return data;
}
