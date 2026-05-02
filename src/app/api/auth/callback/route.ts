import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { linkOrdersByEmail } from '@/lib/auth/order-linking';
import { safeNext } from '@/lib/auth/safe-redirect';

function buildRedirectUrl(request: NextRequest, path: string): string {
  const { origin } = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';

  if (isLocalEnv) {
    return `${origin}${path}`;
  }
  if (forwardedHost) {
    return `https://${forwardedHost}${path}`;
  }
  return `${origin}${path}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const code = searchParams.get('code');
  const next = safeNext(searchParams.get('next'));

  console.log('[auth/callback] hit', {
    hasCode: !!code,
    hasToken: !!token_hash,
    next,
    forwardedHost: request.headers.get('x-forwarded-host'),
    requestUrl: request.url,
  });

  const supabase = await createClient();

  if (code) {
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      console.log('[auth/callback] exchange ok', { userId: data?.user?.id });
      if (data?.user?.email && data.user.id) {
        const linked = await linkOrdersByEmail(data.user.email, data.user.id);
        if (linked > 0) {
          console.log('[auth/callback] linked guest orders', { count: linked, userId: data.user.id });
        }
      }
      return NextResponse.redirect(buildRedirectUrl(request, next));
    }
    console.error('[auth/callback] exchange failed:', error.message);
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(buildRedirectUrl(request, next));
    }
    console.error('[auth/callback] verifyOtp failed:', error.message);
  }

  return NextResponse.redirect(buildRedirectUrl(request, '/en/login?error=invalid_link'));
}
