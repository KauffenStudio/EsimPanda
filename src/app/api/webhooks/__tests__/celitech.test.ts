import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHmac } from 'crypto';

const updateMock = vi.fn((_: Record<string, unknown>) => ({ eq: vi.fn().mockResolvedValue({ error: null }) }));
const fromMock = vi.fn((_: string) => ({ update: updateMock }));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: fromMock })),
}));

import { POST } from '../celitech/route';

const SECRET = 'whsec_celitech_test_secret';

function signed(body: string) {
  return createHmac('sha256', SECRET).update(body).digest('hex');
}

function makeRequest(body: object | string, headers: Record<string, string> = {}) {
  const raw = typeof body === 'string' ? body : JSON.stringify(body);
  return new Request('http://localhost/api/webhooks/celitech', {
    method: 'POST',
    body: raw,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

describe('POST /api/webhooks/celitech', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CELITECH_WEBHOOK_SECRET = SECRET;
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
  });

  it('returns 400 when signature header is missing', async () => {
    const req = makeRequest({ type: 'esim.activated' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Missing signature header');
  });

  it('returns 400 when signature does not match', async () => {
    const req = makeRequest({ type: 'esim.activated' }, { 'x-celitech-signature': 'bad' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Invalid signature');
  });

  it('returns 500 when secret env var missing', async () => {
    delete process.env.CELITECH_WEBHOOK_SECRET;
    const req = makeRequest({ type: 'esim.activated' }, { 'x-celitech-signature': 'anything' });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it('updates esim + order status on esim.activated event', async () => {
    const body = JSON.stringify({
      type: 'esim.activated',
      data: { iccid: '8901234567890123456', status: 'ACTIVATED' },
    });
    const req = makeRequest(body, { 'x-celitech-signature': signed(body) });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect((await res.json()).received).toBe(true);

    expect(fromMock).toHaveBeenCalledWith('esims');
    expect(fromMock).toHaveBeenCalledWith('orders');

    const esimsUpdate = updateMock.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(esimsUpdate.status).toBe('active');
    expect(esimsUpdate.activated_at).toBeDefined();
  });

  it('records data usage when payload includes data_used_gb', async () => {
    const body = JSON.stringify({
      event: 'data.threshold',
      data: { iccid: '8901234567890123456', data_used_gb: 4.2 },
    });
    const req = makeRequest(body, { 'x-celitech-signature': signed(body) });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const esimsUpdate = updateMock.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(esimsUpdate.data_used_gb).toBe(4.2);
  });

  it('returns 200 and skips DB write when iccid missing', async () => {
    const body = JSON.stringify({ type: 'unknown.event', data: {} });
    const req = makeRequest(body, { 'x-celitech-signature': signed(body) });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('accepts sha256= prefix on signature', async () => {
    const body = JSON.stringify({
      type: 'esim.expired',
      data: { iccid: '8901234567890123456', status: 'expired' },
    });
    const req = makeRequest(body, { 'x-celitech-signature': `sha256=${signed(body)}` });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const esimsUpdate = updateMock.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(esimsUpdate.status).toBe('expired');
  });
});
