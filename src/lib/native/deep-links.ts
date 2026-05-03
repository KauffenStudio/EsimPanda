import { isNative } from './platform';

/**
 * Universal Links / custom-scheme deep link handler for the native shell.
 *
 * When iOS opens the app via a tap on https://esimpanda.co/<...> (a
 * Universal Link), Capacitor's @capacitor/app emits `appUrlOpen`. This
 * wires the URL into Next.js client navigation so the user lands on
 * the same page they would have inside the browser. On the web this
 * is a no-op (the OS routes the URL to Safari directly).
 *
 * /api/* paths are intentionally skipped: the WebView must handle
 * those navigations itself (OAuth callbacks, webhooks). If iOS did
 * intercept them as Universal Links, router.push() of an API route
 * would silently break the OAuth round trip. AASA also excludes
 * /api/* but this is defence-in-depth in case the cached AASA still
 * claims those paths.
 */
export async function attachDeepLinkRouter(navigate: (path: string) => void): Promise<void> {
  if (!isNative()) return;

  const { App } = await import('@capacitor/app');

  await App.addListener('appUrlOpen', ({ url }) => {
    try {
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
