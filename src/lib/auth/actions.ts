'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { isMockMode } from './mock';
import type { AuthResult } from './types';

// STUB: Will be replaced by Plan 03 Task 1 with real import from @/lib/email/send-reset
async function sendResetEmail(_params: { to: string; resetUrl: string }) {
  console.log('[STUB] sendResetEmail -- will be replaced by Plan 03');
}

// STUB: Will be replaced by Plan 03 Task 2 with real order-linking logic
async function linkOrdersByEmail(email: string, userId: string) {
  console.log('[STUB] linkOrdersByEmail -- will be replaced by Plan 03', { email, userId });
}

async function getLocale(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get('NEXT_LOCALE')?.value ?? 'en';
}

export async function login(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  if (isMockMode()) {
    console.log('[MOCK AUTH] login:', email);
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  const locale = await getLocale();
  redirect(`/${locale}`);
}

export async function signup(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  if (isMockMode()) {
    console.log('[MOCK AUTH] signup:', email);
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'already_registered' };
    }
    return { error: error.message };
  }

  const locale = await getLocale();
  redirect(`/${locale}`);
}

export async function signOut(): Promise<void> {
  if (isMockMode()) {
    console.log('[MOCK AUTH] signOut');
    return;
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  const locale = await getLocale();
  redirect(`/${locale}/login`);
}

export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '');

  if (isMockMode()) {
    console.log('[MOCK AUTH] resetPassword:', email);
    return { success: true };
  }

  const locale = await getLocale();
  const supabase = await createClient();

  // Use admin.generateLink to generate recovery link WITHOUT sending Supabase's default email.
  // This allows us to send our own branded email via Resend.
  // Do NOT use resetPasswordForEmail -- that triggers Supabase's unbranded email.
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/${locale}/reset-password`,
    },
  });

  // Silently ignore errors (e.g., email not found) -- no email enumeration
  if (!error && data?.properties?.action_link) {
    await sendResetEmail({ to: email, resetUrl: data.properties.action_link });
  }

  // Always return success regardless of email existence
  return { success: true };
}

export async function updatePassword(formData: FormData): Promise<AuthResult> {
  const password = String(formData.get('password') ?? '');

  if (isMockMode()) {
    console.log('[MOCK AUTH] updatePassword');
    return { success: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  const locale = await getLocale();
  redirect(`/${locale}/login`);
}

export async function convertGuestToAccount(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  if (isMockMode()) {
    console.log('[MOCK AUTH] convertGuestToAccount:', email);
    return { success: true };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { converted_from_guest: true },
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'already_registered' };
    }
    return { error: error.message };
  }

  // Auto-link prior guest orders to the new account
  if (data?.user?.id) {
    await linkOrdersByEmail(email, data.user.id);
  }

  return { success: true };
}
