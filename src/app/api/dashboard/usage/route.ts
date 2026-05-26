import { NextResponse, type NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/api-guard';
import { usageRefreshSchema } from '@/lib/dashboard/schemas';
import { mockDashboardEsims } from '@/lib/mock-data/dashboard';
import { getOrdersByUser } from '@/lib/db/orders';
import { createProvider } from '@/lib/esim/provider';

export async function GET(request: NextRequest) {
  const { user, response } = await requireAuth();
  if (response) return response;

  try {
    const iccid = request.nextUrl.searchParams.get('iccid') ?? '';
    const parsed = usageRefreshSchema.safeParse({ iccid });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      );
    }

    // --- Development: mock response (authenticated only) ---
    if (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') {
      const esim = mockDashboardEsims.find((e) => e.iccid === parsed.data.iccid);
      if (!esim) {
        return NextResponse.json({ error: 'eSIM not found' }, { status: 404 });
      }
      return NextResponse.json({
        data_used_gb: esim.data_used_gb,
        data_total_gb: esim.data_total_gb,
        data_remaining_gb: esim.data_remaining_gb,
        data_remaining_pct: esim.data_remaining_pct,
        last_usage_check: new Date().toISOString(),
      });
    }

    // --- Production: query Celitech for live consumption ---
    // Authorize first: the iccid must belong to one of the requester's orders.
    // Without this gate, any authenticated user could probe any iccid.
    const orders = await getOrdersByUser(user!.id);
    const order = orders.find((o) => o.esim_iccid === parsed.data.iccid);
    if (!order) {
      return NextResponse.json({ error: 'eSIM not found' }, { status: 404 });
    }

    const totalGb = order.plans?.data_gb ?? 0;
    if (totalGb <= 0) {
      return NextResponse.json({
        data_used_gb: 0,
        data_total_gb: 0,
        data_remaining_gb: 0,
        data_remaining_pct: 0,
        last_usage_check: new Date().toISOString(),
      });
    }

    const provider = createProvider();
    const consumption = await provider.getConsumption(parsed.data.iccid);

    if (!consumption) {
      // Celitech doesn't know this iccid yet (rare — only seen if the eSIM was
      // never provisioned or the provider catalog is stale). Surface as
      // "not activated" so the UI shows 0/total rather than erroring.
      return NextResponse.json({
        data_used_gb: 0,
        data_total_gb: totalGb,
        data_remaining_gb: totalGb,
        data_remaining_pct: 100,
        last_usage_check: new Date().toISOString(),
      });
    }

    const remainingGb = consumption.remainingGb;
    const usedGb = Math.max(0, totalGb - remainingGb);
    const remainingPct =
      totalGb > 0 ? Math.max(0, Math.min(100, (remainingGb / totalGb) * 100)) : 0;

    return NextResponse.json({
      data_used_gb: round2(usedGb),
      data_total_gb: totalGb,
      data_remaining_gb: round2(remainingGb),
      data_remaining_pct: Math.round(remainingPct),
      last_usage_check: new Date().toISOString(),
    });
  } catch (error) {
    console.error('dashboard/usage GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
