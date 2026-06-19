import { getTranslations } from 'next-intl/server';

export async function WhyPanda() {
  const t = await getTranslations('landing.why');

  return (
    <section className="w-full max-w-[760px] mx-auto px-4 mt-16 md:mt-28 text-center">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-primary dark:text-gray-100">
        {t('title')}
      </h2>
      <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
        {t('body')}
      </p>
    </section>
  );
}
