'use client';

import { useActionState, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff } from 'lucide-react';
import { updatePassword } from '@/lib/auth/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BambuLoading } from '@/components/bambu/bambu-loading';
import { BambuVideo } from '@/components/bambu/bambu-video';
import type { AuthResult } from '@/lib/auth/types';

export function ResetPasswordForm() {
  const t = useTranslations('auth');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState(
    async (_prev: AuthResult | null, formData: FormData) => {
      const password = String(formData.get('password') ?? '');
      const confirm = String(formData.get('confirmPassword') ?? '');

      if (password.length < 8) {
        setClientError(t('error.passwordShort'));
        return null;
      }
      if (password !== confirm) {
        setClientError(t('error.passwordMismatch'));
        return null;
      }

      setClientError(null);
      const result = await updatePassword(formData);
      return result;
    },
    null,
  );

  return (
    <Card className="w-full max-w-[400px] px-8 py-6">
      <div className="flex flex-col items-center mb-4">
        <BambuVideo variant="success" size={64} />
      </div>

      <h1 className="text-2xl font-bold text-primary dark:text-gray-100 mb-6 text-center">
        {t('reset.heading')}
      </h1>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            placeholder={t('field.newPassword')}
            label={t('field.newPassword')}
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
          {pending ? <BambuLoading size={24} /> : t('reset.submit')}
        </Button>

        {(clientError || state?.error) && (
          <p className="text-sm text-[#E53935] text-center" role="alert">
            {clientError ?? t('error.generic')}
          </p>
        )}
      </form>
    </Card>
  );
}
