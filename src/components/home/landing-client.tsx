'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { BambuVideo } from '@/components/bambu/bambu-video';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function LandingClient() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="flex flex-col items-center px-4 pt-6 md:pt-10">
      {/* Panda hero — video faded into page background over a branded aura */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        className="relative w-full flex items-center justify-center h-[220px] md:h-[300px]"
      >
        {/* Soft accent aura behind the panda — turns the mask falloff into intentional light */}
        <div
          aria-hidden="true"
          className="absolute w-[320px] h-[320px] md:w-[440px] md:h-[440px] rounded-full blur-2xl"
          style={{
            background:
              'radial-gradient(circle at center, rgba(41,121,255,0.14), rgba(41,121,255,0.04) 45%, transparent 70%)',
          }}
        />
        <div
          className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full overflow-hidden"
          style={{
            maskImage: 'radial-gradient(circle at center, black 30%, transparent 55%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 55%)',
          }}
        >
          <BambuVideo
            variant="hero-panda"
            raw
            loop={false}
            poster="/bambu/panda-face.png"
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

        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-6 w-full max-w-md">
          <Link href={`/${locale}/browse`} className="flex-1 min-w-0">
            <Button variant="primary" size="md" className="w-full sm:px-8 sm:py-3.5 sm:text-lg">
              {t('landing.cta_primary')}
              <ArrowRight size={16} className="ml-1.5 shrink-0" />
            </Button>
          </Link>
          <a href="#how-it-works" className="flex-1 min-w-0">
            <Button variant="secondary" size="md" className="w-full sm:px-8 sm:py-3.5 sm:text-lg">
              {t('landing.how.title')}
            </Button>
          </a>
        </div>

        <div className="flex items-center gap-2.5 mt-5">
          <div className="flex -space-x-2" aria-hidden="true">
            <span className="w-6 h-6 rounded-full border-2 border-white dark:border-background-dark bg-gradient-to-br from-[#FCAE4D] to-[#EF6F6C]" />
            <span className="w-6 h-6 rounded-full border-2 border-white dark:border-background-dark bg-gradient-to-br from-[#2979FF] to-[#1858C4]" />
            <span className="w-6 h-6 rounded-full border-2 border-white dark:border-background-dark bg-gradient-to-br from-[#2BB673] to-[#1E8C57]" />
            <span className="w-6 h-6 rounded-full border-2 border-white dark:border-background-dark bg-gradient-to-br from-[#8B5CF6] to-[#5B3FC4]" />
          </div>
          <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">
            {t('landing.socialProof')}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
