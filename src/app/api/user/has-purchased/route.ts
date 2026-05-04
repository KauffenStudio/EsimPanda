import { NextResponse } from 'next/server';
import { IS_MOCK } from '@/lib/config/mode';
import { mockPurchases } from '@/lib/mock-data/dashboard';
import { requireAuth } from '@/lib/auth/api-guard';
import { getOrdersByUser } from '@/lib/db/orders';

export async function GET() {
  if (IS_MOCK) {
    return NextResponse.json({ has_purchased: mockPurchases.length > 0 });
  }

  const { user, response } = await requireAuth();
  if (response) return NextResponse.json({ has_purchased: false });

  try {
    const orders = await getOrdersByUser(user!.id);
    const completed = orders.some(
      (o) => o.status === 'delivered' || o.status === 'active' || o.status === 'expired',
    );
    return NextResponse.json({ has_purchased: completed });
  } catch (error) {
    console.error('has-purchased GET error:', error);
    return NextResponse.json({ has_purchased: false });
  }
}
