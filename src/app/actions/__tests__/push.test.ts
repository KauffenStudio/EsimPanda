import { describe, it, expect } from 'vitest';
import { subscribeUser, unsubscribeUser, sendTestNotification } from '../../../lib/push/actions';

describe('push actions', () => {
  it('should export subscribeUser function', () => {
    expect(typeof subscribeUser).toBe('function');
  });

  it('should export unsubscribeUser function', () => {
    expect(typeof unsubscribeUser).toBe('function');
  });

  it('should export sendTestNotification function', () => {
    expect(typeof sendTestNotification).toBe('function');
  });
});
