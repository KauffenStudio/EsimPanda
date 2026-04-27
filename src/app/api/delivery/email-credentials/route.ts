import { NextResponse } from 'next/server';
import { sendDeliveryEmail } from '@/lib/email/send-delivery';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, order_id, smdp_address, activation_code } = body;

    if (!email || !smdp_address || !activation_code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const result = await sendDeliveryEmail({
      to: email,
      orderId: order_id || 'N/A',
      planName: 'eSIM',
      destination: 'Your destination',
      dataGb: '-',
      durationDays: '-',
      smdpAddress: smdp_address,
      activationCode: activation_code,
      amountPaid: '-',
      currency: 'USD',
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to send email' },
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
