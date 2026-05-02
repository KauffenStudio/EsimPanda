import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

const protectedPaths = ['/dashboard'];

function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some((p) => pathname.includes(p));
}

const ALLOWED_ORIGINS: string[] = [
  'https://esimpanda.co',
  'https://www.esimpanda.co',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
];

function handleCors(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin') ?? '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin);

  // Preflight
  if (request.method === 'OPTIONS') {
    if (!isAllowed) {
      return new NextResponse(null, { status: 403 });
    }
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
        Vary: 'Origin',
      },
    });
  }

  const response = NextResponse.next();
  if (isAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Vary', 'Origin');
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CORS for /api/* (skip /api/webhooks and /api/auth/callback which receive
  // server-to-server or navigation traffic without a browser Origin to vet)
  if (
    pathname.startsWith('/api/') &&
    !pathname.startsWith('/api/webhooks/') &&
    pathname !== '/api/auth/callback'
  ) {
    return handleCors(request);
  }

  // 1. Handle i18n routing first (returns response with locale headers)
  const response = handleI18nRouting(request);

  // 2. Refresh Supabase auth session (writes cookies to the same response)
  await updateSession(request, response);

  // 3. Protect dashboard routes (redirect unauthenticated users to login)
  if (isProtectedPath(pathname)) {
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
  matcher: ['/', '/(en|pt|es|fr|zh|ja)/:path*', '/api/:path*'],
};
