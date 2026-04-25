'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { useCheckoutStore } from '@/stores/checkout';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailField() {
  const t = useTranslations('checkout.email');
  const setEmail = useCheckoutStore((s) => s.setEmail);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    setEmail(v);
    if (error) setError(undefined);
  };

  const handleBlur = () => {
    if (value && !EMAIL_REGEX.test(value)) {
      setError(t('error'));
    }
  };

  return (
    <Input
      label={t('label')}
      placeholder={t('placeholder')}
      type="email"
      inputMode="email"
      autoComplete="email"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      error={error}
      className="dark:text-gray-100"
      style={{ fontSize: '16px' }}
    />
  );
}
