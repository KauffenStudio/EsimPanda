'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const t = useTranslations('pwa');
  const [isOffline, setIsOffline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showSyncComplete, setShowSyncComplete] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOffline = () => {
      setIsOffline(true);
      setShowSyncComplete(false);
    };

    const handleOnline = async () => {
      setIsOffline(false);

      // Auto-sync: send REFRESH_CACHE to service worker
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          reg.active?.postMessage({ type: 'REFRESH_CACHE' });
          setLastUpdated(new Date());

          // Show brief sync complete confirmation
          setShowSyncComplete(true);
          setTimeout(() => setShowSyncComplete(false), 3000);
        } catch {
          // Silently fail if SW not available
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${Math.floor(diffMin / 60)}h ago`;
  };

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          key="offline"
          className="fixed top-14 left-0 right-0 z-40 flex items-center justify-center gap-2 px-4 h-9 bg-[#FFF3E0] dark:bg-[#2A1F00] text-[#E65100] dark:text-[#FFB74D] text-sm"
          initial={{ y: -36 }}
          animate={{ y: 0 }}
          exit={{ y: -36 }}
          transition={{ duration: 0.3 }}
        >
          <WifiOff size={16} />
          <span>{t('offline_message')}</span>
          {lastUpdated && (
            <span className="text-xs ml-2 opacity-75">
              {t('offline_last_updated', { time: formatLastUpdated(lastUpdated) })}
            </span>
          )}
        </motion.div>
      )}

      {showSyncComplete && !isOffline && (
        <motion.div
          key="sync-complete"
          className="fixed top-14 left-0 right-0 z-40 flex items-center justify-center gap-2 px-4 h-9 bg-green-50 dark:bg-[#0A2A0A] text-green-600 dark:text-green-400 text-sm"
          initial={{ y: -36 }}
          animate={{ y: 0 }}
          exit={{ y: -36 }}
          transition={{ duration: 0.3 }}
        >
          <span>{t('sync_complete')}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
