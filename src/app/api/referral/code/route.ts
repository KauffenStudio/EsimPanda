import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-guard';
import { getReferralData, generateReferralCode } from '@/lib/referral/actions';

export async function GET() {
  const { user, response } = await requireAuth();
  if (response) return response;

  try {
    // Mock mode: return data for authenticated mock user
    if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') {
      const userId = user?.id ?? 'mock-user-1';
      const data = await getReferralData(userId);
      if (!data.code) {
        await generateReferralCode(userId, user?.email ?? 'test@example.com');
        const updated = await getReferralData(userId);
        return NextResponse.json(updated);
      }
      return NextResponse.json(data);
    }

    // Production: use authenticated user
    const data = await getReferralData(user!.id);
    if (!data.code) {
      await generateReferralCode(user!.id, user!.email ?? '');
      const updated = await getReferralData(user!.id);
      return NextResponse.json(updated);
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('referral/code error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
