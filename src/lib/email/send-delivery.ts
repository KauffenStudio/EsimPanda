import { createElement } from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import QRCode from 'qrcode';
import { DeliveryEmail } from './templates/delivery-email';

// Lazy-initialize to avoid constructor error when RESEND_API_KEY is not set (e.g. in tests/mock mode)
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

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

export interface SendDeliveryEmailResult {
  ok: true;
  id: string;
}
export interface SendDeliveryEmailError {
  ok: false;
  error: string;
}

export async function sendDeliveryEmail(
  params: SendDeliveryEmailParams
): Promise<SendDeliveryEmailResult | SendDeliveryEmailError> {
  // Generate QR code as a PNG Buffer. We attach it inline via CID rather than
  // inlining a `data:image/png;base64,...` URI, because Gmail (and several
  // other clients) strip data-URI <img src> from HTML email bodies — that
  // would render an empty box where the QR should be. The cid reference below
  // points at the attachment named "qr-code" further down.
  const qrContent = `LPA:1$${params.smdpAddress}$${params.activationCode}`;
  const qrCodeBuffer = await QRCode.toBuffer(qrContent, {
    width: 200,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
  const qrCodeCid = 'qr-code';
  const qrCodeDataUrl = `cid:${qrCodeCid}`;

  // In mock mode, skip actual sending
  if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') {
    console.log('[MOCK] Would send delivery email to:', params.to);
    console.log('[MOCK] QR buffer generated, bytes:', qrCodeBuffer.length);
    return { ok: true, id: 'mock_email_id' };
  }

  // TODO: PLACEHOLDER -- /en/setup page does not exist yet. This URL will become
  // a real route in a future phase. For now, the email itself contains all
  // setup instructions inline (manual codes section), so a dead link here
  // is acceptable.
  const setupGuideUrl = `https://esimpanda.co/en/setup?order=${params.orderId}`;

  // Diagnostic logging — captured by Vercel runtime logs so we can see exactly
  // what reached this function and what Resend returned. Sanitize the API key
  // (just confirm whether it's set + its prefix) and never log the actual key.
  const apiKey = process.env.RESEND_API_KEY ?? '';
  console.log('[send-delivery] start', {
    to: params.to,
    apiKeyPrefix: apiKey ? apiKey.slice(0, 5) + '...' : 'EMPTY',
    apiKeyLength: apiKey.length,
    smdpAddressLength: params.smdpAddress.length,
    activationCodeLength: params.activationCode.length,
    destination: params.destination,
  });

  // Use createElement explicitly. Calling `DeliveryEmail({...})` returns the
  // component's inner JSX tree (a render result), whereas Resend's @react-email
  // pipeline expects a React Element with the component reference attached so
  // it can do server-side rendering. The previous form (`react: Component({...})`)
  // could silently fail under certain conditions.
  const emailElement = createElement(DeliveryEmail, {
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
  });

  // Pre-render the React Email component to HTML *here*, then send `html` to
  // Resend instead of `react`. Resend's internal renderer goes through
  // react-dom/server APIs that misbehave under React 19 + Next.js 15 minified
  // builds (manifests as `TypeError: b is not a function` in prod). Pre-rendering
  // sidesteps that entirely — Resend just sends the string we hand it.
  let html: string;
  try {
    html = await render(emailElement);
  } catch (renderError) {
    const msg = renderError instanceof Error ? renderError.message : String(renderError);
    console.error('[send-delivery] render() threw:', renderError);
    return { ok: false, error: `render: ${msg}` };
  }

  let response;
  try {
    response = await getResend().emails.send({
      from: 'eSIM Panda <noreply@esimpanda.co>',
      replyTo: 'geral@kauffen.com',
      to: params.to,
      subject: `Your eSIM for ${params.destination} is ready!`,
      html,
      attachments: [
        {
          filename: 'esim-qr.png',
          content: qrCodeBuffer,
          contentType: 'image/png',
          contentId: qrCodeCid,
        },
      ],
    });
  } catch (sdkError) {
    // The Resend SDK can throw (not always return { error }) on network/auth
    // failures, malformed React payloads, etc. Without this catch the error
    // bubbles up to provision.ts where it's also swallowed — but at least
    // here we get the full error in logs first.
    const msg = sdkError instanceof Error ? sdkError.message : String(sdkError);
    console.error('[send-delivery] Resend SDK threw:', sdkError);
    return { ok: false, error: `resend-sdk: ${msg}` };
  }

  const { data, error } = response;
  if (error) {
    console.error('[send-delivery] Resend returned error:', error);
    const message = (error as { message?: string }).message ?? JSON.stringify(error);
    return { ok: false, error: `resend-api: ${message}` };
  }
  console.log('[send-delivery] success', { id: data?.id, to: params.to });
  return { ok: true, id: data?.id ?? 'unknown' };
}
