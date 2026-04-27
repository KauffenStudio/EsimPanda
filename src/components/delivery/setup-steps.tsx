'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Settings, Signal, Plus, QrCode, Check, Globe } from 'lucide-react';
import { SETUP_GUIDES } from '@/data/setup-guides';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Settings,
  Signal,
  Plus,
  QrCode,
  Check,
  Globe,
};

interface SetupStepsProps {
  deviceFamily: string;
  orderId?: string | null;
  onAllComplete?: () => void;
}

export function SetupSteps({ deviceFamily, orderId, onAllComplete }: SetupStepsProps) {
  const guide = SETUP_GUIDES[deviceFamily];

  // Completion checkboxes — persisted per order in localStorage
  const storageKey = orderId ? `esim-setup-${orderId}-${deviceFamily}` : null;
  const [checked, setChecked] = useState<Set<number>>(() => {
    if (!storageKey || typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? new Set(JSON.parse(saved) as number[]) : new Set();
    } catch {
      return new Set();
    }
  });

  if (!guide) return null;

  const toggleStep = (index: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      if (storageKey) {
        try { localStorage.setItem(storageKey, JSON.stringify([...next])); } catch { /* noop */ }
      }
      if (next.size === guide.steps.length && onAllComplete) {
        onAllComplete();
      }
      return next;
    });
  };

  const allDone = checked.size === guide.steps.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {guide.steps.map((step, index) => {
        const Icon = ICON_MAP[step.icon] || Settings;
        const isChecked = checked.has(index);

        return (
          <div key={index} className="flex items-start gap-3">
            {/* Checkbox */}
            <button
              type="button"
              onClick={() => toggleStep(index)}
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                isChecked
                  ? 'bg-success text-white dark:bg-success-dark'
                  : 'bg-accent text-white'
              }`}
            >
              {isChecked ? <Check size={14} /> : index + 1}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-gray-400 dark:text-gray-600" />
                <span className={`text-base font-bold dark:text-gray-100 ${isChecked ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                  {step.title}
                </span>
              </div>
              <p className={`mt-0.5 text-base text-gray-600 dark:text-gray-400 ${isChecked ? 'line-through opacity-60' : ''}`}>
                {step.description}
              </p>
              {/* Optional illustration */}
              {step.image_url && !isChecked && (
                <div className="mt-2 rounded-lg overflow-hidden bg-gray-50 dark:bg-background-dark border border-gray-100 dark:border-border-dark">
                  <Image
                    src={step.image_url}
                    alt={step.title}
                    width={280}
                    height={160}
                    className="w-full h-auto object-contain"
                    unoptimized
                    onError={(e) => {
                      // Hide image if it doesn't exist yet
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* All steps complete message */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-success/10 dark:bg-success-dark/10 border border-success/20 dark:border-success-dark/20 p-3 text-center"
        >
          <p className="text-sm font-semibold text-success dark:text-success-dark">
            Your eSIM is ready to use! Enable it when you arrive at your destination.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
