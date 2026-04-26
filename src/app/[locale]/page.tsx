'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { BambuVideo } from '@/components/bambu/bambu-video';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="min-h-[calc(100dvh-5rem)] flex items-center px-4">
      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-12 md:gap-16 items-center py-12">
        {/* Left — Text content */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="flex flex-col items-start"
        >
          {/* Eyebrow tag */}
          <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-semibold bg-accent-soft dark:bg-accent-soft-dark text-accent mb-6">
            Student eSIM Plans
          </span>

          <h1 className="text-4xl md:text-6xl font-bold text-primary dark:text-gray-100 tracking-tighter leading-[1.05]">
            {t('landing.headline')}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mt-5 max-w-[50ch]">
            Affordable eSIM data plans for students and travelers across Europe. Browse, tap, scan — connected in 2 minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link href={`/${locale}/browse`}>
              <Button variant="primary" size="lg">
                {t('landing.cta_primary')}
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link href={`/${locale}/browse`}>
              <Button variant="secondary" size="lg">
                {t('landing.cta_secondary')}
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Right — Bambu mascot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="flex justify-center md:justify-end"
        >
          <div className="relative">
            {/* Soft glow behind mascot */}
            <div className="absolute inset-0 bg-accent/10 dark:bg-accent/5 rounded-full blur-3xl scale-150" />
            <BambuVideo variant="welcome" size={220} className="relative z-10" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
