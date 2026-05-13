import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { createClient } from '@supabase/supabase-js';

type EsimStatus = 'pending' | 'active' | 'expired' | 'deactivated';

interface NormalizedEvent {
  type: string;
  iccid: string | null;
  status: EsimStatus | null;
  dataUsedGb: number | null;
  raw: Record<string, unknown>;
}

const SIGNATURE_HEADERS = [
  'x-celitech-signature',
  'celitech-signature',
  'x-signature',
] as const;

function pickSignature(headers: Headers): string | null {
  for (const name of SIGNATURE_HEADERS) {
    const value = headers.get(name);
    if (value) return value;
  }
  return null;
}

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const provided = signature.startsWith('sha256=') ? signature.slice(7) : signature;
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(provided, 'hex'));
}

function mapStatus(raw: string | undefined): EsimStatus | null {
  if (!raw) return null;
  const v = raw.toLowerCase();
  if (v.includes('activ')) return 'active';
  if (v.includes('expir')) return 'expired';
  if (v.includes('deactiv') || v.includes('cancel') || v.includes('disabl')) return 'deactivated';
  if (v.includes('pend') || v.includes('install') || v.includes('ready')) return 'pending';
  return null;
}

function normalizeEvent(body: Record<string, unknown>): NormalizedEvent {
  const type = String(body.type ?? body.event ?? body.eventType ?? 'unknown');
  const data = (body.data ?? body.payload ?? body.esim ?? body) as Record<string, unknown>;
  const iccid =
    (data.iccid as string | undefined) ??
    (data.ICCID as string | undefined) ??
    (body.iccid as string | undefined) ??
    null;
  const status = mapStatus(
    (data.status as string | undefined) ??
      (data.state as string | undefined) ??
      (body.status as string | undefined),
  );
  const dataUsed = data.dataUsed ?? data.data_used ?? data.dataUsedGb ?? data.data_used_gb;
  const dataUsedGb = typeof dataUsed === 'number' ? dataUsed : null;

  return { type, iccid, status, dataUsedGb, raw: body };
}

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function applyEvent(event: NormalizedEvent): Promise<void> {
  if (!event.iccid) {
    console.warn('[celitech webhook] event missing iccid:', event.type);
    return;
  }

  const supabase = supabaseAdmin();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (event.status) {
    updates.status = event.status;
    if (event.status === 'active') updates.activated_at = new Date().toISOString();
  }
  if (event.dataUsedGb !== null) updates.data_used_gb = event.dataUsedGb;
  updates.last_usage_check = new Date().toISOString();

  const { error: esimErr } = await supabase
    .from('esims')
    .update(updates)
    .eq('iccid', event.iccid);
  if (esimErr) console.error('[celitech webhook] esims update failed:', esimErr.message);

  if (event.status) {
    const { error: orderErr } = await supabase
      .from('orders')
      .update({ esim_status: event.status, updated_at: new Date().toISOString() })
      .eq('esim_iccid', event.iccid);
    if (orderErr) console.error('[celitech webhook] orders update failed:', orderErr.message);
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const secret = process.env.CELITECH_WEBHOOK_SECRET;

    if (!secret) {
      console.error('[celitech webhook] CELITECH_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook misconfigured' }, { status: 500 });
    }

    const signature = pickSignature(request.headers);
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });
    }
    if (!verifySignature(rawBody, signature, secret)) {
      console.error('[celitech webhook] signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const event = normalizeEvent(parsed);
    console.log('[celitech webhook] received', { type: event.type, iccid: event.iccid });

    await applyEvent(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[celitech webhook] handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
