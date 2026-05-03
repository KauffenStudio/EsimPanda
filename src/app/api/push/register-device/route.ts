import { NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { requireAuth } from '@/lib/auth/api-guard';
import { createClient } from '@/lib/supabase/server';

const bodySchema = z.object({
  token: z.string().min(10).max(500),
  platform: z.enum(['ios', 'android']),
});

export async function POST(request: Request) {
  const { user, response } = await requireAuth();
  if (response) return response;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { token, platform } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from('device_tokens')
    .upsert(
      {
        user_id: user!.id,
        token,
        platform,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,token' },
    );

  if (error) {
    console.error('[push/register-device] upsert failed:', error.message);
    return NextResponse.json({ error: 'Could not store token' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
