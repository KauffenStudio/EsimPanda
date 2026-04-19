import { NextResponse } from 'next/server';
import { syncCatalog } from '@/lib/esim/sync';

export async function GET(request: Request) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncCatalog();
    return NextResponse.json({
      success: true,
      synced: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Catalog sync failed:', error);
    return NextResponse.json(
      {
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
