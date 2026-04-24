import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase server client
const mockSelect = vi.fn();
const mockIs = vi.fn().mockReturnValue({ select: mockSelect });
const mockEq = vi.fn().mockReturnValue({ is: mockIs });
const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
  }),
}));

// Mock mode check
let mockModeValue = false;
vi.mock('@/lib/auth/mock', () => ({
  isMockMode: () => mockModeValue,
}));

describe('linkOrdersByEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockModeValue = false;
  });

  it('returns 1 in mock mode without calling Supabase', async () => {
    mockModeValue = true;
    const { linkOrdersByEmail } = await import('../order-linking');

    const count = await linkOrdersByEmail('guest@example.com', 'user-123');

    expect(count).toBe(1);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('calls supabase with correct query chain', async () => {
    mockModeValue = false;
    mockSelect.mockResolvedValue({
      data: [{ id: 'order-1' }, { id: 'order-2' }],
      error: null,
    });

    const { linkOrdersByEmail } = await import('../order-linking');

    const count = await linkOrdersByEmail('guest@example.com', 'user-456');

    expect(mockFrom).toHaveBeenCalledWith('orders');
    expect(mockUpdate).toHaveBeenCalledWith({ user_id: 'user-456' });
    expect(mockEq).toHaveBeenCalledWith('email', 'guest@example.com');
    expect(mockIs).toHaveBeenCalledWith('user_id', null);
    expect(mockSelect).toHaveBeenCalledWith('id');
    expect(count).toBe(2);
  });

  it('returns 0 and logs error when Supabase query fails', async () => {
    mockModeValue = false;
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockSelect.mockResolvedValue({
      data: null,
      error: { message: 'DB connection failed' },
    });

    const { linkOrdersByEmail } = await import('../order-linking');

    const count = await linkOrdersByEmail('guest@example.com', 'user-789');

    expect(count).toBe(0);
    expect(consoleSpy).toHaveBeenCalledWith('[AUTH] Failed to link orders:', 'DB connection failed');
    consoleSpy.mockRestore();
  });
});
