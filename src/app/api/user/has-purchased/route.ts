import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-guard';
import { getOrdersByUser } from '@/lib/db/orders';

// Always read real orders for the authenticated user. Returning a value
// from shared mock fixtures (under NEXT_PUBLIC_STRIPE_MOCK) would gate
// every real account by the mock fixture's purchase count.
export async function GET() {
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
