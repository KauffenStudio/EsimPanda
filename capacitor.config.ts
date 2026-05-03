import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor configuration for the eSIM Panda iOS app.
 *
 * The bundle id matches the existing Bubblewrap-generated Android TWA
 * (co.esimpanda.app), so the two stores can share the same brand
 * identifier. The webDir is irrelevant in the chosen "remote URL"
 * strategy — the app loads esimpanda.co directly inside the WKWebView
 * shell, which mirrors how the Android TWA works today.
 *
 * The `server` block (with cleartext: false) means the app will only
 * load https URLs and rejects mixed content, satisfying ATS by default.
 */
const config: CapacitorConfig = {
  appId: 'co.esimpanda.app',
  appName: 'eSIM Panda',
  webDir: 'public',
  server: {
    url: 'https://esimpanda.co',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    limitsNavigationsToAppBoundDomains: true,
    scheme: 'esimpanda',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
