import { NextResponse } from 'next/server';
import { createProvider } from '@/lib/esim/provider';
import { mockTopUpPackages } from '@/lib/mock-data/dashboard';

const isMockMode = () => process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true';

// Markup multiplier over wholesale price
const RETAIL_MARKUP = 1.8;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get('destination');

  if (!destination) {
    return NextResponse.json(
      { error: 'Missing destination parameter' },
      { status: 400 },
    );
  }

  // Mock mode: return static packages
  if (isMockMode()) {
    return NextResponse.json({ packages: mockTopUpPackages });
  }

  try {
    const provider = createProvider();
    const packages = await provider.listPackages(destination);

    // Transform to top-up package format with retail pricing
    const topUpPackages = packages.map((pkg) => ({
      id: pkg.id,
      name: `${pkg.dataGB}GB / ${pkg.durationDays} days`,
      data_gb: pkg.dataGB,
      duration_days: pkg.durationDays,
      price_cents: Math.round(pkg.wholesalePriceCents * RETAIL_MARKUP),
      currency: pkg.currency,
    }));

    return NextResponse.json({ packages: topUpPackages });
  } catch (error) {
    console.error('Failed to fetch top-up packages:', error);
    // Fallback to mock data on API error
    return NextResponse.json({ packages: mockTopUpPackages });
  }
}
