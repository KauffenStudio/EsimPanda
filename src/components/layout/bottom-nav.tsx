'use client';

import { motion } from 'motion/react';
import { Home, Globe, Smartphone, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const tabs = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/browse', label: 'Destinations', icon: Globe },
  { href: '/dashboard', label: 'My eSIMs', icon: Smartphone },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  const handleTap = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-background-dark border-t border-border dark:border-border-dark">
      <div className="flex h-16 pb-4">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={handleTap}
              className="relative flex flex-1 flex-col items-center justify-center min-h-[48px] gap-0.5"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full"
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }}
                />
              )}
              <Icon
                size={22}
                className={
                  isActive
                    ? 'text-accent'
                    : 'text-gray-400 dark:text-gray-600'
                }
              />
              <span
                className={`text-xs ${
                  isActive
                    ? 'text-accent'
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
