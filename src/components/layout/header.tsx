'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ThemeToggle } from './theme-toggle';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { UserMenu } from '@/components/auth/user-menu';

const navLinks = [
  { path: '', label: 'Home' },
  { path: '/browse', label: 'Destinations' },
  { path: '/dashboard', label: 'My eSIMs' },
  { path: '/profile', label: 'Profile' },
];

export function Header() {
  const locale = useLocale();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-white dark:bg-background-dark border-b border-border dark:border-border-dark">
      <div className="flex items-center justify-between h-full px-4 max-w-[1200px] mx-auto">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label="panda">
            🐼
          </span>
          <span className="font-bold text-primary dark:text-gray-100">
            eSIM Panda
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={`/${locale}${link.path}`}
              className="text-base text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-gray-100 transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User menu + Theme toggle */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <UserMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
