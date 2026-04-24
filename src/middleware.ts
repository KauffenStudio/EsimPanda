import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';
import { type NextRequest } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Handle i18n routing first (returns response with locale headers)
  const response = handleI18nRouting(request);

  // 2. Refresh Supabase auth session (writes cookies to the same response)
  await updateSession(request, response);

  return response;
}

export const config = {
  matcher: ['/', '/(en)/:path*'],
};
