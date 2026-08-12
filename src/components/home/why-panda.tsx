import { getTranslations } from 'next-intl/server';

export async function WhyPanda() {
  const t = await getTranslations('landing.why');

  return (
    <section className="w-full max-w-[880px] mx-auto px-4 mt-16 md:mt-28">
      <div className="rounded-card bg-gradient-to-b from-accent-soft to-transparent dark:from-accent-soft-dark dark:to-transparent border border-border dark:border-border-dark px-6 py-10 md:px-12 md:py-14 text-center">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-primary dark:text-gray-100">
          {t('title')}
        </h2>
        <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-[60ch] mx-auto">
          {t('body')}
        </p>
      </div>
    </section>
  );
}
