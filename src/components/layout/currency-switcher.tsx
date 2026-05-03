'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useCurrencyStore } from '@/stores/currency';
import { CURRENCIES } from '@/lib/currency/rates';
import type { CurrencyCode } from '@/lib/currency/rates';

export function CurrencySwitcher() {
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeCurrency = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (code: CurrencyCode) => {
    setCurrency(code);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 text-sm text-gray-500 hover:text-accent transition-colors"
        aria-label="Currency"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold w-3.5 text-center" aria-hidden="true">
          {activeCurrency.symbol}
        </span>
        <span className="text-xs font-medium">{currency}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="menu"
            className="absolute top-full mt-2 right-0 w-[220px] bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] overflow-hidden z-[70]"
          >
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                role="menuitem"
                onClick={() => handleSelect(c.code)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between ${
                  c.code === currency
                    ? 'text-accent font-medium'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span>
                  {c.symbol} {c.name}
                </span>
                <span className="text-xs text-gray-400">{c.code}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
