'use client';

import { useActionState, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { login } from '@/lib/auth/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BambuLoading } from '@/components/bambu/bambu-loading';
import type { AuthResult } from '@/lib/auth/types';

export function LoginForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, pending] = useActionState(
    async (_prev: AuthResult | null, formData: FormData) => {
      const result = await login(formData);
      return result;
    },
    null,
  );

  return (
    <Card className="w-full max-w-[400px] px-8 py-6">
      <h1 className="text-2xl font-bold text-primary dark:text-gray-100 mb-6 text-center">
        {t('login.heading')}
      </h1>

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
            autoComplete="current-password"
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

        <div className="flex justify-end -mt-2">
          <Link
            href={`/${locale}/forgot-password`}
            className="text-sm text-primary dark:text-gray-400 hover:underline"
          >
            {t('login.forgotPassword')}
          </Link>
        </div>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? <BambuLoading size={24} /> : t('login.submit')}
        </Button>

        {state?.error && (
          <p className="text-sm text-[#E53935] text-center" role="alert">
            {state.error === 'already_registered'
              ? t('error.emailExists')
              : t('error.invalidCredentials')}
          </p>
        )}
      </form>

      <p className="text-sm text-center mt-4 text-gray-600 dark:text-gray-400">
        <Link href={`/${locale}/signup`} className="text-accent hover:underline">
          {t('login.noAccount')}
        </Link>
      </p>
    </Card>
  );
}
