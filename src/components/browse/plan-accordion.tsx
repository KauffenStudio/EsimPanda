'use client';

import { type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface PlanAccordionProps {
  isOpen: boolean;
  children: ReactNode;
}

export function PlanAccordion({ isOpen, children }: PlanAccordionProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
