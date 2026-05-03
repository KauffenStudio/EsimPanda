import { useTranslations } from 'next-intl';
import { APP_STORE_LINKS } from '@/lib/config/app-store-links';

interface BadgeProps {
  href: string;
  src: string;
  alt: string;
  ariaLabel: string;
  comingSoonLabel: string;
  compact: boolean;
}

function Badge({ href, src, alt, ariaLabel, comingSoonLabel, compact }: BadgeProps) {
  const enabled = href.length > 0;
  const wrapperClass = compact
    ? 'flex-1 min-w-0 max-w-[130px] inline-flex items-center justify-center'
    : 'flex-1 min-w-0 max-w-[180px] inline-flex items-center justify-center';
  const imgClass = compact ? 'h-7 sm:h-8 w-auto' : 'h-10 sm:h-11 w-auto';

  if (enabled) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={`${wrapperClass} transition-opacity hover:opacity-90`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={imgClass} />
      </a>
    );
  }

  return (
    <span
      aria-disabled="true"
      title={comingSoonLabel}
      className={`${wrapperClass} opacity-50 cursor-not-allowed`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={imgClass} />
    </span>
  );
}

interface AppStoreBadgesProps {
  /** Render at footer-friendly size (h-7 / h-8). Default false renders the
      hero-sized variant. */
  compact?: boolean;
}

export function AppStoreBadges({ compact = false }: AppStoreBadgesProps = {}) {
  const t = useTranslations('appBadges');

  return (
    <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 w-full">
      <Badge
        href={APP_STORE_LINKS.apple}
        src="/badges/app-store-badge.svg"
        alt="Download on the App Store"
        ariaLabel={t('appStoreAria')}
        comingSoonLabel={t('comingSoon')}
        compact={compact}
      />
      <Badge
        href={APP_STORE_LINKS.google}
        src="/badges/google-play-badge.svg"
        alt="Get it on Google Play"
        ariaLabel={t('googlePlayAria')}
        comingSoonLabel={t('comingSoon')}
        compact={compact}
      />
    </div>
  );
}
