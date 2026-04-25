import { NextResponse } from 'next/server';
import { getReferralData, generateReferralCode } from '@/lib/referral/actions';

export async function GET() {
  try {
    // Mock mode: return data for mock-user-1
    if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') {
      const data = await getReferralData('mock-user-1');
      if (!data.code) {
        await generateReferralCode('mock-user-1', 'test@example.com');
        const updated = await getReferralData('mock-user-1');
        return NextResponse.json(updated);
      }
      return NextResponse.json(data);
    }

    // Production: get user from Supabase auth
    // TODO: Implement Supabase auth user lookup
    return NextResponse.json(
      { error: 'Auth not configured' },
      { status: 401 },
    );
  } catch (error) {
    console.error('referral/code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
