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
    <div className="flex flex-col items-center px-4 pt-6 md:pt-10">
      {/* Panda hero — video faded into page background */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        className="w-full flex items-center justify-center h-[220px] md:h-[300px]"
      >
        <div
          className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full overflow-hidden"
          style={{
            maskImage: 'radial-gradient(circle at center, black 35%, transparent 65%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 35%, transparent 65%)',
          }}
        >
          <BambuVideo
            variant="hero-panda"
            raw
            loop={false}
            className="w-full h-full"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className="flex flex-col items-center text-center mt-2"
      >
        {/* Eyebrow tag */}
        <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-semibold bg-accent-soft dark:bg-accent-soft-dark text-accent mb-5">
          {t('landing.eyebrow')}
        </span>

        <h1 className="text-3xl md:text-5xl font-bold text-primary dark:text-gray-100 tracking-tighter leading-[1.05] max-w-[14ch]">
          {t('landing.headline')}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg leading-relaxed mt-3 max-w-[50ch]">
          {t('landing.subtitle')}
          <br />
          {t('landing.subtitle2')}
        </p>

        <div className="flex flex-row gap-2 sm:gap-3 mt-6 w-full max-w-md px-2 sm:px-0">
          <Link href={`/${locale}/browse`} className="flex-1 min-w-0">
            <Button variant="primary" size="md" className="w-full sm:size-lg sm:px-8 sm:py-3.5 sm:text-lg">
              <span className="truncate">{t('landing.cta_primary')}</span>
              <ArrowRight size={16} className="ml-1.5 shrink-0" />
            </Button>
          </Link>
          <Link href={`/${locale}/browse`} className="flex-1 min-w-0">
            <Button variant="secondary" size="md" className="w-full sm:px-8 sm:py-3.5 sm:text-lg">
              <span className="truncate">{t('landing.cta_secondary')}</span>
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
