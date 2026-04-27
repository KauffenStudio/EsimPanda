'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCheckoutStore } from '@/stores/checkout';
import type { MockPlan } from '@/lib/mock-data/plans';

interface StickyOrderBarProps {
  plan: MockPlan;
  observeRef: React.RefObject<HTMLDivElement | null>;
}

function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function StickyOrderBar({ plan, observeRef }: StickyOrderBarProps) {
  const [show, setShow] = useState(false);
  const total_cents = useCheckoutStore((s) => s.total_cents);
  const subtotal_cents = useCheckoutStore((s) => s.subtotal_cents);
  const displayTotal = total_cents || subtotal_cents || plan.retail_price_cents;

  useEffect(() => {
    const target = observeRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShow(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [observeRef]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-100 dark:border-border-dark px-4 py-2 md:hidden"
        >
          <div className="flex items-center justify-between max-w-[480px] mx-auto">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              {plan.name}
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {formatUsd(displayTotal)}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
