import Link from 'next/link';
import { LogIn, UserPlus, Mail, Package, Wallet, Calendar } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getOrdersByUser } from '@/lib/db/orders';
import { Button } from '@/components/ui/button';
import { ProfileSettings } from '@/components/profile/profile-settings';
import { DeleteAccountSection } from '@/components/profile/delete-account-section';

const PAID_STATUSES = ['delivered', 'active', 'expired', 'payment_confirmed'];

function formatCurrency(cents: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  } catch {
    return `${currency.toUpperCase()} ${(cents / 100).toFixed(2)}`;
  }
}

function formatMonthYear(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(
      new Date(iso),
    );
  } catch {
    return iso.slice(0, 10);
  }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center px-4 pb-4 max-w-5xl mx-auto min-h-[calc(100dvh-10rem)]">
        <h1 className="text-3xl font-bold tracking-tighter text-primary dark:text-gray-100 mb-2">
          {t('profile.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-sm text-sm mb-4">
          {t('profile.empty')}
        </p>
        <div className="flex flex-row gap-2 sm:gap-3 w-full max-w-md">
          <Link href={`/${locale}/login`} className="flex-1 min-w-0">
            <Button variant="primary" size="md" className="w-full">
              <LogIn size={16} className="mr-1.5 shrink-0" />
              <span className="truncate">{t('auth.login.submit')}</span>
            </Button>
          </Link>
          <Link href={`/${locale}/signup`} className="flex-1 min-w-0">
            <Button variant="secondary" size="md" className="w-full">
              <UserPlus size={16} className="mr-1.5 shrink-0" />
              <span className="truncate">{t('auth.signup.submit')}</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const orders = await getOrdersByUser(user.id);
  const paidOrders = orders.filter((o) => PAID_STATUSES.includes(o.status));

  const spendingByCurrency = paidOrders.reduce<Record<string, number>>((acc, o) => {
    acc[o.currency] = (acc[o.currency] ?? 0) + o.amount_paid_cents;
    return acc;
  }, {});

  const totals = Object.entries(spendingByCurrency).map(([currency, cents]) => ({
    currency,
    formatted: formatCurrency(cents, currency, locale),
  }));

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email!.split('@')[0];

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const initial = fullName.trim()[0]?.toUpperCase() ?? '?';
  const memberSince = formatMonthYear(user.created_at, locale);

  return (
    <div className="flex flex-col items-center px-4 py-8 gap-6">
      <h1 className="text-3xl font-bold tracking-tighter text-primary dark:text-gray-100">
        {t('profile.title')}
      </h1>

      <section className="w-full max-w-md rounded-xl border border-border dark:border-border-dark bg-white dark:bg-surface-dark p-5">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-14 h-14 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#2979FF] text-white text-xl font-semibold flex items-center justify-center">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-primary dark:text-gray-100 truncate">
              {fullName}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
              <Mail size={12} aria-hidden />
              {user.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <Calendar size={12} aria-hidden />
              {t('profile.memberSince', { date: memberSince })}
            </p>
          </div>
        </div>
      </section>

      <section className="w-full max-w-md rounded-xl border border-border dark:border-border-dark bg-white dark:bg-surface-dark p-5 space-y-4">
        <h2 className="text-sm font-semibold text-primary dark:text-gray-100">
          {t('profile.activity')}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <Package size={14} aria-hidden />
              {t('profile.esimsBought')}
            </div>
            <p className="text-2xl font-bold text-primary dark:text-gray-100">
              {paidOrders.length}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <Wallet size={14} aria-hidden />
              {t('profile.totalSpent')}
            </div>
            {totals.length === 0 ? (
              <p className="text-2xl font-bold text-primary dark:text-gray-100">—</p>
            ) : (
              <div className="space-y-0.5">
                {totals.map((row) => (
                  <p
                    key={row.currency}
                    className="text-2xl font-bold text-primary dark:text-gray-100 leading-tight"
                  >
                    {row.formatted}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <ProfileSettings />

      <DeleteAccountSection email={user.email!} />
    </div>
  );
}
