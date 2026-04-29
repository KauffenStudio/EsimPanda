import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'pt', 'es', 'fr', 'zh', 'ja'],
  defaultLocale: 'en',
  localeDetection: true,
});
