import { setRequestLocale } from 'next-intl/server';
import { TermsEN } from '@/content/legal/terms-en';
import { TermsPT } from '@/content/legal/terms-pt';

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-primary dark:text-gray-100">
      {locale === 'pt' ? <TermsPT /> : <TermsEN />}
    </div>
  );
}
