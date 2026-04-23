export type DeviceFamily = 'ios' | 'samsung' | 'pixel' | 'android-other' | 'desktop';

export function detectDeviceFamily(userAgent: string): DeviceFamily {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad/.test(ua)) return 'ios';
  if (/samsung/.test(ua)) return 'samsung';
  if (/pixel/.test(ua)) return 'pixel';
  if (/android/.test(ua)) return 'android-other';
  return 'desktop';
}

export function isMobile(userAgent: string): boolean {
  return /android|iphone|ipad|mobile/i.test(userAgent);
}
