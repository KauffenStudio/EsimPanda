'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { BambuLoading } from '@/components/bambu/bambu-loading';
import { GoogleIcon } from '@/components/auth/icons/google-icon';
import { AppleIcon } from '@/components/auth/icons/apple-icon';

const APPLE_ENABLED = true;

type Provider = 'google' | 'apple';

interface OAuthButtonsProps {
  next: string;
}

export function OAuthButtons({ next }: OAuthButtonsProps) {
  const t = useTranslations('auth.oauth');
  const [pending, setPending] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleProvider(provider: Provider) {
    setError(null);
    setPending(provider);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`;
      console.log('[oauth] starting', { provider, redirectTo });

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (oauthError) {
        console.error('[oauth] signInWithOAuth error:', oauthError);
        setError(`${t('error')} (${oauthError.message})`);
        setPending(null);
        return;
      }

      if (!data?.url) {
        console.error('[oauth] no redirect URL returned');
        setError(`${t('error')} (no redirect URL)`);
        setPending(null);
        return;
      }

      console.log('[oauth] redirecting to', data.url);
      window.location.assign(data.url);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'unknown error';
      console.error('[oauth] threw:', e);
      setError(`${t('error')} (${message})`);
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-3 mb-6">
      <Button
        variant="secondary"
        type="button"
        disabled={pending !== null}
        onClick={() => handleProvider('google')}
        className="w-full gap-3"
      >
        {pending === 'google' ? (
          <BambuLoading size={20} />
        ) : (
          <>
            <GoogleIcon size={18} />
            {t('continueWithGoogle')}
          </>
        )}
      </Button>

      {APPLE_ENABLED && (
        <Button
          variant="secondary"
          type="button"
          disabled={pending !== null}
          onClick={() => handleProvider('apple')}
          className="w-full gap-3"
        >
          {pending === 'apple' ? (
            <BambuLoading size={20} />
          ) : (
            <>
              <AppleIcon size={18} />
              {t('continueWithApple')}
            </>
          )}
        </Button>
      )}

      {error && (
        <p className="text-sm text-[#E53935] text-center" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 mt-2">
        <hr className="flex-1 border-t border-border dark:border-border-dark" />
        <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {t('dividerOr')}
        </span>
        <hr className="flex-1 border-t border-border dark:border-border-dark" />
      </div>
    </div>
  );
}
