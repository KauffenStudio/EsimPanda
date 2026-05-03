import { isNative } from './platform';

/**
 * Push notification registration for the native iOS / Android shell.
 *
 * On the web this is a no-op (Web Push lives elsewhere — see
 * src/components/pwa/push-manager.tsx). On native, asks permission,
 * registers with APNs / FCM, and ships the device token to the
 * backend so server-side jobs can target this device.
 */
export async function registerNativePush(): Promise<void> {
  if (!isNative()) return;

  const { PushNotifications } = await import('@capacitor/push-notifications');

  const permission = await PushNotifications.checkPermissions();
  let allowed = permission.receive === 'granted';

  if (permission.receive === 'prompt' || permission.receive === 'prompt-with-rationale') {
    const result = await PushNotifications.requestPermissions();
    allowed = result.receive === 'granted';
  }

  if (!allowed) return;

  await PushNotifications.register();

  PushNotifications.addListener('registration', async (token) => {
    try {
      await fetch('/api/push/register-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.value,
          platform: 'ios',
        }),
      });
    } catch {
      // Best-effort: server registration failures shouldn't crash the app.
    }
  });

  PushNotifications.addListener('registrationError', (err) => {
    console.error('[push] registration error:', err);
  });
}
