import { NextResponse } from 'next/server';
import { trackReferralClick } from '@/lib/referral/actions';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  // Track the click
  await trackReferralClick(code);

  // Redirect to default locale
  const url = new URL('/en', request.url);
  const response = NextResponse.redirect(url, 307);

  // Set referral cookie with 7-day expiry
  response.cookies.set('ref', code, {
    maxAge: 7 * 24 * 60 * 60, // 604800 seconds
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return response;
}
