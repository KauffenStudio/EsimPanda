import { describe, it, expect } from 'vitest';
import { detectDeviceFamily, isMobile } from '../device-detection';

describe('detectDeviceFamily', () => {
  it('returns ios for iPhone user agent', () => {
    expect(detectDeviceFamily('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe('ios');
  });

  it('returns ios for iPad user agent', () => {
    expect(detectDeviceFamily('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)')).toBe('ios');
  });

  it('returns samsung for Samsung Galaxy user agent', () => {
    expect(detectDeviceFamily('Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S918B)')).toBe('samsung');
  });

  it('returns pixel for Pixel user agent', () => {
    expect(detectDeviceFamily('Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro)')).toBe('pixel');
  });

  it('returns android-other for generic Android user agent', () => {
    expect(detectDeviceFamily('Mozilla/5.0 (Linux; Android 14; OnePlus 12)')).toBe('android-other');
  });

  it('returns desktop for Chrome desktop user agent', () => {
    expect(detectDeviceFamily('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0')).toBe('desktop');
  });
});

describe('isMobile', () => {
  it('returns true for mobile user agents', () => {
    expect(isMobile('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe(true);
    expect(isMobile('Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro)')).toBe(true);
  });

  it('returns false for desktop user agents', () => {
    expect(isMobile('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')).toBe(false);
  });
});
