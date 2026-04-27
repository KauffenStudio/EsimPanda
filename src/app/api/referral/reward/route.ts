import { NextResponse } from 'next/server';
import { checkAndFulfillReward } from '@/lib/referral/actions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { referrer_code, buyer_email } = body as {
      referrer_code: string;
      buyer_email: string;
    };

    if (!referrer_code || !buyer_email) {
      return NextResponse.json(
        { error: 'referrer_code and buyer_email are required' },
        { status: 400 },
      );
    }

    // Basic validation — referrer_code must be alphanumeric, email must have @
    if (!/^[A-Z0-9]{6,10}$/i.test(referrer_code) || !buyer_email.includes('@')) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const result = await checkAndFulfillReward(referrer_code, buyer_email);
    return NextResponse.json(result);
  } catch (error) {
    console.error('referral/reward error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
