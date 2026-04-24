function isoToFlag(isoCode: string): string {
  return isoCode
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('');
}

interface DestinationHeroProps {
  countryName: string;
  isoCode: string;
  isRegional?: boolean;
}

export function DestinationHero({ countryName, isoCode, isRegional }: DestinationHeroProps) {
  const flag = isoToFlag(isoCode);

  return (
    <section className="pt-12 pb-6">
      <div className="flex items-center gap-3 mb-3">
        <span style={{ fontSize: '3rem' }} role="img" aria-label={`${countryName} flag`}>
          {flag}
        </span>
        <h1 className="text-[32px] font-bold leading-tight">{countryName}</h1>
      </div>
      <p className="text-base font-normal text-gray-600 max-w-[640px]">
        {isRegional
          ? `Stay connected across ${countryName} with coverage in 30+ countries. One eSIM plan, instant activation -- no SIM swaps, no roaming charges. Perfect for Erasmus students and backpackers.`
          : `Stay connected during your time in ${countryName}. Get an eSIM plan with instant activation -- no SIM swaps, no roaming charges.`}
      </p>
    </section>
  );
}
