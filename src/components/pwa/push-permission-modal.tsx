'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useNotificationStore } from '@/stores/notifications';
import { subscribeUser } from '@/lib/push/actions';
import { BambuVideo } from '@/components/bambu/bambu-video';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 604800000

export function PushPermissionModal() {
  const t = useTranslations('notifications');
  const {
    pushSubscribed,
    dismissedAt,
    setPushSubscribed,
    setDismissedAt,
  } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    // Only show in standalone/PWA mode
    if (!window.matchMedia?.('(display-mode: standalone)')?.matches) return;

    // Already subscribed
    if (pushSubscribed) return;

    // Already granted permission externally
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      setPushSubscribed(true);
      return;
    }

    // Recently dismissed (within 7 days)
    if (dismissedAt && Date.now() - dismissedAt < SEVEN_DAYS_MS) return;

    // Show modal after 2 second delay
    const timer = setTimeout(() => setIsOpen(true), 2000);
    return () => clearTimeout(timer);
  }, [pushSubscribed, dismissedAt, setPushSubscribed]);

  const handleAllow = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidKey) {
          console.warn('[PUSH] No VAPID public key configured');
          setPushSubscribed(true);
          setIsOpen(false);
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
        });

        const subJson = subscription.toJSON();
        await subscribeUser(subJson, ''); // email will be populated from auth context in production

        setPushSubscribed(true);
        setIsOpen(false);
      } else if (permission === 'denied') {
        setPermissionDenied(true);
      }
    } catch (err) {
      console.error('[PUSH] Subscription failed:', err);
    }
  };

  const handleDismiss = () => {
    setDismissedAt(Date.now());
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-overlay dark:bg-overlay-dark flex items-center justify-center"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="max-w-[360px] w-full mx-4 bg-background dark:bg-surface-dark rounded-card p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <BambuVideo variant="success" size={48} />
            </div>

            <h2 className="text-xl font-semibold dark:text-gray-100">
              {t('permission_heading')}
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {t('permission_body')}
            </p>

            {permissionDenied && (
              <p className="text-destructive dark:text-destructive-dark text-sm mt-3">
                {t('permission_denied')}
              </p>
            )}

            <button
              onClick={handleAllow}
              className="bg-accent text-white w-full h-11 rounded-button mt-4 font-semibold hover:opacity-90 transition-opacity"
            >
              {t('permission_allow')}
            </button>

            <button
              onClick={handleDismiss}
              className="text-sm text-gray-600 dark:text-gray-400 mt-3 bg-transparent border-none cursor-pointer"
            >
              {t('permission_dismiss')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
