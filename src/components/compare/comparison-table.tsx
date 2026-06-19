import { Check } from 'lucide-react';
import type { CompareLocale, CompareRow } from '@/lib/seo/comparisons';

export function ComparisonTable({
  locale,
  competitor,
  rows,
  price,
}: {
  locale: CompareLocale;
  competitor: string;
  rows: CompareRow[];
  price: string;
}) {
  const featureLabel = locale === 'pt' ? 'Característica' : 'Feature';

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="text-left py-3 pr-3 font-medium text-gray-500 dark:text-gray-400">
              {featureLabel}
            </th>
            <th className="py-3 px-3 text-center rounded-t-card bg-accent-soft dark:bg-accent-soft-dark text-accent font-bold">
              eSIM Panda
            </th>
            <th className="py-3 px-3 text-center font-semibold text-gray-700 dark:text-gray-300">
              {competitor}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const pandaValue = row.panda[locale].replace('{price}', price);
            return (
              <tr key={i} className="border-t border-border dark:border-border-dark">
                <td className="py-3 pr-3 text-gray-600 dark:text-gray-400">{row.feature[locale]}</td>
                <td
                  className={`py-3 px-3 text-center bg-accent-soft/60 dark:bg-accent-soft-dark/40 font-semibold text-primary dark:text-gray-100 ${
                    i === rows.length - 1 ? 'rounded-b-card' : ''
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5 justify-center">
                    {row.highlight && (
                      <Check size={15} className="text-accent shrink-0" aria-hidden="true" />
                    )}
                    {pandaValue}
                  </span>
                </td>
                <td className="py-3 px-3 text-center text-gray-600 dark:text-gray-400">
                  {row.them[locale]}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
