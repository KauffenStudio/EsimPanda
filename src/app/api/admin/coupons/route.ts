import { NextResponse } from 'next/server';
import { z } from 'zod/v4';
import {
  getMockInfluencerCoupons,
  addMockInfluencerCoupon,
  updateMockInfluencerCoupon,
} from '@/lib/referral/mock';
import { COUPONS } from '@/lib/checkout/coupons';
import { requireAdmin } from '@/lib/auth/api-guard';
import type { InfluencerCoupon } from '@/lib/referral/types';

const createSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(20)
    .transform((s) => s.toUpperCase()),
  influencer_name: z.string().min(1).max(100),
  social_url: z.url().or(z.literal('')),
  notes: z.string().max(500).default(''),
});

const patchSchema = z.object({
  code: z.string().min(1),
  is_active: z.boolean(),
});

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const coupons = getMockInfluencerCoupons();

  const summary = coupons.reduce(
    (acc, c) => ({
      active_count: acc.active_count + (c.is_active ? 1 : 0),
      total_uses: acc.total_uses + c.total_uses,
      total_revenue_cents: acc.total_revenue_cents + c.total_revenue_cents,
    }),
    { active_count: 0, total_uses: 0, total_revenue_cents: 0 },
  );

  return NextResponse.json({ coupons, summary });
}

export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const result = createSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.issues },
      { status: 400 },
    );
  }

  const validated = result.data;

  // Uniqueness check against static COUPONS and existing influencer coupons
  const staticCodes = COUPONS.map((c) => c.code.toUpperCase());
  const influencerCodes = getMockInfluencerCoupons().map((c) => c.code.toUpperCase());
  const allExistingCodes = [...staticCodes, ...influencerCodes];

  if (allExistingCodes.includes(validated.code)) {
    return NextResponse.json({ error: 'code_exists' }, { status: 409 });
  }

  const coupon: InfluencerCoupon = {
    code: validated.code,
    influencer_name: validated.influencer_name,
    social_url: validated.social_url,
    notes: validated.notes,
    discount_percent: 10,
    min_order_cents: 999,
    total_uses: 0,
    total_revenue_cents: 0,
    last_used: null,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  addMockInfluencerCoupon(coupon);

  return NextResponse.json({ coupon }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.issues },
      { status: 400 },
    );
  }

  updateMockInfluencerCoupon(result.data.code, { is_active: result.data.is_active });

  return NextResponse.json({ updated: true });
}
