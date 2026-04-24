'use client';

import { useActionState, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { resetPassword } from '@/lib/auth/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BambuLoading } from '@/components/bambu/bambu-loading';
import { BambuSuccess } from '@/components/bambu/bambu-success';
import type { AuthResult } from '@/lib/auth/types';

export function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [sent, setSent] = useState(false);

  const [state, formAction, pending] = useActionState(
    async (_prev: AuthResult | null, formData: FormData) => {
      const result = await resetPassword(formData);
      if (result?.success) {
        setSent(true);
      }
      return result;
    },
    null,
  );

  if (sent) {
    return (
      <Card className="w-full max-w-[400px] px-8 py-6">
        <div className="flex flex-col items-center text-center gap-4">
          <BambuSuccess size={80} />
          <h1 className="text-2xl font-bold text-primary dark:text-gray-100">
            {t('forgot.successHeading')}
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400">
            {t('forgot.successBody')}
          </p>
          <Link
            href={`/${locale}/login`}
            className="text-sm text-accent hover:underline mt-2"
          >
            {t('login.heading')}
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[400px] px-8 py-6">
      <h1 className="text-2xl font-bold text-primary dark:text-gray-100 mb-2 text-center">
        {t('forgot.heading')}
      </h1>
      <p className="text-base text-gray-600 dark:text-gray-400 mb-6 text-center">
        {t('forgot.body')}
      </p>

      <form action={formAction} className="flex flex-col gap-4">
        <Input
          name="email"
          type="email"
          required
          placeholder={t('field.email')}
          label={t('field.email')}
          autoComplete="email"
        />

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? <BambuLoading size={24} /> : t('forgot.submit')}
        </Button>

        {state?.error && (
          <p className="text-sm text-[#E53935] text-center" role="alert">
            {t('error.generic')}
          </p>
        )}
      </form>

      <p className="text-sm text-center mt-4 text-gray-600 dark:text-gray-400">
        <Link href={`/${locale}/login`} className="text-accent hover:underline">
          {t('login.heading')}
        </Link>
      </p>
    </Card>
  );
}
