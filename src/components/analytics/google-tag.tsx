import Script from 'next/script';

/**
 * Google tag (gtag.js) for Google Ads conversion tracking.
 *
 * Renders nothing unless NEXT_PUBLIC_GOOGLE_ADS_ID is set, so preview and local
 * builds never pollute the production conversion data.
 *
 * Consent Mode v2 defaults are declared BEFORE the config call — that ordering
 * is required. Google reads the defaults when the tag initialises; setting them
 * afterwards means the first page view has already fired under the wrong state.
 *
 * EEA + UK default to denied. That is the compliant default under GDPR and UK
 * PECR: storage may only be used after the visitor opts in. Nothing in the app
 * grants consent yet, so until a consent banner ships, EEA/UK conversions are
 * modelled rather than observed. Given the current Google Ads campaign targets
 * UK travellers exclusively, that banner is the next dependency for reliable
 * measurement — see .planning/marketing/google-ads/README.md.
 */

const EEA_AND_UK = [
  // EU 27
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE',
  // Rest of EEA
  'IS', 'LI', 'NO',
  // UK + Switzerland (not EEA, but equivalent consent expectations)
  'GB', 'CH',
];

export function GoogleTag() {
  const id = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  if (!id) return null;

  const bootstrap = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

gtag('consent', 'default', {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted'
});

gtag('consent', 'default', {
  region: ${JSON.stringify(EEA_AND_UK)},
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});

gtag('js', new Date());
gtag('config', ${JSON.stringify(id)});
`.trim();

  return (
    <>
      <Script
        id="gtag-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`}
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {bootstrap}
      </Script>
    </>
  );
}
