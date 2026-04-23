import { describe, it, expect } from 'vitest';
import { SETUP_GUIDES } from '../setup-guides';

describe('SETUP_GUIDES', () => {
  const requiredKeys = ['ios', 'samsung', 'pixel', 'android-other'];

  it('has all four required device family keys', () => {
    for (const key of requiredKeys) {
      expect(SETUP_GUIDES).toHaveProperty(key);
    }
  });

  it.each(requiredKeys)('%s guide has 4 or more steps', (key) => {
    expect(SETUP_GUIDES[key].steps.length).toBeGreaterThanOrEqual(4);
  });

  it.each(requiredKeys)('%s guide contains a Data Roaming step', (key) => {
    const hasDataRoaming = SETUP_GUIDES[key].steps.some(
      (step) => /data roaming|roaming/i.test(step.description)
    );
    expect(hasDataRoaming).toBe(true);
  });
});
