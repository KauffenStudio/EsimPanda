'use client';

import { useActionState, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Check } from 'lucide-react';
import { convertGuestToAccount } from '@/lib/auth/actions';
import { useAuthStore } from '@/stores/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BambuLoading } from '@/components/bambu/bambu-loading';
import { BambuSuccess } from '@/components/bambu/bambu-success';
import type { AuthResult } from '@/lib/auth/types';

interface AccountConversionCTAProps {
  email: string;
}

export function AccountConversionCTA({ email }: AccountConversionCTAProps) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const [showPassword, setShowPassword] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [view, setView] = useState<'form' | 'success' | 'dismissed'>('form');

  const [state, formAction, pending] = useActionState(
    async (_prev: AuthResult | null, formData: FormData) => {
      const password = String(formData.get('password') ?? '');

      if (password.length < 8) {
        setClientError(t('error.passwordShort'));
        return null;
      }

      setClientError(null);
      const result = await convertGuestToAccount(formData);
      if (result?.success) {
        setView('success');
      }
      return result;
    },
    null,
  );

  // Hide if user is already logged in
  if (user) return null;

  // Dismissed state
  if (view === 'dismissed') return null;

  // Success state
  if (view === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-full rounded-[10px] p-6 text-center"
        style={{ backgroundColor: '#E3F0FF' }}
      >
        <BambuSuccess size={80} className="mx-auto mb-3" />
        <div className="flex items-center justify-center gap-2 mb-1">
          <Check size={24} className="text-[#43A047]" />
          <span
            className="text-2xl font-bold"
            style={{ color: '#43A047' }}
          >
            {t('convert.success')}
          </span>
        </div>
      </motion.div>
    );
  }

  // Form state
  return (
    <div
      className="w-full rounded-[10px] p-6"
      style={{ backgroundColor: '#E3F0FF' }}
    >
      <div className="text-center mb-4">
        <span className="text-3xl" role="img" aria-label="panda">
          🐼
        </span>
      </div>

      <h2 className="text-2xl font-bold text-primary dark:text-gray-100 mb-2 text-center">
        {t('convert.heading')}
      </h2>

      <p className="text-base text-gray-600 dark:text-gray-400 mb-4 text-center">
        {t('convert.body')}
      </p>

      <p className="text-sm text-gray-600 mb-4 text-center">{email}</p>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={email} />

        <div className="relative">
          <Input
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            placeholder={t('field.choosePassword')}
            label={t('field.choosePassword')}
            autoComplete="new-password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? <BambuLoading size={24} /> : t('convert.submit')}
        </Button>

        {(clientError || state?.error) && (
          <div className="text-sm text-[#E53935] text-center" role="alert">
            {clientError ? (
              clientError
            ) : state?.error === 'already_registered' ? (
              <span>
                {t('error.conversionExists')}{' '}
                <Link href={`/${locale}/login`} className="text-accent underline">
                  {t('login.submit')}
                </Link>
              </span>
            ) : (
              t('error.generic')
            )}
          </div>
        )}
      </form>

      <p className="text-sm text-center mt-3">
        <button
          type="button"
          onClick={() => setView('dismissed')}
          className="text-gray-600 hover:underline"
        >
          {t('convert.skip')}
        </button>
      </p>
    </div>
  );
}
