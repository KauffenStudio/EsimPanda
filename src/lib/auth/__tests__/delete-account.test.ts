import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args);
    throw new Error('NEXT_REDIRECT');
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'pt' }),
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}));

const mockGetUser = vi.fn();
const mockSignOut = vi.fn().mockResolvedValue({ error: null });
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: mockGetUser,
      signOut: mockSignOut,
    },
  }),
}));

const mockAdminDeleteUser = vi.fn();
const mockStorageList = vi.fn();
const mockStorageRemove = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      admin: {
        deleteUser: mockAdminDeleteUser,
      },
    },
    storage: {
      from: vi.fn(() => ({
        list: mockStorageList,
        remove: mockStorageRemove,
      })),
    },
  })),
}));

const mockAnonymize = vi.fn();
vi.mock('@/lib/db/orders', () => ({
  anonymizeOrdersForUser: mockAnonymize,
}));

const mockSendEmail = vi.fn();
vi.mock('@/lib/email/send-account-deleted', () => ({
  sendAccountDeletedEmail: mockSendEmail,
}));

describe('deleteAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
    delete process.env.NEXT_PUBLIC_STRIPE_MOCK;
    mockStorageList.mockResolvedValue({ data: [], error: null });
    mockStorageRemove.mockResolvedValue({ error: null });
    mockAnonymize.mockResolvedValue(2);
    mockAdminDeleteUser.mockResolvedValue({ error: null });
    mockSendEmail.mockResolvedValue({ id: 'email_id' });
  });

  it('returns unauthenticated when no user is signed in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { deleteAccount } = await import('../delete-account');

    const result = await deleteAccount();

    expect(result).toEqual({ ok: false, error: 'unauthenticated' });
    expect(mockAnonymize).not.toHaveBeenCalled();
    expect(mockAdminDeleteUser).not.toHaveBeenCalled();
  });

  it('anonymises orders, deletes user, sends email, redirects with deleted=1 in user locale', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
    });
    const { deleteAccount } = await import('../delete-account');

    await expect(deleteAccount()).rejects.toThrow('NEXT_REDIRECT');

    expect(mockAnonymize).toHaveBeenCalledWith(expect.any(Object), 'user-123');
    expect(mockAdminDeleteUser).toHaveBeenCalledWith('user-123');
    expect(mockSendEmail).toHaveBeenCalledWith({ to: 'user@example.com' });
    expect(mockRedirect).toHaveBeenCalledWith('/pt/login?deleted=1');
  });

  it('returns orders_failed when anonymisation throws', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
    });
    mockAnonymize.mockRejectedValueOnce(new Error('db down'));
    const { deleteAccount } = await import('../delete-account');

    const result = await deleteAccount();

    expect(result).toEqual({ ok: false, error: 'orders_failed' });
    expect(mockAdminDeleteUser).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('returns auth_delete_failed when admin.deleteUser fails', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
    });
    mockAdminDeleteUser.mockResolvedValueOnce({
      error: { message: 'permission denied' },
    });
    const { deleteAccount } = await import('../delete-account');

    const result = await deleteAccount();

    expect(result).toEqual({ ok: false, error: 'auth_delete_failed' });
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});
