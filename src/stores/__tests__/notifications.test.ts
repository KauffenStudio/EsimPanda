import { describe, it, expect } from 'vitest';
import { useNotificationStore } from '../notifications';

describe('useNotificationStore', () => {
  it('should default expiryAlerts to true', () => {
    expect(useNotificationStore.getState().expiryAlerts).toBe(true);
  });

  it('should default usageAlerts to true', () => {
    expect(useNotificationStore.getState().usageAlerts).toBe(true);
  });

  it('should default promotions to false', () => {
    expect(useNotificationStore.getState().promotions).toBe(false);
  });

  it('should default pushSubscribed to false', () => {
    expect(useNotificationStore.getState().pushSubscribed).toBe(false);
  });

  it('should default dismissedAt to null', () => {
    expect(useNotificationStore.getState().dismissedAt).toBeNull();
  });
});
