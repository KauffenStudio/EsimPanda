/**
 * Tiny helper to know whether we're running inside the native iOS / Android
 * Capacitor shell, or just in a regular browser tab. All native plugin calls
 * should be guarded by `isNative()` so the same Next.js bundle keeps working
 * on the web (where the Capacitor runtime is absent).
 */

import { Capacitor } from '@capacitor/core';

export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export function nativePlatform(): 'ios' | 'android' | 'web' {
  const p = Capacitor.getPlatform();
  if (p === 'ios' || p === 'android') return p;
  return 'web';
}
