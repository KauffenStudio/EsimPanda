import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationPrefs {
  expiryAlerts: boolean;
  usageAlerts: boolean;
  promotions: boolean;
  pushSubscribed: boolean;
  dismissedAt: number | null; // timestamp of "Not now" dismissal
  setExpiryAlerts: (v: boolean) => void;
  setUsageAlerts: (v: boolean) => void;
  setPromotions: (v: boolean) => void;
  setPushSubscribed: (v: boolean) => void;
  setDismissedAt: (v: number | null) => void;
}

export const useNotificationStore = create<NotificationPrefs>()(
  persist(
    (set) => ({
      expiryAlerts: true,
      usageAlerts: true,
      promotions: false,
      pushSubscribed: false,
      dismissedAt: null,
      setExpiryAlerts: (v) => set({ expiryAlerts: v }),
      setUsageAlerts: (v) => set({ usageAlerts: v }),
      setPromotions: (v) => set({ promotions: v }),
      setPushSubscribed: (v) => set({ pushSubscribed: v }),
      setDismissedAt: (v) => set({ dismissedAt: v }),
    }),
    { name: 'esim-panda-notifications' }
  )
);
