import { NextResponse } from 'next/server';
import { trackReferralClick } from '@/lib/referral/actions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body as { code: string };

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { tracked: false, error: 'Code is required' },
        { status: 400 },
      );
    }

    const tracked = await trackReferralClick(code);
    return NextResponse.json({ tracked });
  } catch (error) {
    console.error('referral/track error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
