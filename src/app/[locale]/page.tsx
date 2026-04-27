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
    <div className="min-h-[calc(100dvh-5rem)] flex flex-col items-center justify-center px-4">
      {/* Walking panda — short centered walk */}
      <div className="w-full max-w-[1200px] relative overflow-hidden h-[450px] md:h-[500px] flex items-center justify-center">
        <div className="animate-walk-panda">
          <BambuVideo variant="hero-intro" size={520} raw className="md:w-[640px] md:h-[360px] w-[520px] h-[293px]" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className="flex flex-col items-center text-center mt-4"
      >
        {/* Eyebrow tag */}
        <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-semibold bg-accent-soft dark:bg-accent-soft-dark text-accent mb-5">
          {t('landing.eyebrow')}
        </span>

        <h1 className="text-4xl md:text-6xl font-bold text-primary dark:text-gray-100 tracking-tighter leading-[1.05] max-w-[14ch]">
          {t('landing.headline')}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mt-5 max-w-[50ch]">
          {t('landing.subtitle')}
          <br />
          {t('landing.subtitle2')}
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
    </div>
  );
}
