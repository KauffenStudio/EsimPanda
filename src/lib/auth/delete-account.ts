'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient as createSsrClient } from '@/lib/supabase/server';
import { anonymizeOrdersForUser } from '@/lib/db/orders';
import { sendAccountDeletedEmail } from '@/lib/email/send-account-deleted';
import { isMockMode } from './mock';

const SUPPORTED_LOCALES = ['en', 'pt', 'es', 'fr', 'zh', 'ja'] as const;
const USER_UPLOADS_BUCKET = 'user-uploads';

async function getLocale(): Promise<string> {
  const cookieStore = await cookies();
  const raw = cookieStore.get('NEXT_LOCALE')?.value ?? 'en';
  return (SUPPORTED_LOCALES as readonly string[]).includes(raw) ? raw : 'en';
}

function buildServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Supabase service-role credentials are not configured');
  }
  return createServiceClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function deleteUserUploadsFolder(
  service: ReturnType<typeof buildServiceClient>,
  userId: string,
): Promise<void> {
  const { data, error: listError } = await service.storage
    .from(USER_UPLOADS_BUCKET)
    .list(userId, { limit: 1000 });

  if (listError) {
    // Bucket missing or empty folder — log and move on; don't block the deletion.
    console.warn('[delete-account] could not list user uploads:', listError.message);
    return;
  }

  if (!data || data.length === 0) return;

  const paths = data.map((item) => `${userId}/${item.name}`);
  const { error: removeError } = await service.storage
    .from(USER_UPLOADS_BUCKET)
    .remove(paths);

  if (removeError) {
    console.warn('[delete-account] could not delete user uploads:', removeError.message);
  }
}

export async function deleteAccount(): Promise<{ ok: false; error: string }> {
  const locale = await getLocale();

  if (isMockMode()) {
    console.log('[MOCK AUTH] deleteAccount');
    revalidatePath('/', 'layout');
    redirect(`/${locale}/login?deleted=1`);
  }

  const ssr = await createSsrClient();
  const {
    data: { user },
  } = await ssr.auth.getUser();

  if (!user) {
    return { ok: false, error: 'unauthenticated' };
  }

  const service = buildServiceClient();
  const email = user.email;
  const userId = user.id;

  try {
    await anonymizeOrdersForUser(service, userId);
  } catch {
    return { ok: false, error: 'orders_failed' };
  }

  await deleteUserUploadsFolder(service, userId);

  const { error: deleteError } = await service.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error('[delete-account] admin.deleteUser failed:', deleteError.message);
    return { ok: false, error: 'auth_delete_failed' };
  }

  // Best-effort: clear any remaining session cookies on the SSR side.
  await ssr.auth.signOut();

  if (email) {
    await sendAccountDeletedEmail({ to: email });
  }

  revalidatePath('/', 'layout');
  redirect(`/${locale}/login?deleted=1`);
}
