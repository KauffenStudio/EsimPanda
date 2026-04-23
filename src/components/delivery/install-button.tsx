'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

interface InstallButtonProps {
  href: string;
}

export function InstallButton({ href }: InstallButtonProps) {
  const t = useTranslations('delivery');

  const handleClick = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
    >
      <a
        href={href}
        onClick={handleClick}
        className="flex h-14 w-full items-center justify-center rounded-lg bg-accent text-lg font-semibold text-white transition-colors duration-150 hover:bg-accent-hover active:scale-[0.97]"
      >
        {t('install')}
      </a>
    </motion.div>
  );
}
