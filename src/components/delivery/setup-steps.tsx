'use client';

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
}

export function SetupSteps({ deviceFamily }: SetupStepsProps) {
  const guide = SETUP_GUIDES[deviceFamily];
  if (!guide) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {guide.steps.map((step, index) => {
        const Icon = ICON_MAP[step.icon] || Settings;

        return (
          <div key={index} className="flex items-start gap-3">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-gray-400 dark:text-gray-600" />
                <span className="text-base font-bold dark:text-gray-100">{step.title}</span>
              </div>
              <p className="mt-0.5 text-base text-gray-600 dark:text-gray-400">{step.description}</p>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
