import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https' as const,
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https' as const,
        hostname: 'images.pexels.com',
      },
      {
        // Supabase Storage — destination card images live in the public
        // `destination-images` bucket on this project's storage host.
        protocol: 'https' as const,
        hostname: 'dgpzjtmsiggfcxmjmazg.supabase.co',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
