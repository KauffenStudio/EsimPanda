'use client';

import { Lock, Shield, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function TrustSignals() {
  const t = useTranslations('checkout.trust');

  const items = [
    { Icon: Lock, label: t('secure') },
    { Icon: Shield, label: t('guarantee') },
    { Icon: Users, label: t('travelers') },
  ];

  return (
    <div className="mt-4 rounded-card border border-border dark:border-border-dark p-4">
      <ul className="flex flex-col gap-3">
        {items.map(({ Icon, label }) => (
          <li key={label} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <span className="flex items-center justify-center w-8 h-8 shrink-0 rounded-full bg-accent-soft dark:bg-accent-soft-dark text-accent">
              <Icon size={16} aria-hidden="true" />
            </span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
