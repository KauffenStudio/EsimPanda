import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock supabase client
const mockGetUser = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}));

describe('Auth Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PUBLIC_STRIPE_MOCK;
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_STRIPE_MOCK;
    // Reset the store module between tests to clear initialized state
    vi.resetModules();
  });

  it('initialize() sets loading=false and initialized=true after getUser resolves', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '123', email: 'test@example.com' } } });

    const { useAuthStore } = await import('../auth');
    await useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.loading).toBe(false);
    expect(state.initialized).toBe(true);
    expect(state.user).toEqual({ id: '123', email: 'test@example.com' });
  });

  it('initialize() only runs once (idempotent)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '123', email: 'test@example.com' } } });

    const { useAuthStore } = await import('../auth');
    await useAuthStore.getState().initialize();
    await useAuthStore.getState().initialize();

    expect(mockGetUser).toHaveBeenCalledTimes(1);
  });

  it('onAuthStateChange callback updates user when session changes', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    let authChangeCallback: (event: string, session: { user: unknown } | null) => void;
    mockOnAuthStateChange.mockImplementation((cb) => {
      authChangeCallback = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    const { useAuthStore } = await import('../auth');
    await useAuthStore.getState().initialize();

    expect(useAuthStore.getState().user).toBeNull();

    // Simulate auth state change
    authChangeCallback!('SIGNED_IN', { user: { id: '456', email: 'new@example.com' } });

    expect(useAuthStore.getState().user).toEqual({ id: '456', email: 'new@example.com' });
  });

  it('clear() sets user to null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '123', email: 'test@example.com' } } });

    const { useAuthStore } = await import('../auth');
    await useAuthStore.getState().initialize();
    expect(useAuthStore.getState().user).not.toBeNull();

    useAuthStore.getState().clear();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().loading).toBe(false);
  });

  it('mock mode (NEXT_PUBLIC_STRIPE_MOCK=true) skips supabase calls', async () => {
    process.env.NEXT_PUBLIC_STRIPE_MOCK = 'true';

    const { useAuthStore } = await import('../auth');
    await useAuthStore.getState().initialize();

    expect(mockGetUser).not.toHaveBeenCalled();
    expect(mockOnAuthStateChange).not.toHaveBeenCalled();
    expect(useAuthStore.getState().loading).toBe(false);
    expect(useAuthStore.getState().initialized).toBe(true);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
