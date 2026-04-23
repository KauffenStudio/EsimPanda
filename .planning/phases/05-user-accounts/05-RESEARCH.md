# Phase 5: User Accounts - Research

**Researched:** 2026-04-23
**Domain:** Supabase Auth SSR with Next.js App Router
**Confidence:** HIGH

## Summary

Phase 5 adds email/password authentication to eSIM Panda using Supabase Auth, which is already partially set up (browser and server clients exist with `@supabase/ssr`). The core work involves: (1) extending the existing middleware to refresh auth sessions alongside next-intl routing, (2) creating login/signup/reset-password pages with server actions, (3) adding a guest-to-account conversion CTA on the delivery page, (4) updating the header with login button and user avatar dropdown, and (5) creating a Zustand auth store that wraps Supabase session state.

The project already uses `@supabase/ssr@0.10.2` and `@supabase/supabase-js@2.103.3` with properly configured browser and server clients including cookie handling. The middleware currently only handles next-intl i18n routing and needs to be extended (not replaced) with Supabase session refresh. The established pattern of mock data in dev (no Supabase connection) must be preserved.

**Primary recommendation:** Use Supabase Auth server actions for all auth operations (signUp, signInWithPassword, resetPasswordForEmail, signOut), extend middleware with session refresh via `supabase.auth.getUser()`, and add a PKCE callback route handler for password reset email links.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Guest-to-account conversion on delivery page: password-only field (email already known from checkout)
- Auto-link orders by email: match guest email to order email, all previous orders appear automatically
- Account is optional: browse, buy, receive eSIMs without account
- Email/password only: no social login, no magic links
- Dedicated pages: `/login` and `/signup` as full pages with Bambu companion
- Signup form: two fields only (email and password), name optional later
- Bambu welcoming wave on login, happy bounce on successful signup
- Password minimum 8 characters, no special character requirements
- Duplicate email: "This email already has an account. Log in instead?" with link
- Always remember sessions: no "remember me" checkbox, persist until explicit logout
- Header login button: "Log in" text, becomes user avatar/initial circle with dropdown after login
- Branded reset email: same eSIM Panda template with Bambu, blue accent (#2979FF), via Resend + React Email
- New password page at `/reset-password` with password + confirm fields
- 1 hour link expiry (Supabase default)
- No email enumeration: same message regardless of email existence
- Avatar/initial in header: circle with first letter of email, dropdown with My eSIMs, Settings, Log out
- No protected pages in Phase 5: all pages stay public, account-required pages in Phase 6
- Supabase session + Zustand store: Zustand auth store wraps Supabase for component access
- Silent token refresh: Supabase auto-refreshes, user never notices

### Claude's Discretion
- Exact Bambu poses for auth pages (welcoming wave, happy bounce implementation details)
- Form field layout and spacing on login/signup pages
- Dropdown menu styling and animation for logged-in user
- Password reset email template layout
- Error message copy for specific auth failures
- Loading states during auth operations
- Middleware approach for extending existing i18n middleware with auth

### Deferred Ideas (OUT OF SCOPE)
- Social login (Google, Apple) -- v2 enhancement
- Magic link authentication -- v2 alternative
- User profile page with settings -- Phase 6
- eSIM management dashboard -- Phase 6
- Order history page -- Phase 6
- Account deletion/GDPR -- Phase 9 or separate
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ACC-01 | User can create account after purchase (guest-to-account conversion) | Supabase `signUp` with known email + password-only field on delivery page. Auto-link by matching email in orders table |
| ACC-02 | User can log in with email/password | Supabase `signInWithPassword` via server action, dedicated `/login` page |
| ACC-03 | User can reset password via email link | Supabase `resetPasswordForEmail` + PKCE callback route + `updateUser` on `/reset-password` page. Branded email via Resend |
| ACC-04 | User session persists across browser refresh | Supabase SSR cookie-based sessions with middleware refresh via `getUser()`. Zustand auth store rehydrates from Supabase on mount |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | 2.103.3 (latest: 2.104.1) | Auth client, session management | Already installed, provides signUp/signIn/resetPassword/signOut |
| @supabase/ssr | 0.10.2 | Server-side cookie handling for Next.js | Already installed, createBrowserClient + createServerClient |
| zustand | 5.0.12 | Auth state store | Already installed, matches project pattern (checkout.ts, delivery.ts, browse.ts) |
| next-intl | 4.9.1 | i18n routing + translations | Already installed, middleware must be extended not replaced |
| resend | 6.12.2 | Email sending for password reset | Already installed, reuse lazy-init pattern from send-delivery.ts |
| @react-email/components | 1.0.12 | Password reset email template | Already installed, reuse delivery-email.tsx pattern |
| zod | 4.3.6 | Form validation schemas | Already installed, use for auth form validation |

### Supporting (No New Dependencies)
No new packages required. All auth functionality is provided by the existing Supabase SDK.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Server actions for auth | API routes | Server actions are simpler, colocated with forms, and the project already uses API routes for other things -- server actions are better for form submissions |
| Zustand auth store | React Context | Zustand matches existing project pattern and is simpler to use outside component tree |

**Installation:**
```bash
# No new packages needed -- all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── [locale]/
│   │   ├── login/page.tsx              # Login page
│   │   ├── signup/page.tsx             # Signup page
│   │   ├── reset-password/page.tsx     # New password form (after email link)
│   │   └── forgot-password/page.tsx    # Request reset email
│   └── api/
│       └── auth/
│           └── callback/route.ts       # PKCE code exchange for password reset
├── components/
│   ├── auth/
│   │   ├── login-form.tsx              # Email + password form
│   │   ├── signup-form.tsx             # Email + password form (conversion variant too)
│   │   ├── forgot-password-form.tsx    # Email-only form
│   │   ├── reset-password-form.tsx     # New password + confirm form
│   │   ├── account-conversion-cta.tsx  # Delivery page CTA (password-only)
│   │   └── user-menu.tsx              # Header avatar dropdown
│   └── bambu/
│       └── bambu-welcome.tsx           # New Bambu pose for auth pages
├── lib/
│   ├── auth/
│   │   ├── actions.ts                  # Server actions: login, signup, logout, resetPassword
│   │   ├── mock.ts                     # Mock auth for dev (no Supabase connection)
│   │   └── types.ts                    # Auth-related types
│   ├── email/
│   │   ├── send-reset.ts              # Password reset email sender (reuse Resend pattern)
│   │   └── templates/
│   │       └── reset-email.tsx         # React Email template for reset
│   └── supabase/
│       ├── client.ts                   # (exists) Browser client
│       ├── server.ts                   # (exists) Server client with cookies
│       └── middleware.ts               # NEW: updateSession helper for middleware
├── stores/
│   └── auth.ts                         # Zustand auth store
└── middleware.ts                        # Extended: i18n + Supabase session refresh
```

### Pattern 1: Combined next-intl + Supabase Middleware
**What:** Extend existing middleware to refresh Supabase auth sessions alongside i18n routing.
**When to use:** Every request that hits the middleware matcher.
**Example:**
```typescript
// Source: next-intl discussion #422 + Supabase SSR docs
import { createServerClient } from '@supabase/ssr';
import { type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Handle i18n routing first (returns response with locale headers)
  const response = handleI18nRouting(request);

  // 2. Create Supabase client that writes cookies to the i18n response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Refresh session -- MUST use getUser(), not getSession()
  // getUser() sends a request to Supabase Auth to revalidate the token
  // getSession() only reads from cookies and is NOT safe in server code
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ['/', '/(en)/:path*'],
};
```

### Pattern 2: Server Actions for Auth Operations
**What:** Server actions handle all auth mutations, colocated in a single file.
**When to use:** Login, signup, logout, password reset request, password update.
**Example:**
```typescript
// src/lib/auth/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Return error to client -- don't throw (breaks form state)
    return { error: error.message };
  }

  redirect('/en'); // or locale-aware redirect
}

export async function signup(formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  // No email confirmation required for this flow
  redirect('/en');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/en/login');
}

export async function resetPassword(formData: FormData) {
  const email = String(formData.get('email') ?? '');

  const supabase = await createClient();
  // Always return same message (no email enumeration)
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/en/reset-password`,
  });

  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get('password') ?? '');

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect('/en');
}
```

### Pattern 3: PKCE Auth Callback Route Handler
**What:** API route that exchanges auth code for session after password reset email click.
**When to use:** Supabase redirects user back to app after clicking reset link.
**Example:**
```typescript
// src/app/api/auth/callback/route.ts
import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/en';

  const supabase = await createClient();

  if (code) {
    // PKCE flow: exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  } else if (token_hash && type) {
    // Token hash flow: verify OTP
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Error fallback
  return NextResponse.redirect(new URL('/en/login?error=invalid_link', request.url));
}
```

### Pattern 4: Zustand Auth Store
**What:** Client-side store wrapping Supabase auth state for easy component access.
**When to use:** Any client component that needs to know auth state (header, CTA, forms).
**Example:**
```typescript
// src/stores/auth.ts
import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  initialize: async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    set({ user, loading: false });

    // Listen for auth state changes (login, logout, token refresh)
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null });
    });
  },

  setUser: (user) => set({ user }),
}));
```

### Pattern 5: Guest-to-Account Conversion (Delivery Page)
**What:** One-field password form on delivery page since email is already known.
**When to use:** After eSIM is ready on the delivery/success page.
**Example:**
```typescript
// Conversion CTA on delivery page -- email from checkout, only need password
export async function convertGuestToAccount(formData: FormData) {
  const email = String(formData.get('email') ?? ''); // hidden field
  const password = String(formData.get('password') ?? '');

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Skip email confirmation for conversion flow
      // User already proved email ownership by receiving eSIM
      data: { converted_from_guest: true },
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'already_registered' };
    }
    return { error: error.message };
  }

  return { success: true, user: data.user };
}
```

### Pattern 6: Mock Auth for Development
**What:** Mock auth that works without Supabase connection (per project constraint).
**When to use:** When NEXT_PUBLIC_STRIPE_MOCK=true or similar mock flag.
**Example:**
```typescript
// src/lib/auth/mock.ts
// Follow the same NEXT_PUBLIC_STRIPE_MOCK pattern used elsewhere
// Mock user for dev: simulate logged-in state without Supabase

