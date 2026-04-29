import { NextRequest, NextResponse } from 'next/server';
import { statusRequestSchema } from '@/lib/delivery/schemas';
import { provisioningState } from '@/lib/delivery/provision';
import { IS_MOCK } from '@/lib/config/mode';
import { getOrderByPaymentIntent } from '@/lib/db/orders';
import { decrypt } from '@/lib/delivery/encryption';

export async function GET(request: NextRequest) {
  const paymentIntent = request.nextUrl.searchParams.get('payment_intent');

  const parsed = statusRequestSchema.safeParse({ payment_intent: paymentIntent ?? '' });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Missing or invalid payment_intent parameter' },
      { status: 400 },
    );
  }

  const piId = parsed.data.payment_intent;

  // Check in-memory cache first (fast path)
  const state = provisioningState.get(piId);
  if (state) {
    return NextResponse.json(state);
  }

  // Fall back to DB lookup in production
  if (!IS_MOCK) {
    try {
      const order = await getOrderByPaymentIntent(piId);
      if (order) {
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
        // Still processing
        return NextResponse.json({
          status: order.status === 'provisioning' ? 'provisioning' : 'pending',
        });
      }
    } catch (err) {
      console.error('DB status lookup error:', err);
    }
  }

  return NextResponse.json({ status: 'pending' });
}
