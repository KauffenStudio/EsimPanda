'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Globe } from 'lucide-react';

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

  // Close on outside click
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

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-[200px] bg-white dark:bg-background-dark border border-border dark:border-border-dark rounded-lg shadow-lg overflow-hidden z-50 md:bottom-auto md:top-full md:mt-2">
          {Object.entries(localeNames).map(([code, name]) => (
            <button
              key={code}
              onClick={() => switchLocale(code)}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                code === locale ? 'text-accent font-medium' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
