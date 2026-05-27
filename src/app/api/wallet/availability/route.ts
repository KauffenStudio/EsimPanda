import { NextResponse } from 'next/server';
import { walletCertificatesConfigured } from '@/lib/wallet/pass-builder';

export async function GET() {
  return NextResponse.json({ available: walletCertificatesConfigured() });
}
