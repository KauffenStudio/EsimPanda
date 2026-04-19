import { describe, it, expect } from 'vitest';
import { createProvider } from '../provider';

describe('createProvider', () => {
  it('returns an object with all 5 ESIMProvider methods', () => {
    const provider = createProvider();
    expect(typeof provider.listDestinations).toBe('function');
    expect(typeof provider.listPackages).toBe('function');
    expect(typeof provider.purchase).toBe('function');
    expect(typeof provider.getStatus).toBe('function');
    expect(typeof provider.topUp).toBe('function');
  });

  it('returns a CelitechAdapter instance', () => {
    const provider = createProvider();
    expect(provider).toBeDefined();
    expect(provider.constructor.name).toBe('CelitechAdapter');
  });
});
