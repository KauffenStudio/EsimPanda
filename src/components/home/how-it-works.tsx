import { getTranslations } from 'next-intl/server';

const STEPS = ['step1', 'step2', 'step3'] as const;

export async function HowItWorks() {
  const t = await getTranslations('landing.how');

  return (
    <section className="w-full max-w-[1100px] mx-auto px-4 mt-16 md:mt-28">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-center text-primary dark:text-gray-100">
        {t('title')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8">
        {STEPS.map((step, i) => (
          <div key={step} className="flex flex-col items-center text-center">
            <span className="flex items-center justify-center w-11 h-11 rounded-full bg-accent text-white font-bold text-lg">
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
