import { NextResponse } from 'next/server';
import { mockDashboardEsims } from '@/lib/mock-data/dashboard';

export async function GET() {
  try {
    // --- Development: mock response ---
    const esims = mockDashboardEsims;
    return NextResponse.json({ esims });

    // --- Production: query Supabase ---
    // TODO: Query esims JOIN orders JOIN plans WHERE orders.user_id = authenticated user
    // const supabase = await createClient();
    // const { data: { user } } = await supabase.auth.getUser();
    // const { data: esims } = await supabase
    //   .from('esims')
    //   .select('*, orders!inner(user_id, plan_id, plans(*))')
    //   .eq('orders.user_id', user.id)
    //   .order('created_at', { ascending: false });
  } catch (error) {
    console.error('dashboard/esims GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
