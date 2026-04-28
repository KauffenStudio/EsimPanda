'use client';

import { motion } from 'motion/react';
import { Home, Globe, Smartphone, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/layout/language-switcher';

const tabs = [
  { path: '', labelKey: 'nav.home', icon: Home },
  { path: '/browse', labelKey: 'nav.destinations', icon: Globe },
  { path: '/dashboard', labelKey: 'nav.esims', icon: Smartphone },
  { path: '/profile', labelKey: 'nav.profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();

  const handleTap = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <nav className="fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-3 right-3 z-50 md:hidden">
      <div className="flex h-14 rounded-full bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border border-border dark:border-border-dark shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
        {tabs.map((tab) => {
          const href = `/${locale}${tab.path}`;
          const isActive = tab.path === ''
            ? pathname === `/${locale}` || pathname === `/${locale}/`
            : pathname.startsWith(`/${locale}${tab.path}`);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.path}
              href={href}
              onClick={handleTap}
              className="relative flex flex-1 flex-col items-center justify-center min-h-[48px] gap-0.5"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-1.5 bg-accent/10 dark:bg-accent/15 rounded-full"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
              <Icon
                size={20}
                className={
                  isActive
                    ? 'text-accent relative z-10'
                    : 'text-gray-400 dark:text-gray-600'
                }
              />
              <span
                className={`text-[10px] font-medium relative z-10 ${
                  isActive
                    ? 'text-accent'
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                {t(tab.labelKey)}
              </span>
            </Link>
          );
        })}
        <div className="flex items-center justify-center px-2">
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
