import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('motion/react', () => ({
  motion: {
    button: ({ children, ...props }: Record<string, unknown>) => {
      const { whileTap, transition, ...rest } = props as Record<string, unknown>;
      void whileTap;
      void transition;
      return <button {...(rest as Record<string, unknown>)}>{children as React.ReactNode}</button>;
    },
    div: ({ children, ...props }: Record<string, unknown>) => (
      <div {...props}>{children as React.ReactNode}</div>
    ),
    g: ({ children, ...props }: Record<string, unknown>) => (
      <g {...props}>{children as React.ReactNode}</g>
    ),
  },
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const messages: Record<string, string> = {
      continueWithGoogle: 'Continue with Google',
      continueWithApple: 'Continue with Apple',
      dividerOr: 'or',
      error: 'Could not sign in. Please try again.',
    };
    return messages[key] ?? key;
  },
}));

const mockSignInWithOAuth = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

describe('OAuthButtons', () => {
  beforeEach(() => {
    mockSignInWithOAuth.mockReset();
  });

  it('renders both provider buttons and the divider', async () => {
    const { OAuthButtons } = await import('../oauth-buttons');
    render(<OAuthButtons next="/en" />);
    expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue with Apple/i })).toBeInTheDocument();
    expect(screen.getByText('or')).toBeInTheDocument();
  });

  it('clicking Apple calls signInWithOAuth with provider=apple', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null });
    const { OAuthButtons } = await import('../oauth-buttons');
    render(<OAuthButtons next="/en" />);
    fireEvent.click(screen.getByRole('button', { name: /Continue with Apple/i }));
    await waitFor(() => expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1));
    expect(mockSignInWithOAuth.mock.calls[0][0].provider).toBe('apple');
  });

  it('clicking Google calls signInWithOAuth with provider=google and encoded next in redirectTo', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null });
    const { OAuthButtons } = await import('../oauth-buttons');
    render(<OAuthButtons next="/pt" />);
    fireEvent.click(screen.getByRole('button', { name: /Continue with Google/i }));
    await waitFor(() => expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1));
    const callArgs = mockSignInWithOAuth.mock.calls[0][0];
    expect(callArgs.provider).toBe('google');
    expect(callArgs.options.redirectTo).toContain('/api/auth/callback?next=');
    expect(callArgs.options.redirectTo).toContain(encodeURIComponent('/pt'));
  });

  it('shows error message when signInWithOAuth returns an error', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: { message: 'oauth provider error' } });
    const { OAuthButtons } = await import('../oauth-buttons');
    render(<OAuthButtons next="/en" />);
    fireEvent.click(screen.getByRole('button', { name: /Continue with Google/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Could not sign in. Please try again.'),
    );
  });
});
