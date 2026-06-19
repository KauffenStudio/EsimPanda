import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://esimpanda.co';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep transactional / private / auth routes out of the index so crawl
      // budget goes to indexable marketing + destination pages. Patterns use a
      // wildcard for the locale segment (e.g. /en/checkout, /pt/dashboard).
      disallow: [
        '/api/',
        '/r/',
        '/*/checkout',
        '/*/dashboard',
        '/*/profile',
        '/*/login',
        '/*/signup',
        '/*/forgot-password',
        '/*/reset-password',
        '/*/admin',
      ],
    },
    sitemap: `${host}/sitemap.xml`,
    host,
  };
}
