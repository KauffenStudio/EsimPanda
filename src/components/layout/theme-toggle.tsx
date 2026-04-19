'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/stores/theme';

export function ThemeToggle() {
  const { isDark, toggle } = useThemeStore();

  return (
    <motion.button
      onClick={toggle}
      className="p-2 rounded-button text-primary dark:text-gray-100 hover:bg-surface dark:hover:bg-surface-dark transition-colors"
      aria-label={isDark ? 'Light mode' : 'Dark mode'}
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'sun' : 'moon'}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 180, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="block"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
