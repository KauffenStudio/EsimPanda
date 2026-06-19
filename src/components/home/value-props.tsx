import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/card';

const ITEMS = [
  { key: 'speed', emoji: '⚡' },
  { key: 'coverage', emoji: '🌍' },
  { key: 'keepNumber', emoji: '📲' },
  { key: 'noRoaming', emoji: '💸' },
] as const;

export async function ValueProps() {
  const t = await getTranslations('landing.valueProps');

  return (
    <section className="w-full max-w-[1100px] mx-auto px-4 mt-14 md:mt-24">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {ITEMS.map(({ key, emoji }) => (
          <Card key={key} variant="flat" className="p-5">
            <span className="text-2xl" role="img" aria-hidden="true">
              {emoji}
            </span>
            <h3 className="mt-3 font-semibold text-primary dark:text-gray-100">{t(`${key}.title`)}</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {t(`${key}.desc`)}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
