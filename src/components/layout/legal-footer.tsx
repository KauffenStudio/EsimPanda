import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { AppStoreBadges } from '@/components/marketing/app-store-badges';

export function LegalFooter() {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="mt-12 mb-24 md:mb-8 px-4 flex flex-col items-center gap-4 text-center text-xs text-gray-500 dark:text-gray-400">
      <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2">
        <Link href={`/${locale}/privacy`} className="hover:underline">
          {t('privacy')}
        </Link>
        <span aria-hidden="true">·</span>
        <Link href={`/${locale}/terms`} className="hover:underline">
          {t('terms')}
        </Link>
        <span aria-hidden="true">·</span>
        <span>{t('copyright')}</span>
      </nav>
      <div className="w-full max-w-[280px]">
        <AppStoreBadges compact />
      </div>
    </footer>
  );
}
