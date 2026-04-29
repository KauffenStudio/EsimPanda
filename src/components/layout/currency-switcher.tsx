'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { DollarSign, X } from 'lucide-react';
import { useCurrencyStore } from '@/stores/currency';
import { CURRENCIES } from '@/lib/currency/rates';
import type { CurrencyCode } from '@/lib/currency/rates';

export function CurrencySwitcher() {
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click (desktop)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: CurrencyCode) => {
    setCurrency(code);
    setIsOpen(false);
  };

  const currencyOptions = CURRENCIES.map((c) => (
    <button
      key={c.code}
      onClick={() => handleSelect(c.code)}
      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between ${
        c.code === currency ? 'text-accent font-medium' : 'text-gray-700 dark:text-gray-300'
      }`}
    >
      <span>{c.symbol} {c.name}</span>
      <span className="text-xs text-gray-400">{c.code}</span>
    </button>
  ));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 text-sm text-gray-500 hover:text-accent transition-colors"
        aria-label="Currency"
      >
        <DollarSign size={14} />
        <span className="text-xs font-medium">{currency}</span>
      </button>

      {/* Desktop dropdown */}
      {isOpen && (
        <div className="hidden md:block absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[220px] bg-white dark:bg-background-dark border border-border dark:border-border-dark rounded-lg shadow-lg z-[60]">
          {currencyOptions}
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
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Currency</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
              <div className="py-1">
                {currencyOptions}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
