import { NextRequest, NextResponse } from 'next/server';
import { statusRequestSchema } from '@/lib/delivery/schemas';
import { provisioningState } from '@/lib/delivery/provision';

export async function GET(request: NextRequest) {
  const paymentIntent = request.nextUrl.searchParams.get('payment_intent');

  const parsed = statusRequestSchema.safeParse({ payment_intent: paymentIntent ?? '' });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Missing or invalid payment_intent parameter' },
      { status: 400 }
    );
  }

  const state = provisioningState.get(parsed.data.payment_intent);

  if (!state) {
    return NextResponse.json({ status: 'pending' });
  }

  return NextResponse.json(state);
}
