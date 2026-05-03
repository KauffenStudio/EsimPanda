import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock next/navigation
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args);
    throw new Error('NEXT_REDIRECT');
  },
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'en' }),
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  }),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock resend (needed because sendResetEmail is now a real import)
const mockResendSend = vi.fn().mockResolvedValue({ data: { id: 'test_id' }, error: null });
vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: mockResendSend };
  },
}));

// Mock react email template
vi.mock('@/lib/email/templates/reset-email', () => ({
  ResetEmail: vi.fn(() => '<ResetEmail />'),
}));

// Mock supabase server client
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockUpdateUser = vi.fn();
const mockGenerateLink = vi.fn();
const mockSelect = vi.fn().mockResolvedValue({ data: [{ id: 'order-1' }], error: null });
const mockIs = vi.fn().mockReturnValue({ select: mockSelect });
const mockEq = vi.fn().mockReturnValue({ is: mockIs });
const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
      admin: {
        generateLink: mockGenerateLink,
      },
    },
    from: mockFrom,
  }),
}));

describe('Auth Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PUBLIC_STRIPE_MOCK;
    process.env.NEXT_PUBLIC_SITE_URL = 'https://esimpanda.com';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_STRIPE_MOCK;
  });

  describe('login', () => {
    it('calls supabase signInWithPassword and redirects on success', async () => {
      const { login } = await import('../actions');
      mockSignInWithPassword.mockResolvedValue({ error: null });

      const formData = new FormData();
      formData.set('email', 'test@example.com');
      formData.set('password', 'password123');

      await expect(login(formData)).rejects.toThrow('NEXT_REDIRECT');
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockRedirect).toHaveBeenCalled();
    });

    it('returns error message on invalid credentials', async () => {
      const { login } = await import('../actions');
      mockSignInWithPassword.mockResolvedValue({
        error: { message: 'Invalid login credentials' },
      });

      const formData = new FormData();
      formData.set('email', 'test@example.com');
      formData.set('password', 'wrong');

      const result = await login(formData);
      expect(result).toEqual({ error: 'Invalid login credentials' });
    });

    it('returns mock response when mock mode is enabled', async () => {
      process.env.NEXT_PUBLIC_STRIPE_MOCK = 'true';
      // Re-import to pick up mock mode
      vi.resetModules();
      // Re-setup mocks after reset
      vi.doMock('next/navigation', () => ({
        redirect: (...args: unknown[]) => {
          mockRedirect(...args);
          throw new Error('NEXT_REDIRECT');
        },
      }));
      vi.doMock('next/headers', () => ({
        cookies: vi.fn().mockResolvedValue({
          get: vi.fn().mockReturnValue({ value: 'en' }),
          getAll: vi.fn().mockReturnValue([]),
          set: vi.fn(),
        }),
      }));
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn().mockResolvedValue({
          auth: {
            signInWithPassword: mockSignInWithPassword,
            signUp: mockSignUp,
            signOut: mockSignOut,
            resetPasswordForEmail: mockResetPasswordForEmail,
            updateUser: mockUpdateUser,
            admin: { generateLink: mockGenerateLink },
          },
          from: mockFrom,
        }),
      }));

      const { login } = await import('../actions');
      const formData = new FormData();
      formData.set('email', 'test@example.com');
      formData.set('password', 'password123');

      const result = await login(formData);
      expect(result).toEqual({ success: true });
      expect(mockSignInWithPassword).not.toHaveBeenCalled();
    });
  });

  describe('signup', () => {
    it('calls supabase signUp and redirects on success', async () => {
      const { signup } = await import('../actions');
      mockSignUp.mockResolvedValue({ data: { user: { id: '123' } }, error: null });

      const formData = new FormData();
      formData.set('email', 'new@example.com');
      formData.set('password', 'password123');

      await expect(signup(formData)).rejects.toThrow('NEXT_REDIRECT');
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
      });
    });

    it('returns already_registered error on duplicate email', async () => {
      const { signup } = await import('../actions');
      mockSignUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' },
      });

      const formData = new FormData();
      formData.set('email', 'existing@example.com');
      formData.set('password', 'password123');

      const result = await signup(formData);
      expect(result).toEqual({ error: 'already_registered' });
    });

    it('returns mock response in mock mode', async () => {
      process.env.NEXT_PUBLIC_STRIPE_MOCK = 'true';
      vi.resetModules();
      vi.doMock('next/navigation', () => ({
        redirect: (...args: unknown[]) => {
          mockRedirect(...args);
          throw new Error('NEXT_REDIRECT');
        },
      }));
      vi.doMock('next/headers', () => ({
        cookies: vi.fn().mockResolvedValue({
          get: vi.fn().mockReturnValue({ value: 'en' }),
          getAll: vi.fn().mockReturnValue([]),
          set: vi.fn(),
        }),
      }));
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn().mockResolvedValue({
          auth: {
            signInWithPassword: mockSignInWithPassword,
            signUp: mockSignUp,
            signOut: mockSignOut,
            resetPasswordForEmail: mockResetPasswordForEmail,
            updateUser: mockUpdateUser,
            admin: { generateLink: mockGenerateLink },
          },
          from: mockFrom,
        }),
      }));

      const { signup } = await import('../actions');
      const formData = new FormData();
      formData.set('email', 'test@example.com');
      formData.set('password', 'password123');

      const result = await signup(formData);
      expect(result).toEqual({ success: true });
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('calls supabase signOut and redirects', async () => {
      const { signOut } = await import('../actions');
      mockSignOut.mockResolvedValue({ error: null });

      await expect(signOut()).rejects.toThrow('NEXT_REDIRECT');
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalled();
    });

    it('returns undefined in mock mode', async () => {
      process.env.NEXT_PUBLIC_STRIPE_MOCK = 'true';
      vi.resetModules();
      vi.doMock('next/navigation', () => ({
        redirect: (...args: unknown[]) => {
          mockRedirect(...args);
          throw new Error('NEXT_REDIRECT');
        },
      }));
      vi.doMock('next/headers', () => ({
        cookies: vi.fn().mockResolvedValue({
          get: vi.fn().mockReturnValue({ value: 'en' }),
          getAll: vi.fn().mockReturnValue([]),
          set: vi.fn(),
        }),
      }));
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn().mockResolvedValue({
          auth: {
            signInWithPassword: mockSignInWithPassword,
            signUp: mockSignUp,
            signOut: mockSignOut,
            resetPasswordForEmail: mockResetPasswordForEmail,
            updateUser: mockUpdateUser,
            admin: { generateLink: mockGenerateLink },
          },
          from: mockFrom,
        }),
      }));

      const { signOut } = await import('../actions');
      const result = await signOut();
      expect(result).toBeUndefined();
      expect(mockSignOut).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('calls admin.generateLink and sendResetEmail, always returns success', async () => {
      const { resetPassword } = await import('../actions');
      mockGenerateLink.mockResolvedValue({
        data: { properties: { action_link: 'https://example.com/reset-link' } },
        error: null,
      });

      const formData = new FormData();
      formData.set('email', 'test@example.com');

      const result = await resetPassword(formData);
      expect(result).toEqual({ success: true });
      expect(mockGenerateLink).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'recovery',
          email: 'test@example.com',
        })
      );
      // Should NOT call resetPasswordForEmail
      expect(mockResetPasswordForEmail).not.toHaveBeenCalled();
    });

    it('returns success even when email does not exist (no enumeration)', async () => {
      const { resetPassword } = await import('../actions');
      mockGenerateLink.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      });

      const formData = new FormData();
      formData.set('email', 'nonexistent@example.com');

      const result = await resetPassword(formData);
      expect(result).toEqual({ success: true });
    });

    it('returns mock response in mock mode', async () => {
      process.env.NEXT_PUBLIC_STRIPE_MOCK = 'true';
      vi.resetModules();
      vi.doMock('next/navigation', () => ({
        redirect: (...args: unknown[]) => {
          mockRedirect(...args);
          throw new Error('NEXT_REDIRECT');
        },
      }));
      vi.doMock('next/headers', () => ({
        cookies: vi.fn().mockResolvedValue({
          get: vi.fn().mockReturnValue({ value: 'en' }),
          getAll: vi.fn().mockReturnValue([]),
          set: vi.fn(),
        }),
      }));
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn().mockResolvedValue({
          auth: {
            signInWithPassword: mockSignInWithPassword,
            signUp: mockSignUp,
            signOut: mockSignOut,
            resetPasswordForEmail: mockResetPasswordForEmail,
            updateUser: mockUpdateUser,
            admin: { generateLink: mockGenerateLink },
          },
          from: mockFrom,
        }),
      }));

      const { resetPassword } = await import('../actions');
      const formData = new FormData();
      formData.set('email', 'test@example.com');

      const result = await resetPassword(formData);
      expect(result).toEqual({ success: true });
      expect(mockGenerateLink).not.toHaveBeenCalled();
    });
  });

  describe('updatePassword', () => {
    it('calls supabase updateUser and redirects on success', async () => {
      const { updatePassword } = await import('../actions');
      mockUpdateUser.mockResolvedValue({ error: null });

      const formData = new FormData();
      formData.set('password', 'newpassword123');

      await expect(updatePassword(formData)).rejects.toThrow('NEXT_REDIRECT');
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newpassword123' });
    });

    it('returns error on failure', async () => {
      const { updatePassword } = await import('../actions');
      mockUpdateUser.mockResolvedValue({
        error: { message: 'Password too weak' },
      });

      const formData = new FormData();
      formData.set('password', 'short');

      const result = await updatePassword(formData);
      expect(result).toEqual({ error: 'Password too weak' });
    });

    it('returns mock response in mock mode', async () => {
      process.env.NEXT_PUBLIC_STRIPE_MOCK = 'true';
      vi.resetModules();
      vi.doMock('next/navigation', () => ({
        redirect: (...args: unknown[]) => {
          mockRedirect(...args);
          throw new Error('NEXT_REDIRECT');
        },
      }));
      vi.doMock('next/headers', () => ({
        cookies: vi.fn().mockResolvedValue({
          get: vi.fn().mockReturnValue({ value: 'en' }),
          getAll: vi.fn().mockReturnValue([]),
          set: vi.fn(),
        }),
      }));
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn().mockResolvedValue({
          auth: {
            signInWithPassword: mockSignInWithPassword,
            signUp: mockSignUp,
            signOut: mockSignOut,
            resetPasswordForEmail: mockResetPasswordForEmail,
            updateUser: mockUpdateUser,
            admin: { generateLink: mockGenerateLink },
          },
          from: mockFrom,
        }),
      }));

      const { updatePassword } = await import('../actions');
      const formData = new FormData();
      formData.set('password', 'newpassword123');

      const result = await updatePassword(formData);
      expect(result).toEqual({ success: true });
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });
  });

  describe('convertGuestToAccount', () => {
    it('calls signUp with converted_from_guest metadata', async () => {
      const { convertGuestToAccount } = await import('../actions');
      mockSignUp.mockResolvedValue({
        data: { user: { id: 'new-user-id' } },
        error: null,
      });

      const formData = new FormData();
      formData.set('email', 'guest@example.com');
      formData.set('password', 'password123');

      const result = await convertGuestToAccount(formData);
      expect(result).toEqual({ success: true });
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'guest@example.com',
        password: 'password123',
        options: {
          data: { converted_from_guest: true },
        },
      });
    });

    it('returns already_registered on duplicate email', async () => {
      const { convertGuestToAccount } = await import('../actions');
      mockSignUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' },
      });

      const formData = new FormData();
      formData.set('email', 'existing@example.com');
      formData.set('password', 'password123');

      const result = await convertGuestToAccount(formData);
      expect(result).toEqual({ error: 'already_registered' });
    });

    it('calls linkOrdersByEmail after successful signup', async () => {
      const { convertGuestToAccount } = await import('../actions');
      mockSignUp.mockResolvedValue({
        data: { user: { id: 'new-user-id' } },
        error: null,
      });

      const formData = new FormData();
      formData.set('email', 'guest@example.com');
      formData.set('password', 'password123');

      await convertGuestToAccount(formData);
      // linkOrdersByEmail is now real -- verify it called supabase
      expect(mockFrom).toHaveBeenCalledWith('orders');
      expect(mockUpdate).toHaveBeenCalledWith({ user_id: 'new-user-id' });
      expect(mockEq).toHaveBeenCalledWith('email', 'guest@example.com');
    });

    it('returns mock response in mock mode', async () => {
      process.env.NEXT_PUBLIC_STRIPE_MOCK = 'true';
      vi.resetModules();
      vi.doMock('next/navigation', () => ({
        redirect: (...args: unknown[]) => {
          mockRedirect(...args);
          throw new Error('NEXT_REDIRECT');
        },
      }));
      vi.doMock('next/headers', () => ({
        cookies: vi.fn().mockResolvedValue({
          get: vi.fn().mockReturnValue({ value: 'en' }),
          getAll: vi.fn().mockReturnValue([]),
          set: vi.fn(),
        }),
      }));
      vi.doMock('@/lib/supabase/server', () => ({
        createClient: vi.fn().mockResolvedValue({
          auth: {
            signInWithPassword: mockSignInWithPassword,
            signUp: mockSignUp,
            signOut: mockSignOut,
            resetPasswordForEmail: mockResetPasswordForEmail,
            updateUser: mockUpdateUser,
            admin: { generateLink: mockGenerateLink },
          },
          from: mockFrom,
        }),
      }));

      const { convertGuestToAccount } = await import('../actions');
      const formData = new FormData();
      formData.set('email', 'test@example.com');
      formData.set('password', 'password123');

      const result = await convertGuestToAccount(formData);
      expect(result).toEqual({ success: true });
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });
});
