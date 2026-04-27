import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-guard';
import { mockDashboardEsims } from '@/lib/mock-data/dashboard';

export async function GET() {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    // --- Development: mock response (only for authenticated users) ---
    if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') {
      return NextResponse.json({ esims: mockDashboardEsims });
    }

    // --- Production: query Supabase ---
    // TODO: Query esims JOIN orders JOIN plans WHERE orders.user_id = user.id
    return NextResponse.json({ esims: [] });
  } catch (error) {
    console.error('dashboard/esims GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
