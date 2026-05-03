import { useTranslations } from 'next-intl';
import { APP_STORE_LINKS } from '@/lib/config/app-store-links';

interface BadgeProps {
  href: string;
  src: string;
  alt: string;
  ariaLabel: string;
  comingSoonLabel: string;
}

function Badge({ href, src, alt, ariaLabel, comingSoonLabel }: BadgeProps) {
  const enabled = href.length > 0;
  const className = 'inline-flex items-center justify-center';

  if (enabled) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={`${className} transition-opacity hover:opacity-90`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-12 w-auto" />
      </a>
    );
  }

  return (
    <span
      aria-disabled="true"
      title={comingSoonLabel}
      className={`${className} opacity-50 cursor-not-allowed`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-12 w-auto" />
    </span>
  );
}

export function AppStoreBadges() {
  const t = useTranslations('appBadges');

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <Badge
        href={APP_STORE_LINKS.apple}
        src="/badges/app-store-badge.svg"
        alt="Download on the App Store"
        ariaLabel={t('appStoreAria')}
        comingSoonLabel={t('comingSoon')}
      />
      <Badge
        href={APP_STORE_LINKS.google}
        src="/badges/google-play-badge.svg"
        alt="Get it on Google Play"
        ariaLabel={t('googlePlayAria')}
        comingSoonLabel={t('comingSoon')}
      />
    </div>
  );
}
