import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { PageTransition } from '@/components/layout/page-transition';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth/auth-provider';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { OfflineIndicator } from '@/components/pwa/offline-indicator';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>
        <Header />
        <OfflineIndicator />
        <main className="pt-14 pb-20 md:pb-0 min-h-screen">
          <PageTransition>{children}</PageTransition>
        </main>
        <BottomNav />
        <Toaster />
        <WhatsAppButton />
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
