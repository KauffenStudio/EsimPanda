import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServiceClient } from '@/lib/supabase/service';

const SESSION_COOKIE = 'esim-vsid';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Records that this visitor is looking at a destination.
 *
 * This is the only source of the "N people viewing" numbers in the activity
 * feed, so it has to count people rather than requests. The session id is a
 * random opaque value in a first-party cookie — not an ip, not a fingerprint —
 * and the table's primary key buckets by minute, so a page left open for an
 * hour upserts sixty times and still counts as one viewer.
 */
export async function POST(request: Request) {
  try {
    const { destination_id } = (await request.json()) as { destination_id?: string };

    // Validated as a UUID before it reaches the database: this endpoint is
    // unauthenticated by necessity, so it must not forward arbitrary input.
    if (!destination_id || !UUID.test(destination_id)) {
      return NextResponse.json({ error: 'Invalid destination_id' }, { status: 400 });
    }

    const jar = await cookies();
    let sessionId = jar.get(SESSION_COOKIE)?.value;
    if (!sessionId || !UUID.test(sessionId)) {
      sessionId = crypto.randomUUID();
    }

    // Truncate to the minute so repeated pings from one visitor collide on the
    // primary key instead of stacking into a fake crowd.
    const bucket = new Date();
    bucket.setSeconds(0, 0);

    const supabase = createServiceClient();
    const { error } = await supabase.from('destination_views').upsert(
      {
        destination_id,
        session_id: sessionId,
        minute_bucket: bucket.toISOString(),
        seen_at: new Date().toISOString(),
      },
      { onConflict: 'destination_id,session_id,minute_bucket' },
    );

    if (error) {
      console.error('[activity/view] upsert failed:', error);
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // matches the feed's 24h look-back; no longer
    });
    return response;
  } catch {
    // Never surface a failure here — a dropped view ping must not break a page.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
