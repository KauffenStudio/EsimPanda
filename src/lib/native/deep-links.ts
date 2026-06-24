import { isNative } from './platform';
import { safeNext } from '@/lib/auth/safe-redirect';

/**
 * Universal Links / custom-scheme deep link handler for the native shell.
 *
 * When iOS opens the app via a tap on https://esimpanda.co/<...> (a
 * Universal Link), Capacitor's @capacitor/app emits `appUrlOpen`. This
 * wires the URL into Next.js client navigation so the user lands on
 * the same page they would have inside the browser. On the web this
 * is a no-op (the OS routes the URL to Safari directly).
 *
 * OAuth callback: when SFSafariViewController finishes the OAuth flow it
 * redirects to `esimpanda://auth/callback?code=...&next=...`. iOS fires
 * appUrlOpen with that URL. We close the in-app browser, exchange the code
 * client-side, then navigate to `next`.
 */
export async function attachDeepLinkRouter(navigate: (path: string) => void): Promise<void> {
  if (!isNative()) return;

  const { App } = await import('@capacitor/app');

  await App.addListener('appUrlOpen', async ({ url }) => {
    try {
      // OAuth callback via custom URL scheme (esimpanda://auth/callback?code=...).
      // The code is exchanged here so the session lands in the WKWebView's
      // Supabase client — no external Safari round-trip required.
      if (url.startsWith('esimpanda://auth/callback')) {
        const qs = url.includes('?') ? url.split('?')[1] : '';
        const params = new URLSearchParams(qs);
        const code = params.get('code');
        // safeNext rejects off-site / protocol-relative targets so a crafted
        // esimpanda://auth/callback?next=//evil.com link can't redirect the
        // in-app WebView off esimpanda.co (open-redirect / in-app phishing).
        const nextPath = safeNext(params.get('next'));

        // Close SFSafariViewController first so the UI snaps back immediately.
        const { Browser } = await import('@capacitor/browser');
        await Browser.close();

        if (code) {
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('[deep-link] code exchange failed:', error.message);
            navigate('/en/login?error=oauth_failed');
            return;
          }
        }

        navigate(nextPath);
        return;
      }

      const parsed = new URL(url);
      const path = `${parsed.pathname}${parsed.search}${parsed.hash}` || '/';

      if (parsed.pathname.startsWith('/api/') || parsed.pathname.startsWith('/auth/')) {
        // Don't try to client-route API or auth callback paths.
        return;
      }

      navigate(path);
    } catch {
      // Malformed URL — ignore.
    }
  });
}
