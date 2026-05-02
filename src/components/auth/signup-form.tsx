'use client';

import { useActionState, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { signup } from '@/lib/auth/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BambuLoading } from '@/components/bambu/bambu-loading';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import type { AuthResult } from '@/lib/auth/types';

export function SignupForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState(
    async (_prev: AuthResult | null, formData: FormData) => {
      const password = formData.get('password') as string;
      const confirmPassword = formData.get('confirmPassword') as string;

      if (password.length < 8) {
        return { error: 'password_short' };
      }

      if (password !== confirmPassword) {
        return { error: 'password_mismatch' };
      }

      setClientError(null);
      const result = await signup(formData);
      return result;
    },
    null,
  );

  const errorMessage = clientError || state?.error;

  function renderError() {
    if (!errorMessage) return null;

    if (errorMessage === 'password_short') {
      return (
        <p className="text-sm text-[#E53935] text-center" role="alert">
          {t('error.passwordShort')}
        </p>
      );
    }

    if (errorMessage === 'password_mismatch') {
      return (
        <p className="text-sm text-[#E53935] text-center" role="alert">
          {t('error.passwordMismatch')}
        </p>
      );
    }

    if (errorMessage === 'already_registered') {
      return (
        <p className="text-sm text-[#E53935] text-center" role="alert">
          {t('error.emailExists')}{' '}
          <Link href={`/${locale}/login`} className="text-accent hover:underline">
            Log in
          </Link>
        </p>
      );
    }

    return (
      <p className="text-sm text-[#E53935] text-center" role="alert">
        {t('error.generic')}
      </p>
    );
  }

  return (
    <Card className="w-full max-w-[400px] px-8 py-6">
      <h1 className="text-2xl font-bold text-primary dark:text-gray-100 mb-6 text-center">
        {t('signup.heading')}
      </h1>

      <OAuthButtons next={`/${locale}`} />

      <form action={formAction} className="flex flex-col gap-4">
        <Input
          name="email"
          type="email"
          required
          placeholder={t('field.email')}
          label={t('field.email')}
          autoComplete="email"
        />

        <div className="relative">
          <Input
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            placeholder={t('field.password')}
            label={t('field.password')}
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

        <div className="relative">
          <Input
            name="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            required
            minLength={8}
            placeholder={t('field.confirmPassword')}
            label={t('field.confirmPassword')}
            autoComplete="new-password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? <BambuLoading size={24} /> : t('signup.submit')}
        </Button>

        {renderError()}
      </form>

      <p className="text-sm text-center mt-4 text-gray-600 dark:text-gray-400">
        <Link href={`/${locale}/login`} className="text-accent hover:underline">
          {t('signup.hasAccount')}
        </Link>
      </p>
    </Card>
  );
}
