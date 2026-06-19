import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { listActiveDestinations } from '@/lib/db/destinations';

const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://esimpanda.co';

// Build the hreflang map for a path, including x-default (points at the
// default locale) so Google has an explicit fallback for unmatched languages.
function languagesFor(path: string): Record<string, string> {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((locale) => [locale, `${host}/${locale}${path}`])
  );
  languages['x-default'] = `${host}/${routing.defaultLocale}${path}`;
  return languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const destinations = await listActiveDestinations();

  const destinationEntries: MetadataRoute.Sitemap = destinations.map((dest) => ({
    url: `${host}/${routing.defaultLocale}/esim/${dest.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
    alternates: { languages: languagesFor(`/esim/${dest.slug}`) },
  }));

  const staticPages: MetadataRoute.Sitemap = ['', '/browse'].map((path) => ({
    url: `${host}/${routing.defaultLocale}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: path === '' ? 1.0 : 0.7,
    alternates: { languages: languagesFor(path) },
  }));

  return [...staticPages, ...destinationEntries];
}
