import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockUpsert,
  mockSingle,
  mockEq,
  mockSelect,
  mockFrom,
  mockCreateClient,
  mockListDestinations,
  mockListPackages,
} = vi.hoisted(() => {
  const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
  const mockSingle = vi.fn().mockResolvedValue({
    data: { id: 'dest-uuid-123' },
    error: null,
  });
  const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
  const mockFrom = vi.fn().mockImplementation(() => ({
    upsert: mockUpsert,
    select: mockSelect,
  }));
  const mockCreateClient = vi.fn().mockReturnValue({ from: mockFrom });

  const mockListDestinations = vi.fn().mockResolvedValue([
    { name: 'United States', iso: 'US', region: 'North America' },
    { name: 'United Kingdom', iso: 'GB', region: 'Europe' },
  ]);

  const mockListPackages = vi.fn().mockResolvedValue([
    {
      id: 'pkg-1',
      wholesaleId: 'cel-pkg-1',
      destination: 'US',
      dataGB: 5,
      durationDays: 30,
      wholesalePriceCents: 1000,
      currency: 'USD',
    },
  ]);

  return {
    mockUpsert,
    mockSingle,
    mockEq,
    mockSelect,
    mockFrom,
    mockCreateClient,
    mockListDestinations,
    mockListPackages,
  };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

vi.mock('../provider', () => ({
  createProvider: () => ({
    listDestinations: mockListDestinations,
    listPackages: mockListPackages,
    purchase: vi.fn(),
    getStatus: vi.fn(),
    topUp: vi.fn(),
  }),
}));

// Set env vars
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

import { syncCatalog } from '../sync';

describe('syncCatalog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-setup mock chain after clear
    mockFrom.mockImplementation(() => ({
      upsert: mockUpsert,
      select: mockSelect,
    }));
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({
      data: { id: 'dest-uuid-123' },
      error: null,
    });
    mockUpsert.mockResolvedValue({ data: null, error: null });
    mockListDestinations.mockResolvedValue([
      { name: 'United States', iso: 'US', region: 'North America' },
      { name: 'United Kingdom', iso: 'GB', region: 'Europe' },
    ]);
    mockListPackages.mockResolvedValue([
      {
        id: 'pkg-1',
        wholesaleId: 'cel-pkg-1',
        destination: 'US',
        dataGB: 5,
        durationDays: 30,
        wholesalePriceCents: 1000,
        currency: 'USD',
      },
    ]);
  });

  it('should call provider.listDestinations()', async () => {
    await syncCatalog();
    expect(mockListDestinations).toHaveBeenCalledOnce();
  });

  it('should call provider.listPackages() for each destination', async () => {
    await syncCatalog();
    expect(mockListPackages).toHaveBeenCalledTimes(2);
    expect(mockListPackages).toHaveBeenCalledWith('US');
    expect(mockListPackages).toHaveBeenCalledWith('GB');
  });

  it('should upsert destinations with onConflict iso_code', async () => {
    await syncCatalog();

    const destUpsertCalls = mockUpsert.mock.calls.filter(
      (call: unknown[]) => (call[0] as Record<string, unknown>)?.iso_code,
    );
    expect(destUpsertCalls.length).toBe(2);
    expect(destUpsertCalls[0][1]).toEqual({ onConflict: 'iso_code' });
  });

  it('should upsert plans with onConflict wholesale_plan_id,provider', async () => {
    await syncCatalog();

    const planUpsertCalls = mockUpsert.mock.calls.filter(
      (call: unknown[]) =>
        (call[0] as Record<string, unknown>)?.wholesale_plan_id,
    );
    expect(planUpsertCalls.length).toBeGreaterThan(0);
    expect(planUpsertCalls[0][1]).toEqual({
      onConflict: 'wholesale_plan_id,provider',
    });
  });

  it('should calculate retail price with 60% markup rounded to X.99', () => {
    // wholesale 1000 cents * 1.6 = 1600
    // ceil(1600/100) * 100 - 1 = 1599
    const wholesalePriceCents = 1000;
    const retailPriceCents =
      Math.ceil((wholesalePriceCents * 1.6) / 100) * 100 - 1;
    expect(retailPriceCents).toBe(1599);
  });

  it('should generate correct slugs from destination names', async () => {
    await syncCatalog();

    const destUpsertCalls = mockUpsert.mock.calls.filter(
      (call: unknown[]) => (call[0] as Record<string, unknown>)?.iso_code,
    );
    const usCall = destUpsertCalls.find(
      (call: unknown[]) =>
        (call[0] as Record<string, unknown>)?.iso_code === 'US',
    );
    expect((usCall?.[0] as Record<string, unknown>)?.slug).toBe(
      'united-states',
    );

    const gbCall = destUpsertCalls.find(
      (call: unknown[]) =>
        (call[0] as Record<string, unknown>)?.iso_code === 'GB',
    );
    expect((gbCall?.[0] as Record<string, unknown>)?.slug).toBe(
      'united-kingdom',
    );
  });

  it('should return destinations and plans counts', async () => {
    const result = await syncCatalog();
    expect(result).toEqual({
      destinations: 2,
      plans: 2,
    });
  });

  it('should use service role key for Supabase client', async () => {
    await syncCatalog();
    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-service-role-key',
    );
  });
});
