import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import '@/styles/globals.css';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { LegalFooter } from '@/components/layout/legal-footer';
import { PageTransition } from '@/components/layout/page-transition';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth/auth-provider';
import { PushManager } from '@/components/pwa/push-manager';
import { OfflineIndicator } from '@/components/pwa/offline-indicator';
import { SwRegister } from '@/components/pwa/sw-register';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { JsonLd } from '@/components/seo/json-ld';
import { buildOrganizationJsonLd, buildWebsiteJsonLd } from '@/lib/seo/structured-data';
import { ogLocale } from '@/lib/seo/meta-templates';
import { createClient } from '@/lib/supabase/server';
import { routing } from '@/i18n/routing';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://esimpanda.co';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Note: maximumScale intentionally omitted so users can pinch-zoom
  // (accessibility — and a signal Google's mobile audit checks for).
  viewportFit: 'cover',
  themeColor: '#2979FF',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    metadataBase: new URL(SITE_URL),
    // Sensible defaults; each page overrides title/description/alternates.
    title: {
      default: 'eSIM Panda — Affordable Travel eSIM Data Plans Worldwide',
      template: '%s | eSIM Panda',
    },
    description: 'Get connected with mobile data anywhere in the world.',
    applicationName: 'eSIM Panda',
    robots: { index: true, follow: true },
    openGraph: {
      siteName: 'eSIM Panda',
      type: 'website',
      locale: ogLocale(locale),
    },
    twitter: { card: 'summary_large_image' },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.png?v=2', type: 'image/png', sizes: '192x192' },
      ],
      apple: [{ url: '/apple-icon.png?v=2', type: 'image/png', sizes: '180x180' }],
      shortcut: ['/favicon.ico'],
    },
  };
}

const darkModeHydrationScript = `try {
  var stored = JSON.parse(localStorage.getItem('esim-panda-theme') || '{}');
  if (stored.state && stored.state.isDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  }
} catch (e) {}`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang={locale} className={outfit.variable}>
      <body className="font-sans antialiased bg-background dark:bg-background-dark text-primary dark:text-gray-100 transition-colors">
        <script dangerouslySetInnerHTML={{ __html: darkModeHydrationScript }} />
        <JsonLd data={buildOrganizationJsonLd()} />
        <JsonLd data={buildWebsiteJsonLd(locale)} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider initialUser={user}>
            <Header />
            <OfflineIndicator />
            <SwRegister />
            <main className="pt-20 pb-20 md:pb-0 min-h-screen dark:bg-background-dark">
              <PageTransition>{children}</PageTransition>
              <LegalFooter />
            </main>
            <BottomNav />
            <Toaster />
            <PushManager />
            <CartDrawer />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
