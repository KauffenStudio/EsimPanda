import { isNative } from './platform';

/**
 * Universal Links / custom-scheme deep link handler for the native shell.
 *
 * When iOS opens the app via a tap on https://esimpanda.co/<...> (a
 * Universal Link), Capacitor's @capacitor/app emits `appUrlOpen`. This
 * wires the URL into Next.js client navigation so the user lands on
 * the same page they would have inside the browser. On the web this
 * is a no-op (the OS routes the URL to Safari directly).
 */
export async function attachDeepLinkRouter(navigate: (path: string) => void): Promise<void> {
  if (!isNative()) return;

  const { App } = await import('@capacitor/app');

  await App.addListener('appUrlOpen', ({ url }) => {
    try {
      const parsed = new URL(url);
      // Both https://esimpanda.co/... and esimpanda://... resolve here.
      const path = `${parsed.pathname}${parsed.search}${parsed.hash}` || '/';
      navigate(path);
    } catch {
      // Malformed URL — ignore.
    }
  });
}
