import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const host = process.env.NEXT_PUBLIC_SITE_URL || 'https://esimpanda.co';
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${host}/sitemap.xml`,
  };
}