export const MOCK_USER = {
  id: 'mock-user-id',
  email: 'test@esimpanda.com',
  created_at: new Date().toISOString(),
};

export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true';
}
```

### Anti-Patterns to Avoid
- **Using getSession() in server code:** Always use `getUser()` in middleware and server components. `getSession()` reads from cookies without revalidation and is NOT secure for server-side auth checks.
- **Protecting pages in Phase 5:** Per user decision, NO pages are protected yet. Auth is optional. Protected pages come in Phase 6.
- **Replacing middleware:** The existing i18n middleware must be EXTENDED, not replaced. Chain the Supabase session refresh after i18n routing.
- **Custom session management:** Supabase handles cookies, refresh tokens, and session persistence automatically. Do not build custom cookie logic.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session cookies | Custom cookie management | Supabase SSR `createServerClient` with getAll/setAll | Handles secure httpOnly cookies, refresh tokens, PKCE automatically |
| Token refresh | Manual token refresh logic | Supabase middleware `getUser()` call | Supabase auto-refreshes expired tokens on each middleware hit |
| Password hashing | bcrypt or custom hashing | Supabase Auth | Supabase handles all password security server-side |
| Email verification | Custom verification flow | Supabase `signUp` with auto-confirm | For guest conversion, email is already verified via purchase receipt |
| Rate limiting | Custom rate limiter for auth | Supabase Auth built-in rate limits | Supabase rate-limits auth endpoints by default |
| CSRF protection | Custom CSRF tokens | Next.js server actions + Supabase PKCE | Server actions have built-in CSRF protection, Supabase uses PKCE for email flows |

**Key insight:** Supabase Auth handles the entire auth lifecycle (signup, login, session, refresh, reset, security). The app only needs UI forms, server actions that call Supabase methods, and middleware to keep sessions fresh.

## Common Pitfalls

### Pitfall 1: getSession() vs getUser() in Server Code
**What goes wrong:** Using `supabase.auth.getSession()` in middleware or server components returns stale/spoofable data.
**Why it happens:** `getSession()` only reads from cookies without verifying the JWT with Supabase Auth server.
**How to avoid:** Always use `supabase.auth.getUser()` in server-side code. Reserve `getSession()` for client components only.
**Warning signs:** Auth state inconsistency between client and server renders.

### Pitfall 2: Middleware Cookie Propagation
**What goes wrong:** Supabase refreshes session but new cookies don't reach the browser.
**Why it happens:** When combining next-intl and Supabase middleware, the Supabase client must write cookies to the SAME response object that next-intl created.
**How to avoid:** Pass the next-intl response to Supabase's `setAll` handler (see Pattern 1 above). The Supabase client writes refreshed cookies to the response that next-intl already configured.
**Warning signs:** Users get logged out randomly, especially after token expiry (default 1 hour).

### Pitfall 3: Password Reset Redirect URL
**What goes wrong:** Password reset email link leads to 404 or wrong page.
**Why it happens:** The `redirectTo` URL in `resetPasswordForEmail` must point to the auth callback route (not directly to the reset-password page), and the callback must exchange the code before redirecting to the actual reset form.
**How to avoid:** Use `/api/auth/callback?next=/en/reset-password` as the redirectTo. The callback route exchanges the code for a session, then redirects to the reset form where `updateUser` can be called.
**Warning signs:** "Auth session missing" error when trying to update password.

### Pitfall 4: Email Confirmation vs Guest Conversion
**What goes wrong:** Supabase sends a confirmation email after signUp, blocking immediate login.
**Why it happens:** Supabase has email confirmation enabled by default in production.
**How to avoid:** For guest-to-account conversion, disable email confirmation OR use the `autoconfirm` Supabase project setting. The user already proved email ownership by receiving their eSIM at that email. For regular signup, decide whether to require confirmation (adds friction for a travel app where users need immediate access).
**Warning signs:** User signs up but can't log in until they click confirmation link.

### Pitfall 5: Mock Mode Auth
**What goes wrong:** Auth calls fail in dev because there's no Supabase connection.
**Why it happens:** Project constraint: no Supabase connection during dev, use mock/stub data.
**How to avoid:** Create mock auth utilities that return fake user/session data when mock mode is active. Follow the existing `NEXT_PUBLIC_STRIPE_MOCK` pattern. Auth actions should check mock mode and return mock responses.
**Warning signs:** Network errors on login/signup in dev environment.

### Pitfall 6: Duplicate Email on Signup
**What goes wrong:** User gets cryptic error when trying to sign up with an email that already has an account.
**Why it happens:** Supabase returns a generic error or (if email enumeration protection is on) silently succeeds without creating a duplicate.
**How to avoid:** Handle the specific error message from Supabase ("User already registered") and show the user-friendly message: "This email already has an account. Log in instead?" with a link to `/login`.
**Warning signs:** Users confused by signup "succeeding" but not being able to log in.

## Code Examples

### Password Reset Email Template (React Email)
```typescript
// src/lib/email/templates/reset-email.tsx
// Reuse delivery-email.tsx patterns: same branded header, Bambu, blue accent
import { Html, Head, Body, Container, Section, Text, Button, Preview } from '@react-email/components';

