import { describe, it, expect } from 'vitest';
import { useThemeStore } from '../theme';

describe('useThemeStore', () => {
  it('should default isDark to false', () => {
    const state = useThemeStore.getState();
    expect(state.isDark).toBe(false);
  });

  it('should export toggle function', () => {
    const state = useThemeStore.getState();
    expect(typeof state.toggle).toBe('function');
  });
});
