import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { AboutSection } from '@/components/about/about-section';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isPt = locale === 'pt';
  return {
    title: isPt ? 'Sobre a eSIM Panda' : 'About eSIM Panda',
    description: isPt
      ? 'A eSIM Panda dá a viajantes dados móveis pré-pagos em mais de 100 destinos — sem roaming, preços justos e instalação em 2 minutos.'
      : 'eSIM Panda gives travelers prepaid mobile data in 100+ destinations — no roaming, fair pricing, and setup in about 2 minutes.',
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AboutSection locale={locale} />;
}
