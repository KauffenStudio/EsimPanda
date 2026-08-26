import { NextResponse } from 'next/server';
import { getActivityFeed } from '@/lib/activity/feed';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Serves the live activity feed.
 *
 * Returns only facts drawn from real orders and real recorded views, and an
 * empty array when nothing clears the credibility thresholds — in which case
 * the widget renders nothing rather than inventing something to say.
 */
export async function GET(request: Request) {
  try {
    const raw = new URL(request.url).searchParams.get('destination_id');
    const destinationId = raw && UUID.test(raw) ? raw : null;

    const items = await getActivityFeed(destinationId);

    return NextResponse.json(
      { items },
      {
        headers: {
          // Short shared cache: the numbers are live enough at 30s, and it
          // keeps a busy destination page from running the same three queries
          // for every visitor.
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      },
    );
  } catch (error) {
    console.error('[activity/live] failed:', error);
    return NextResponse.json({ items: [] });
  }
}
