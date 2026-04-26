'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { BambuVideo } from '@/components/bambu/bambu-video';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallBanner() {
  const t = useTranslations('pwa');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed as standalone
    if (window.matchMedia?.('(display-mode: standalone)')?.matches) {
      setIsStandalone(true);
      return;
    }

    // Check if previously dismissed
    if (localStorage.getItem('esim-panda-install-dismissed')) {
      return;
    }

    // iOS detection
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      setIsIOS(true);
      setIsVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('esim-panda-install-dismissed', 'true');
    setIsVisible(false);
  };

  if (isStandalone || !isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="bg-accent-soft dark:bg-[#1A2744] rounded-card p-4 mt-6 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <BambuVideo variant="success" size={40} />
          </div>

          <div className="flex-1 text-left">
            <h3 className="text-base font-semibold dark:text-gray-100">
              {t('install_heading')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {isIOS ? t('install_ios') : t('install_body')}
            </p>
          </div>

          {!isIOS && (
            <button
              onClick={handleInstall}
              className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-button text-sm font-semibold whitespace-nowrap h-11 min-w-[44px]"
            >
              {t('install_cta')}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
