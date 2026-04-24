import { createClient } from '@/lib/supabase/server';
import { isMockMode } from '@/lib/auth/mock';

/**
 * After a guest creates an account, find all orders placed with that email
 * (where user_id is null) and assign them to the new user.
 */
export async function linkOrdersByEmail(email: string, userId: string): Promise<number> {
  if (isMockMode()) {
    console.log('[MOCK AUTH] Would link orders for:', email, 'to user:', userId);
    return 1; // Pretend 1 order was linked in mock mode
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ user_id: userId })
    .eq('email', email)
    .is('user_id', null)
    .select('id');

  if (error) {
    console.error('[AUTH] Failed to link orders:', error.message);
    return 0;
  }

  const count = data?.length ?? 0;
  if (count > 0) {
    console.log(`[AUTH] Linked ${count} order(s) for ${email} to user ${userId}`);
  }
  return count;
}
