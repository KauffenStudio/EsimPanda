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
  // The badge image stays at its natural aspect ratio. flex-1 + max-w
  // lets the pair share width on narrow phones without squishing the
  // artwork — the image is height-constrained, width-auto.
  const wrapperClass =
    'flex-1 min-w-0 max-w-[180px] inline-flex items-center justify-center';
  const imgClass = 'h-10 sm:h-11 w-auto';

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

export function AppStoreBadges() {
  const t = useTranslations('appBadges');

  return (
    <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 w-full">
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
