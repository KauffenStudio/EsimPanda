import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

const protectedPaths = ['/dashboard'];

function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some((p) => pathname.includes(p));
}

export async function middleware(request: NextRequest) {
  // 1. Handle i18n routing first (returns response with locale headers)
  const response = handleI18nRouting(request);

  // 2. Refresh Supabase auth session (writes cookies to the same response)
  await updateSession(request, response);

  // 3. Protect dashboard routes (redirect unauthenticated users to login)
  const { pathname } = request.nextUrl;

  if (isProtectedPath(pathname) && process.env.NEXT_PUBLIC_STRIPE_MOCK !== 'true') {
    // Check for Supabase auth session cookie
    const hasSession = request.cookies.getAll().some(
      (c) => c.name.includes('auth-token') && c.value
    );

    if (!hasSession) {
      // Extract locale from pathname (e.g., /en/dashboard -> en)
      const segments = pathname.split('/').filter(Boolean);
      const locale = segments[0] || 'en';
      const loginUrl = new URL(`/${locale}/login?next=/dashboard`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/', '/(en)/:path*'],
};
