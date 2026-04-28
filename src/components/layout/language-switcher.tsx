'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Globe, X } from 'lucide-react';

const localeNames: Record<string, string> = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
  fr: 'Français',
  zh: '中文',
  ja: '日本語',
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click (desktop only)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  }

  const localeOptions = Object.entries(localeNames).map(([code, name]) => (
    <button
      key={code}
      onClick={() => switchLocale(code)}
      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
        code === locale ? 'text-accent font-medium' : 'text-gray-700 dark:text-gray-300'
      }`}
    >
      {name}
    </button>
  ));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 text-sm text-gray-500 hover:text-accent transition-colors"
        aria-label="Language"
      >
        <Globe size={16} />
        <span className="uppercase text-xs font-medium">{locale}</span>
      </button>

      {/* Desktop dropdown */}
      {isOpen && (
        <div className="hidden md:block absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[200px] bg-white dark:bg-background-dark border border-border dark:border-border-dark rounded-lg shadow-lg z-[60]">
          {localeOptions}
        </div>
      )}

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-[60] md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-[70] md:hidden bg-white dark:bg-surface-dark rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.15)] pb-[env(safe-area-inset-bottom)]"
            >
              <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100 dark:border-border-dark">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Language</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              <div className="py-1">
                {localeOptions}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
