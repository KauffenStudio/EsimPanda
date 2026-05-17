import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'help' });
  return { title: t('metaTitle'), description: t('metaDescription') };
}

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'] as const;

export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('help');

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-primary dark:text-gray-100">
      <article className="space-y-6 leading-relaxed">
        <h1 className="text-3xl font-bold pb-4 border-b border-border dark:border-border-dark">
          {t('title')}
        </h1>

        <div className="space-y-6">
          {FAQ_KEYS.map((q) => (
            <details key={q} className="border-b border-border dark:border-border-dark pb-4">
              <summary className="text-lg md:text-xl font-semibold py-2 cursor-pointer">
                {t(`faq.${q}.question`)}
              </summary>
              <p className="text-base font-normal leading-relaxed mt-2">
                {t(`faq.${q}.answer`)}
              </p>
            </details>
          ))}
        </div>

        <div className="space-y-2 pt-2">
          <h2 className="text-lg font-semibold">{t('contactHeading')}</h2>
          <p className="text-base font-normal leading-relaxed">{t('contactBody')}</p>
          <p>
            <a
              href="mailto:geral@kauffen.com"
              className="text-accent hover:underline py-2 inline-block"
            >
              {t('contactCta')}
            </a>
          </p>
        </div>
      </article>
    </div>
  );
}
