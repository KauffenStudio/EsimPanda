import { NextResponse } from 'next/server';
import { sendDeliveryEmail } from '@/lib/email/send-delivery';
import { getOrderByPaymentIntent } from '@/lib/db/orders';
import { decrypt } from '@/lib/delivery/encryption';
import { parseLpaUri } from '@/lib/delivery/lpa';

// SECURITY: this endpoint sends activation credentials by email and ships under
// the eSIM Panda brand. Earlier it accepted arbitrary { email, smdp_address,
// activation_code } from any unauthenticated POST — an open relay any spammer
// could use to deliver attacker-controlled text from our domain. The route now
// derives credentials server-side from the order row keyed by Stripe's
// payment_intent_id, and only re-sends to the email already on file for that
// paid order.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { payment_intent_id, email } = body as {
      payment_intent_id?: unknown;
      email?: unknown;
    };

    if (
      typeof payment_intent_id !== 'string' ||
      !payment_intent_id ||
      typeof email !== 'string' ||
      !email
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const order = await getOrderByPaymentIntent(payment_intent_id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only the buyer's address gets the credentials. Trim + case-fold so the
    // typed value matches the stored one without leaking which orders exist.
    if (order.email.trim().toLowerCase() !== email.trim().toLowerCase()) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'delivered' || !order.esim_qr_encrypted) {
      return NextResponse.json(
        { error: 'eSIM is not ready yet' },
        { status: 409 },
      );
    }

    let credentials: { activation_code?: string; smdp_address?: string };
    try {
      credentials = JSON.parse(decrypt(order.esim_qr_encrypted));
    } catch {
      return NextResponse.json(
        { error: 'Stored credentials unreadable' },
        { status: 500 },
      );
    }

    // Backward compat: older orders stored the full LPA URI in `activation_code`;
    // newer ones store just the matching id. Normalize here so the email always
    // gets a clean matching id (the QR builder re-assembles LPA:1$smdp$id).
    const { matchingId, smdpAddress: smdpFromCode } = parseLpaUri(
      credentials.activation_code ?? '',
    );
    const activationCode = matchingId;
    const smdpAddress = credentials.smdp_address || smdpFromCode;
    if (!activationCode || !smdpAddress) {
      return NextResponse.json(
        { error: 'Stored credentials incomplete' },
        { status: 500 },
      );
    }

    const plan = order.plans;
    const destination = plan?.destinations;
    const orderIdShort = 'ORD-' + payment_intent_id.slice(-8).toUpperCase();

    const result = await sendDeliveryEmail({
      to: order.email,
      orderId: orderIdShort,
      planName: plan?.name ?? 'eSIM',
      destination: destination?.name ?? 'Your destination',
      dataGb: plan?.data_gb != null ? String(plan.data_gb) : '-',
      durationDays: plan?.duration_days != null ? String(plan.duration_days) : '-',
      smdpAddress,
      activationCode,
      amountPaid: (order.amount_paid_cents / 100).toFixed(2),
      currency: order.currency,
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: 'Failed to send email', detail: result.error },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
