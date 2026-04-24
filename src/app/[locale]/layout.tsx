import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { PageTransition } from '@/components/layout/page-transition';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth/auth-provider';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>
        <Header />
        <main className="pt-14 pb-20 md:pb-0 min-h-screen">
          <PageTransition>{children}</PageTransition>
        </main>
        <BottomNav />
        <Toaster />
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