const fontFamily = 'Plus Jakarta Sans, Arial, sans-serif';

export function ResetEmail({ resetUrl }: { resetUrl: string }) {
  return (
    <Html>
      <Head />
      <Preview>Reset your eSIM Panda password</Preview>
      <Body style={{ backgroundColor: '#F6F9FC', margin: 0, padding: '40px 0', fontFamily }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#FFFFFF', borderRadius: '10px', overflow: 'hidden' }}>
          {/* Blue header bar -- same as delivery email */}
          <Section style={{ backgroundColor: '#2979FF', height: '64px', textAlign: 'center', padding: '0 20px' }}>
            <Text style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: 'bold', fontFamily, margin: 0, lineHeight: '64px' }}>
              eSIM Panda
            </Text>
          </Section>

          <Section style={{ padding: '32px 40px', textAlign: 'center' }}>
            <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1A1A1A', fontFamily }}>
              Reset Your Password
            </Text>
            <Text style={{ fontSize: '16px', color: '#666666', fontFamily }}>
              Click below to set a new password for your account.
            </Text>
            <Button href={resetUrl} style={{
              backgroundColor: '#2979FF', color: '#FFFFFF', fontFamily,
              fontSize: '16px', fontWeight: 'bold', height: '48px', lineHeight: '48px',
              borderRadius: '8px', padding: '0 32px', textDecoration: 'none',
              display: 'inline-block', marginTop: '16px',
            }}>
              Reset Password
            </Button>
            <Text style={{ fontSize: '14px', color: '#999999', fontFamily, marginTop: '24px' }}>
              This link expires in 1 hour. If you did not request this, ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

### Auth Store Initialization in Layout
```typescript
// In a client component wrapper or layout effect
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @supabase/auth-helpers-nextjs | @supabase/ssr | 2024 | New cookie-based SSR approach, auth-helpers is deprecated |
| getSession() for server auth | getUser() for server auth | 2024 | Security fix: getUser() revalidates with Supabase server |
| Manual PKCE implementation | Supabase built-in PKCE | 2023 | resetPasswordForEmail uses PKCE automatically |
| Separate auth middleware | Combined with existing middleware | Current | Chain Supabase session refresh with next-intl in same middleware |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Deprecated, replaced by `@supabase/ssr`
- `supabase.auth.getSession()` in server code: Insecure, use `getUser()` instead
- Implicit grant flow for password reset: Replaced by PKCE flow

## Open Questions

1. **Email confirmation on signup**
   - What we know: Supabase enables email confirmation by default in production. Guest conversion users already proved email ownership.
   - What's unclear: Whether to disable email confirmation project-wide or handle it per-flow.
   - Recommendation: Disable email confirmation in Supabase project settings (autoconfirm=true). Users are buying eSIMs, not managing sensitive data. Friction kills conversion. Can enable later if needed.

2. **Custom password reset email vs Supabase default**
   - What we know: User wants branded reset email via Resend (like delivery email). Supabase sends its own reset email by default.
   - What's unclear: Whether to use Supabase's built-in email or override with custom Resend email.
   - Recommendation: Use Supabase's `resetPasswordForEmail` which handles the PKCE flow and token generation, but configure Supabase to use a custom SMTP (Resend) so the email template can be branded. Alternatively, use Supabase's built-in email templates which can be customized in the Supabase dashboard. Since we have no Supabase connection in dev, mock the reset flow entirely in mock mode.

3. **Order auto-linking implementation**
   - What we know: Orders should auto-link by matching email. Currently orders are tracked in-memory (Phase 4 decision).
   - What's unclear: Whether to add a `user_id` column to orders now or defer to Phase 6 when the dashboard needs it.
   - Recommendation: Add a `user_id` nullable column concept to the order type, and on account creation, do a conceptual "link" (set user_id on orders matching email). Since no Supabase DB in dev, this is a mock/type-level change. Actual DB migration happens when Supabase is connected.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --coverage` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ACC-01 | Guest-to-account conversion (signUp with known email) | unit | `npx vitest run src/lib/auth/__tests__/actions.test.ts -t "convert"` | No -- Wave 0 |
| ACC-02 | Login with email/password (signInWithPassword) | unit | `npx vitest run src/lib/auth/__tests__/actions.test.ts -t "login"` | No -- Wave 0 |
| ACC-03 | Password reset flow (resetPasswordForEmail + updateUser) | unit | `npx vitest run src/lib/auth/__tests__/actions.test.ts -t "reset"` | No -- Wave 0 |
| ACC-04 | Session persistence (middleware refresh, store rehydration) | unit | `npx vitest run src/stores/__tests__/auth.test.ts` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --coverage`
- **Phase gate:** Full suite green before /gsd:verify-work

### Wave 0 Gaps
- [ ] `src/lib/auth/__tests__/actions.test.ts` -- covers ACC-01, ACC-02, ACC-03 (mock Supabase client)
- [ ] `src/stores/__tests__/auth.test.ts` -- covers ACC-04 (mock Supabase auth state)
- [ ] `src/lib/email/__tests__/send-reset.test.ts` -- covers ACC-03 email sending

## Sources

### Primary (HIGH confidence)
- @supabase/ssr package -- already installed at 0.10.2, cookie handling verified in existing client.ts/server.ts
- @supabase/supabase-js -- already installed at 2.103.3, auth methods documented
- Existing codebase -- middleware.ts, stores/, email templates verified by direct file reads
- [Supabase SSR Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) -- official docs on middleware setup
- [Supabase Password Auth](https://supabase.com/docs/guides/auth/passwords) -- signUp, signInWithPassword, resetPasswordForEmail, updateUser
- [next-intl + Supabase middleware discussion #422](https://github.com/amannn/next-intl/discussions/422) -- maintainer-approved pattern for combining middlewares

### Secondary (MEDIUM confidence)
- [Ryan Katayi blog](https://www.ryankatayi.com/blog/server-side-auth-in-next-js-with-supabase-my-setup) -- complete implementation example verified against official patterns
- [Supabase PKCE flow docs](https://supabase.com/docs/guides/auth/sessions/pkce-flow) -- code exchange pattern for password reset

### Tertiary (LOW confidence)
- Email confirmation behavior in production -- needs verification against actual Supabase project settings when connected

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages already installed, versions verified via npm view
- Architecture: HIGH -- patterns verified from official docs and existing codebase patterns
- Pitfalls: HIGH -- well-documented issues in Supabase community, verified with official security warnings
- Mock mode approach: MEDIUM -- follows existing project pattern but auth mocking is more complex than payment mocking

**Research date:** 2026-04-23
**Valid until:** 2026-05-23 (stable -- Supabase SSR API is mature)
