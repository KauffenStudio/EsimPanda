import Link from 'next/link';

type Stat = { value: string; label: string };
type Value = { title: string; body: string };

interface AboutCopy {
  eyebrow: string;
  title: string;
  intro: string[];
  stats: Stat[];
  valuesHeading: string;
  values: Value[];
  whoHeading: string;
  who: string;
  contactHeading: string;
  contact: string;
  contactCta: string;
}

const COPY: Record<string, AboutCopy> = {
  en: {
    eyebrow: 'About us',
    title: "Staying connected abroad shouldn't be the hard part.",
    intro: [
      'eSIM Panda started with a familiar frustration: landing in a new country and losing signal, hunting for a local SIM kiosk, or getting hit with a roaming bill weeks after the trip was over.',
      'We thought travel data should be the easy part of any journey — bought in a couple of taps, fairly priced, and working the moment you land. So we built it that way.',
    ],
    stats: [
      { value: '20,000+', label: 'travelers online every day' },
      { value: '100+', label: 'destinations worldwide' },
      { value: '~2 min', label: 'to buy, install and connect' },
      { value: '9', label: 'languages, real human support' },
    ],
    valuesHeading: 'What we believe',
    values: [
      { title: 'Fair, honest pricing', body: 'Local rates from $7.99, no roaming, and no hidden fees or auto-renewing subscriptions.' },
      { title: 'Plans that last', body: 'A full 30 days of validity, so a single plan covers your whole trip — not just a few days.' },
      { title: 'Keep your number', body: 'Your home SIM stays active for calls and texts. eSIM Panda only carries your data.' },
      { title: 'Real human support', body: 'Questions on the road are answered by real people, in nine languages, usually within minutes.' },
    ],
    whoHeading: 'Who we are',
    who: 'eSIM Panda is an independent product built by Kauffen Studio. We build for travelers because we are travelers — and eSIM Panda is the connectivity app we always wished we had in our own pockets.',
    contactHeading: 'Say hello',
    contact: 'Questions, ideas, partnerships or press — we read every message.',
    contactCta: 'Visit the Help Center',
  },
  pt: {
    eyebrow: 'Sobre nós',
    title: 'Estar online no estrangeiro não devia ser a parte difícil.',
    intro: [
      'A eSIM Panda nasceu de uma frustração conhecida: chegar a um país novo e ficar sem rede, andar à procura de um SIM local, ou receber uma fatura de roaming semanas depois de a viagem ter terminado.',
      'Achámos que os dados em viagem deviam ser a parte fácil — comprados em poucos toques, a um preço justo, e a funcionar mal aterramos. Por isso foi assim que os construímos.',
    ],
    stats: [
      { value: '20.000+', label: 'viajantes online todos os dias' },
      { value: '100+', label: 'destinos em todo o mundo' },
      { value: '~2 min', label: 'para comprar, instalar e ligar' },
      { value: '9', label: 'idiomas, apoio humano real' },
    ],
    valuesHeading: 'No que acreditamos',
    values: [
      { title: 'Preços justos e honestos', body: 'Tarifas locais a partir de 7,99 $, sem roaming e sem taxas escondidas ou subscrições automáticas.' },
      { title: 'Planos que duram', body: '30 dias completos de validade, para que um único plano cubra toda a viagem — não apenas uns dias.' },
      { title: 'Mantenha o seu número', body: 'O seu SIM continua ativo para chamadas e mensagens. A eSIM Panda só trata dos seus dados.' },
      { title: 'Apoio humano de verdade', body: 'As dúvidas em viagem são respondidas por pessoas reais, em nove idiomas, normalmente em minutos.' },
    ],
    whoHeading: 'Quem somos',
    who: 'A eSIM Panda é um produto independente criado pela Kauffen Studio. Construímos para viajantes porque somos viajantes — a eSIM Panda é a app de conectividade que sempre quisemos ter no bolso.',
    contactHeading: 'Diga olá',
    contact: 'Dúvidas, ideias, parcerias ou imprensa — lemos todas as mensagens.',
    contactCta: 'Visitar o Centro de Ajuda',
  },
};

export function AboutSection({ locale }: { locale: string }) {
  const c = COPY[locale] ?? COPY.en;
  // TODO(founder): add a founding-year / personal story line to the `who` copy above when ready.

  return (
    <div className="max-w-3xl mx-auto px-4 py-14 md:py-20 text-primary dark:text-gray-100">
      <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-semibold bg-accent-soft dark:bg-accent-soft-dark text-accent">
        {c.eyebrow}
      </span>

      <h1 className="mt-5 text-3xl md:text-5xl font-bold tracking-tighter leading-[1.05] max-w-[18ch]">
        {c.title}
      </h1>

      <div className="mt-6 space-y-4 text-gray-600 dark:text-gray-400 text-base md:text-lg leading-relaxed">
        {c.intro.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {c.stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-4 py-5 text-center"
          >
            <div className="text-2xl md:text-3xl font-bold text-accent tracking-tight">{s.value}</div>
            <div className="mt-1 text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-snug">{s.label}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-14 text-xl md:text-2xl font-bold tracking-tight">{c.valuesHeading}</h2>
      <div className="mt-5 grid sm:grid-cols-2 gap-4">
        {c.values.map((v) => (
          <div
            key={v.title}
            className="rounded-2xl border border-border dark:border-border-dark p-5"
          >
            <h3 className="font-semibold text-base md:text-lg">{v.title}</h3>
            <p className="mt-1.5 text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{v.body}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-14 text-xl md:text-2xl font-bold tracking-tight">{c.whoHeading}</h2>
      <p className="mt-4 text-gray-600 dark:text-gray-400 text-base md:text-lg leading-relaxed">{c.who}</p>

      <div className="mt-12 rounded-3xl bg-accent-soft dark:bg-accent-soft-dark p-6 md:p-8 text-center">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">{c.contactHeading}</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{c.contact}</p>
        <a
          href="mailto:geral@kauffen.com"
          className="mt-4 inline-block font-semibold text-accent hover:underline"
        >
          geral@kauffen.com
        </a>
        <div className="mt-2">
          <Link href={`/${locale}/help`} className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
            {c.contactCta} →
          </Link>
        </div>
      </div>
    </div>
  );
}
