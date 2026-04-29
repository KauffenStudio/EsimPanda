import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-guard';
import { IS_MOCK } from '@/lib/config/mode';
import { mockDashboardEsims } from '@/lib/mock-data/dashboard';
import { getOrdersByUser } from '@/lib/db/orders';
import type { DashboardEsim } from '@/lib/dashboard/types';

export async function GET() {
  const { user, response } = await requireAuth();
  if (response) return response;

  try {
    // --- Mock mode ---
    if (IS_MOCK) {
      return NextResponse.json({ esims: mockDashboardEsims });
    }

    // --- Production: query real orders ---
    const orders = await getOrdersByUser(user!.id);

    const esims: DashboardEsim[] = orders
      .filter((o) => o.esim_iccid && ['delivered', 'active', 'expired'].includes(o.status))
      .map((o) => {
        const plan = o.plans;
        const dest = plan?.destinations;
        return {
          id: o.id,
          iccid: o.esim_iccid!,
          destination: dest?.name || 'Unknown',
          destination_iso: dest?.iso_code || 'XX',
          status: o.status === 'delivered' || o.status === 'active' ? 'active' as const : 'expired' as const,
          data_total_gb: plan?.data_gb || 0,
          data_used_gb: 0,
          data_remaining_gb: plan?.data_gb || 0,
          data_remaining_pct: 100,
          expires_at: null,
          activated_at: o.created_at,
          last_usage_check: null,
          plan_name: plan?.name || 'eSIM Plan',
          order_id: o.id,
          wholesale_plan_id: plan?.wholesale_plan_id || '',
        };
      });

    return NextResponse.json({ esims });
  } catch (error) {
    console.error('dashboard/esims GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
