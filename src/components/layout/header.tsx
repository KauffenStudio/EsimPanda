'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ThemeToggle } from './theme-toggle';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { CurrencySwitcher } from '@/components/layout/currency-switcher';
import { UserMenu } from '@/components/auth/user-menu';
import { CartIcon } from '@/components/cart/cart-icon';

const navLinks = [
  { path: '', labelKey: 'nav.home' },
  { path: '/browse', labelKey: 'nav.destinations' },
  { path: '/dashboard', labelKey: 'nav.esims' },
  { path: '/profile', labelKey: 'nav.profile' },
];

export function Header() {
  const locale = useLocale();
  const t = useTranslations();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
      <div className="flex items-center justify-between h-12 w-full max-w-[1200px] px-5 rounded-full bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border border-border dark:border-border-dark shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="text-lg" role="img" aria-label="panda">
            🐼
          </span>
          <span className="font-semibold text-primary dark:text-gray-100 tracking-tight">
            eSIM Panda
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={`/${locale}${link.path}`}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-gray-100 transition-colors duration-200 px-3 py-1.5 rounded-full hover:bg-surface dark:hover:bg-white/5"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        {/* User menu + Theme toggle */}
        <div className="flex items-center gap-1.5">
          <CurrencySwitcher />
          <LanguageSwitcher />
          <CartIcon />
          <UserMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
