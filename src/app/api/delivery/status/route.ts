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
  // Response includes encrypted_payload (AES-256-GCM blob) when status is 'ready'.
  // When Supabase is connected, this endpoint will fall back to DB read
  // if payment_intent is not found in the in-memory Map.

  if (!state) {
    return NextResponse.json({ status: 'pending' });
  }

  return NextResponse.json(state);
}
