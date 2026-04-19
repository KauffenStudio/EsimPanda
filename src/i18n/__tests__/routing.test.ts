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

  it('should only have EN locale for Phase 1', () => {
    expect(routing.locales).toHaveLength(1);
  });
});
