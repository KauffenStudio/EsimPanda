'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { deleteAccount } from '@/lib/auth/delete-account';

interface DeleteAccountSectionProps {
  email: string;
}

export function DeleteAccountSection({ email }: DeleteAccountSectionProps) {
  const t = useTranslations('profile.deleteAccount');
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const matches = typed.trim().toLowerCase() === email.toLowerCase();

  function handleClose() {
    if (isPending) return;
    setOpen(false);
    setTyped('');
    setError(null);
  }

  function handleConfirm() {
    if (!matches || isPending) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteAccount();
      // The action redirects on success; if we get here at all, it failed.
      if (result && result.ok === false) {
        setError(t('error'));
      }
    });
  }

  return (
    <section className="w-full max-w-md">
      <div className="rounded-xl border border-destructive/40 dark:border-destructive-dark/40 bg-white dark:bg-surface-dark p-4">
        <h2 className="text-sm font-semibold text-primary dark:text-gray-100 mb-2">
          {t('section')}
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          {t('description')}
        </p>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setOpen(true)}
          className="w-full"
        >
          <Trash2 size={16} className="mr-2" />
          {t('button')}
        </Button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={handleClose}
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-account-title"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(420px,calc(100vw-2rem))] rounded-xl bg-white dark:bg-surface-dark border border-border dark:border-border-dark shadow-2xl p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <h3
                  id="delete-account-title"
                  className="text-lg font-bold text-primary dark:text-gray-100"
                >
                  {t('modalTitle')}
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={t('cancel')}
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {t('modalBody')}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {email}
              </p>

              <Input
                type="email"
                autoComplete="off"
                autoFocus
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                label={t('emailLabel')}
                disabled={isPending}
                className="mb-4"
              />

              {error && (
                <p className="text-sm text-[#E53935] mb-3" role="alert">
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  {t('cancel')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleConfirm}
                  disabled={!matches || isPending}
                >
                  {isPending ? t('deleting') : t('confirm')}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
