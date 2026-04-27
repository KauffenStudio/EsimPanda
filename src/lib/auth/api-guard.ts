import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const UNAUTHORIZED = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

/**
 * Verify the request comes from an authenticated user.
 * Returns the user object or a 401 NextResponse.
 *
 * In mock mode (no real Supabase), returns null user — callers
 * should treat null user as unauthenticated.
 */
export async function requireAuth() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null, response: UNAUTHORIZED };
    }

    return { user, response: null };
  } catch {
    // Supabase unavailable (e.g., mock mode without connection)
    return { user: null, response: UNAUTHORIZED };
  }
}

/**
 * Verify the request comes from an admin user.
 * Returns 401 if not authenticated, 403 if not admin.
 */
export async function requireAdmin() {
  const { user, response } = await requireAuth();
  if (response) return { user: null, response };

  // Check admin role via Supabase user metadata or profiles table
  // For now, check app_metadata.role
  const isAdmin = user!.app_metadata?.role === 'admin';
  if (!isAdmin) {
    return {
      user: null,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { user, response: null };
}
