import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { listActiveDestinations } from '@/lib/db/destinations';

const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://esimpanda.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const destinations = await listActiveDestinations();
  const locales = routing.locales;

  const destinationEntries: MetadataRoute.Sitemap = destinations.map((dest) => ({
    url: `${host}/en/esim/${dest.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [locale, `${host}/${locale}/esim/${dest.slug}`])
      ),
    },
  }));

  const staticPages: MetadataRoute.Sitemap = ['', '/browse'].map((path) => ({
    url: `${host}/en${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: path === '' ? 1.0 : 0.7,
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [locale, `${host}/${locale}${path}`])
      ),
    },
  }));

  return [...staticPages, ...destinationEntries];
}
