import { setRequestLocale } from 'next-intl/server';
import { PrivacyEN } from '@/content/legal/privacy-en';
import { PrivacyPT } from '@/content/legal/privacy-pt';

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-primary dark:text-gray-100">
      {locale === 'pt' ? <PrivacyPT /> : <PrivacyEN />}
    </div>
  );
}
