import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Dashboard Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_STRIPE_MOCK = 'true';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_STRIPE_MOCK;
    vi.resetModules();
  });

  it('initializes with loading=true, empty esims array, active_tab="esims"', async () => {
    const { useDashboardStore } = await import('../dashboard');
    const state = useDashboardStore.getState();

    expect(state.loading).toBe(true);
    expect(state.esims).toEqual([]);
    expect(state.active_tab).toBe('esims');
  });

  it('initialize() in mock mode sets esims from mockDashboardEsims, loading=false', async () => {
    const { useDashboardStore } = await import('../dashboard');
    await useDashboardStore.getState().initialize();

    const state = useDashboardStore.getState();
    expect(state.loading).toBe(false);
    expect(state.esims.length).toBeGreaterThan(0);
    expect(state.esims[0]).toHaveProperty('iccid');
    expect(state.esims[0]).toHaveProperty('destination');
    expect(state.esims[0]).toHaveProperty('data_total_gb');
  });

  it('setActiveTab("history") switches active_tab to "history"', async () => {
    const { useDashboardStore } = await import('../dashboard');

    useDashboardStore.getState().setActiveTab('history');
    expect(useDashboardStore.getState().active_tab).toBe('history');
  });

  it('openTopUp(esim) sets top_up_esim and top_up_status="plan-select"', async () => {
    const { useDashboardStore } = await import('../dashboard');
    await useDashboardStore.getState().initialize();

    const esim = useDashboardStore.getState().esims[0];
    useDashboardStore.getState().openTopUp(esim);

    const state = useDashboardStore.getState();
    expect(state.top_up_esim).toBe(esim);
    expect(state.top_up_status).toBe('plan-select');
  });

  it('closeTopUp() clears top_up_esim and sets top_up_status="idle"', async () => {
    const { useDashboardStore } = await import('../dashboard');
    await useDashboardStore.getState().initialize();

    const esim = useDashboardStore.getState().esims[0];
    useDashboardStore.getState().openTopUp(esim);
    useDashboardStore.getState().closeTopUp();

    const state = useDashboardStore.getState();
    expect(state.top_up_esim).toBeNull();
    expect(state.top_up_status).toBe('idle');
  });

  it('setTopUpStatus("processing") updates top_up_status', async () => {
    const { useDashboardStore } = await import('../dashboard');

    useDashboardStore.getState().setTopUpStatus('processing');
    expect(useDashboardStore.getState().top_up_status).toBe('processing');
  });

  it('refreshUsage() in mock mode sets usage_refreshing=true then false, updates last_usage_refresh', async () => {
    const { useDashboardStore } = await import('../dashboard');
    await useDashboardStore.getState().initialize();

    expect(useDashboardStore.getState().last_usage_refresh).toBeNull();

    await useDashboardStore.getState().refreshUsage();

    const state = useDashboardStore.getState();
    expect(state.usage_refreshing).toBe(false);
    expect(state.last_usage_refresh).not.toBeNull();
    expect(typeof state.last_usage_refresh).toBe('string');
  });

  it('reset() returns store to initial state', async () => {
    const { useDashboardStore } = await import('../dashboard');
    await useDashboardStore.getState().initialize();

    useDashboardStore.getState().setActiveTab('history');
    useDashboardStore.getState().setTopUpStatus('processing');

    useDashboardStore.getState().reset();

    const state = useDashboardStore.getState();
    expect(state.esims).toEqual([]);
    expect(state.purchases).toEqual([]);
    expect(state.loading).toBe(true);
    expect(state.active_tab).toBe('esims');
    expect(state.top_up_esim).toBeNull();
    expect(state.top_up_status).toBe('idle');
    expect(state.last_usage_refresh).toBeNull();
    expect(state.usage_refreshing).toBe(false);
    expect(state.error).toBeNull();
  });
});
