import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-guard';
import { getOrderByIdForUser } from '@/lib/db/orders';
import { decrypt } from '@/lib/delivery/encryption';
import { buildEsimPass, walletCertificatesConfigured } from '@/lib/wallet/pass-builder';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  if (!walletCertificatesConfigured()) {
    return NextResponse.json({ error: 'Wallet pass not configured' }, { status: 503 });
  }

  const { user, response } = await requireAuth();
  if (response) return response;

  const { orderId } = await params;
  const order = await getOrderByIdForUser(orderId, user!.id);

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (!order.esim_activation_code_encrypted || !order.esim_smdp_address_encrypted) {
    return NextResponse.json({ error: 'eSIM not yet provisioned' }, { status: 409 });
  }

  let smdpAddress: string;
  let activationCode: string;
  try {
    smdpAddress = decrypt(order.esim_smdp_address_encrypted);
    activationCode = decrypt(order.esim_activation_code_encrypted);
  } catch (err) {
    console.error('[wallet/pass] decrypt failed:', err);
    return NextResponse.json({ error: 'Could not read eSIM credentials' }, { status: 500 });
  }

  const plan = order.plans;
  const dest = plan?.destinations;

  try {
    const passBuffer = await buildEsimPass({
      orderId: order.id,
      destinationName: dest?.name || 'eSIM',
      destinationIso: dest?.iso_code || 'XX',
      dataGb: plan?.data_gb ?? 0,
      durationDays: plan?.duration_days ?? 0,
      iccid: order.esim_iccid || '',
      smdpAddress,
      activationCode,
      purchasedAt: order.created_at,
    });

    return new NextResponse(new Uint8Array(passBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="esimpanda-${order.id}.pkpass"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error('[wallet/pass] build failed:', message);
    return NextResponse.json({ error: 'Could not build pass' }, { status: 500 });
  }
}
