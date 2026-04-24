import { NextResponse, type NextRequest } from 'next/server';
import { usageRefreshSchema } from '@/lib/dashboard/schemas';
import { mockDashboardEsims } from '@/lib/mock-data/dashboard';

export async function GET(request: NextRequest) {
  try {
    const iccid = request.nextUrl.searchParams.get('iccid') ?? '';
    const parsed = usageRefreshSchema.safeParse({ iccid });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      );
    }

    // --- Development: mock response ---
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

    // --- Production: call ESIMProvider.getStatus(iccid) ---
    // TODO: import { createProvider } from '@/lib/esim/provider';
    // const provider = createProvider();
    // const status = await provider.getStatus(parsed.data.iccid);
    // Then map to usage response fields
  } catch (error) {
    console.error('dashboard/usage GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
