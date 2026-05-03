import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { LegalFooter } from '@/components/layout/legal-footer';
import { PageTransition } from '@/components/layout/page-transition';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth/auth-provider';
// import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { PushManager } from '@/components/pwa/push-manager';
import { OfflineIndicator } from '@/components/pwa/offline-indicator';
import { SplashScreen } from '@/components/pwa/splash-screen';
import { SignupIncentiveModal } from '@/components/auth/signup-incentive-modal';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { createClient } from '@/lib/supabase/server';
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider initialUser={user}>
        <Header />
        <OfflineIndicator />
        <main className="pt-20 pb-20 md:pb-0 min-h-screen dark:bg-background-dark">
          <PageTransition>{children}</PageTransition>
          <LegalFooter />
        </main>
        <BottomNav />
        <Toaster />
        {/* <WhatsAppButton /> */}
        <PushManager />
        <SplashScreen />
        <SignupIncentiveModal />
        <CartDrawer />
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
