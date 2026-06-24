import { NextRequest, NextResponse } from 'next/server';
import { statusRequestSchema } from '@/lib/delivery/schemas';
import { provisioningState } from '@/lib/delivery/provision';
import { IS_MOCK } from '@/lib/config/mode';
import { getOrderByPaymentIntent } from '@/lib/db/orders';
import { decrypt } from '@/lib/delivery/encryption';

const pending = () => NextResponse.json({ status: 'pending' });

export async function GET(request: NextRequest) {
  const paymentIntent = request.nextUrl.searchParams.get('payment_intent');
  const email = request.nextUrl.searchParams.get('email');

  const parsed = statusRequestSchema.safeParse({ payment_intent: paymentIntent ?? '' });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Missing or invalid payment_intent parameter' },
      { status: 400 },
    );
  }

  const piId = parsed.data.payment_intent;

  // Mock/test mode has no real orders and no sensitive data — keep the simple
  // in-memory fast path so local dev and the test-suite behave predictably.
  if (IS_MOCK) {
    const state = provisioningState.get(piId);
    return NextResponse.json(state ?? { status: 'pending' });
  }

  // SECURITY: this endpoint returns *decrypted* eSIM credentials (activation
  // code, QR, SMDP, ICCID). The Stripe payment_intent id alone is too weak a
  // capability (it can leak via Referer/history/logs), so we additionally
  // require the buyer's email and verify it against the order on file before
  // returning anything for this PI. A mismatch reveals nothing (no order
  // enumeration) — just the generic "pending" shape the poller already loops on.
  const buyerEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!buyerEmail) {
    return NextResponse.json({ error: 'Missing email parameter' }, { status: 400 });
  }

  let order;
  try {
    order = await getOrderByPaymentIntent(piId);
  } catch (err) {
    console.error('DB status lookup error:', err);
    return pending();
  }

  if (!order || order.email.trim().toLowerCase() !== buyerEmail) {
    return pending();
  }

  // Email verified — safe to serve the (possibly fresher) in-memory status,
  // which may already hold the credentials set by /api/delivery/provision.
  const state = provisioningState.get(piId);
  if (state) {
    return NextResponse.json(state);
  }

  if (order.status === 'delivered' && order.esim_iccid && order.esim_qr_encrypted) {
    // Decrypt activation data
    const qrData = JSON.parse(decrypt(order.esim_qr_encrypted));
    return NextResponse.json({
      status: 'ready',
      order_id: 'ORD-' + piId.slice(-8).toUpperCase(),
      data: {
        iccid: order.esim_iccid,
        activation_qr_base64: qrData.qr_base64,
        manual_activation_code: qrData.activation_code,
        smdp_address: qrData.smdp_address,
      },
      encrypted_payload: order.esim_qr_encrypted,
    });
  }
  if (order.status === 'provision_failed') {
    return NextResponse.json({
      status: 'failed',
      order_id: 'ORD-' + piId.slice(-8).toUpperCase(),
      error: 'Provisioning failed',
    });
  }
  if (order.status === 'refunded_out_of_stock') {
    return NextResponse.json({
      status: 'out_of_stock',
      order_id: 'ORD-' + piId.slice(-8).toUpperCase(),
      error: 'Destination was temporarily out of stock. Your payment has been refunded.',
    });
  }

  // Still processing
  return NextResponse.json({
    status: order.status === 'provisioning' ? 'provisioning' : 'pending',
  });
}
