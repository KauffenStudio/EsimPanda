import { describe, it, expect } from 'vitest';
import manifest from '../manifest';

describe('manifest', () => {
  const m = manifest();

  it('returns correct app name', () => {
    expect(m.name).toBe('eSIM Panda');
  });

  it('returns correct short name', () => {
    expect(m.short_name).toBe('eSIM Panda');
  });

  it('uses standalone display mode', () => {
    expect(m.display).toBe('standalone');
  });

  it('uses correct theme color', () => {
    expect(m.theme_color).toBe('#2979FF');
  });

  it('includes 192x192 icon', () => {
    const icon192 = m.icons?.find((i) =>
      typeof i === 'object' && 'sizes' in i && i.sizes === '192x192'
    );
    expect(icon192).toBeDefined();
  });

  it('includes 512x512 icon', () => {
    const icon512 = m.icons?.find((i) =>
      typeof i === 'object' && 'sizes' in i && i.sizes === '512x512'
    );
    expect(icon512).toBeDefined();
  });
});
