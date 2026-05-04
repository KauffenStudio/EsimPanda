import { describe, it, expect } from 'vitest';
import { routing } from '../routing';

describe('i18n routing config', () => {
  it('should have locales and defaultLocale properties', () => {
    expect(routing).toHaveProperty('locales');
    expect(routing).toHaveProperty('defaultLocale');
  });

  it('should contain "en" in locales', () => {
    expect(routing.locales).toContain('en');
  });

  it('should have "en" as default locale', () => {
    expect(routing.defaultLocale).toBe('en');
  });

  it('ships supported locales (en, pt, es, fr, zh, ja)', () => {
    expect(routing.locales).toEqual(
      expect.arrayContaining(['en', 'pt', 'es', 'fr', 'zh', 'ja']),
    );
  });
});
