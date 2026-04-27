'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { X, Percent, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'signup-incentive-dismissed';
const DELAY_MS = 3000;
const DISMISS_DAYS = 7;

export function SignupIncentiveModal() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    if (user) return;

    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }

    const timer = setTimeout(() => setIsOpen(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, [initialized, user]);

  const dismiss = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  };

  const goToSignup = () => {
    dismiss();
    router.push(`/${locale}/signup`);
  };

  const goToLogin = () => {
    dismiss();
    router.push(`/${locale}/login`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[61] mx-auto max-w-[400px] rounded-[var(--radius-card)] bg-white dark:bg-surface-dark border border-border dark:border-border-dark shadow-card-hover dark:shadow-card-hover-dark p-6"
          >
            {/* Close button */}
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-surface dark:hover:bg-white/5 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Content */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-accent/10 dark:bg-accent/15 flex items-center justify-center mb-4">
                <Percent size={28} className="text-accent" />
              </div>

              <h2 className="text-xl font-bold text-primary dark:text-gray-100 tracking-tight">
                {t('incentive.heading')}
              </h2>

              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 max-w-[280px]">
                {t('incentive.body')}
              </p>

              <div className="flex flex-col gap-2.5 w-full mt-6">
                <Button variant="primary" size="lg" onClick={goToSignup} className="w-full">
                  <UserPlus size={18} className="mr-2" />
                  {t('incentive.signup')}
                </Button>

                <Button variant="ghost" size="sm" onClick={goToLogin} className="w-full">
                  {t('incentive.login')}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
