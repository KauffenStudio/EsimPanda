import { isNative } from './platform';

/**
 * Hide the iOS / Android Capacitor splash screen as soon as the React
 * tree is ready. The default Capacitor splash sits there for a fixed
 * 3-second timeout regardless of how fast the page loads, which makes
 * a fast load feel slow. Disabling launchAutoHide in capacitor.config
 * and calling this helper from the layout closes the splash the moment
 * the AuthProvider has hydrated.
 *
 * No-op on the web.
 */
export async function hideNativeSplash(): Promise<void> {
  if (!isNative()) return;
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide({ fadeOutDuration: 200 });
  } catch {
    // Splash plugin missing or not bundled in this build — ignore.
  }
}
