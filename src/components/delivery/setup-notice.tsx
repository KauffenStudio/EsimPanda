'use client';

import { useTranslations } from 'next-intl';

/**
 * UX-critical info banner shown right under the QR / install button on the
 * delivery success page. Two pieces of information that customers MUST see
 * before they walk away from the page, or they end up in support tickets:
 *
 *  1. Data Roaming has to be turned ON for the new line, otherwise the eSIM
 *     installs but the phone refuses to connect to local networks.
 *  2. The carrier name on the line will be "Orange France" (Celitech's anchor
 *     carrier) even when travelling outside France. That is normal for
 *     travel eSIMs — without flagging it here, customers assume the wrong
 *     plan was sent.
 */
export function SetupNotice() {
  const t = useTranslations('delivery.setupNotice');

  return (
    <div
      role="note"
      className="rounded-lg border border-amber-200 dark:border-amber-700/40 bg-amber-50 dark:bg-amber-900/15 p-4"
    >
      <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
        {t('title')}
      </h3>
      <ol className="space-y-2 text-sm text-gray-800 dark:text-gray-200 list-decimal list-inside marker:font-semibold">
        <li>
          <span className="font-medium">{t('step1Title')}</span> — {t('step1Body')}
        </li>
        <li>
          <span className="font-medium">{t('step2Title')}</span> — {t('step2Body')}
        </li>
        <li>
          <span className="font-medium">{t('step3Title')}</span> — {t('step3Body')}
        </li>
      </ol>
      <p className="mt-3 text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
        {t('carrierNote')}
      </p>
    </div>
  );
}
