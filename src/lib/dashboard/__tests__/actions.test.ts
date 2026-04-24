import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock next/headers (required by 'use server' modules)
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    getAll: vi.fn(() => []),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => new Map()),
}));

describe('Dashboard Actions', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_STRIPE_MOCK = 'true';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_STRIPE_MOCK;
    vi.resetModules();
  });

  it('fetchDashboardEsims returns mock data', async () => {
    const { fetchDashboardEsims } = await import('../actions');
    const result = await fetchDashboardEsims();

    expect(result.esims).toBeDefined();
    expect(result.esims.length).toBeGreaterThan(0);
    expect(result.esims[0]).toHaveProperty('iccid');
    expect(result.esims[0]).toHaveProperty('destination');
    expect(result.esims[0]).toHaveProperty('data_total_gb');
  });

  it('refreshEsimUsage returns usage data for valid iccid', async () => {
    const { refreshEsimUsage } = await import('../actions');
    const result = await refreshEsimUsage('8935101000000000001');

    expect(result.data_used_gb).toBe(1.2);
    expect(result.data_total_gb).toBe(5);
    expect(result.data_remaining_gb).toBe(3.8);
    expect(result.data_remaining_pct).toBe(76);
    expect(result.last_usage_check).toBeDefined();
  });

  it('resendDeliveryEmail returns success in mock mode', async () => {
    const { resendDeliveryEmail } = await import('../actions');
    const result = await resendDeliveryEmail('ord-001', 'test@example.com');

    expect(result.success).toBe(true);
  });
});
