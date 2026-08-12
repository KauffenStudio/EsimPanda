import { getTranslations } from 'next-intl/server';

const STEPS = ['step1', 'step2', 'step3'] as const;

export async function HowItWorks() {
  const t = await getTranslations('landing.how');

  return (
    <section id="how-it-works" className="w-full max-w-[1100px] mx-auto px-4 mt-16 md:mt-28 scroll-mt-24">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-center text-primary dark:text-gray-100">
        {t('title')}
      </h2>
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8 mt-10">
        {/* Connecting rail behind the step badges (desktop) */}
        <div
          aria-hidden="true"
          className="hidden md:block absolute top-[22px] left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-border to-transparent dark:via-border-dark"
        />
        {STEPS.map((step, i) => (
          <div key={step} className="relative flex flex-col items-center text-center">
            <span className="flex items-center justify-center w-11 h-11 rounded-full bg-accent text-white font-bold text-lg shadow-[0_4px_12px_rgba(41,121,255,0.3)] ring-4 ring-background dark:ring-background-dark">
              {i + 1}
            </span>
            <h3 className="mt-4 font-semibold text-primary dark:text-gray-100">{t(`${step}.title`)}</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-[32ch]">
              {t(`${step}.desc`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
