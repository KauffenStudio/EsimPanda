import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { buildHomeMeta } from '@/lib/seo/meta-templates';
import { LandingClient } from '@/components/home/landing-client';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildHomeMeta(locale);
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LandingClient />;
}
