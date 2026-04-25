'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useAuthStore } from '@/stores/auth';
import { signOut } from '@/lib/auth/actions';
import { Button } from '@/components/ui/button';

export function UserMenu() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Loading state: placeholder to prevent layout shift
  if (loading) {
    return <div className="w-8 h-8" />;
  }

  // Logged-out state
  if (!user) {
    return (
      <Link href={`/${locale}/login`}>
        <Button variant="ghost" size="sm" className="text-sm font-normal">
          {t('header.login')}
        </Button>
      </Link>
    );
  }

  // Logged-in state
  const initial = (user.email ?? '?')[0].toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-[#2979FF] text-white text-sm font-semibold flex items-center justify-center hover:opacity-90 transition-opacity"
        aria-label="User menu"
      >
        {initial}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 top-10 w-[200px] bg-white dark:bg-surface-dark border border-[#E5E5E5] dark:border-border-dark rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] overflow-hidden z-50"
          >
            {/* Email */}
            <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 truncate">
              {user.email}
            </div>

            {/* Separator */}
            <div className="border-t border-[#E5E5E5] dark:border-border-dark" />

            {/* My eSIMs (disabled) */}
            <button
              type="button"
              disabled
              className="w-full h-10 px-4 text-left text-sm text-gray-400 cursor-not-allowed"
              title="Coming soon"
            >
              {t('menu.esims')}
            </button>

            {/* Settings (disabled) */}
            <button
              type="button"
              disabled
              className="w-full h-10 px-4 text-left text-sm text-gray-400 cursor-not-allowed"
              title="Coming soon"
            >
              {t('menu.settings')}
            </button>

            {/* Invite Friends */}
            <Link href={`/${locale}/referral`} onClick={() => setOpen(false)}>
              <button
                type="button"
                className="w-full h-10 px-4 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {t('menu.inviteFriends')}
              </button>
            </Link>

            {/* Separator */}
            <div className="border-t border-[#E5E5E5] dark:border-border-dark" />

            {/* Log out */}
            <button
              type="button"
              onClick={async () => {
                setOpen(false);
                await signOut();
              }}
              className="w-full h-10 px-4 text-left text-sm text-[#E53935] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {t('menu.logout')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
