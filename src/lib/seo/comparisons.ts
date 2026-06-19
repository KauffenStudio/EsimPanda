// Comparison ("X alternative") pages — bottom-funnel SEO.
//
// Editorial stance: favorable to eSIM Panda but HONEST. We lead with Panda's
// real strengths, acknowledge one or two genuine competitor strengths (builds
// trust + E-E-A-T, and avoids deceptive-comparison penalties / legal risk), and
// keep every competitor cell defensible + qualitative (no fabricated prices).
//
// Supported locales kept to en + pt on purpose: "alternative" search demand is
// overwhelmingly English, and PT is our home market. Other locales 404 cleanly
// until we have native copy for them.

export const COMPARISON_LOCALES = ['en', 'pt'] as const;
export type CompareLocale = (typeof COMPARISON_LOCALES)[number];

type L = Record<CompareLocale, string>;

export type CompareRow = {
  feature: L;
  panda: L; // may contain the {price} token, substituted at render time
  them: L;
  highlight: boolean; // true → Panda has the edge on this row (visually emphasized)
};

export type Comparison = {
  slug: string; // URL: /[locale]/compare/[slug]
  competitor: string; // display name, e.g. "Airalo"
  title: L; // <title> + H1
  description: L; // meta description
  intro: L;
  competitorStrength: L; // honest acknowledgment
  pandaPitch: L;
  rows: CompareRow[];
  faq: { q: L; a: L }[];
};

const SHARED_DISCLAIMER: L = {
  en: 'Competitor details are based on publicly available information and may change — always check the provider’s website for current plans and pricing.',
  pt: 'Os detalhes dos concorrentes baseiam-se em informação pública e podem mudar — confirma sempre os planos e preços atuais no site do fornecedor.',
};

export const DISCLAIMER = SHARED_DISCLAIMER;

const COMPARISONS: Comparison[] = [
  {
    slug: 'airalo',
    competitor: 'Airalo',
    title: {
      en: 'eSIM Panda vs Airalo: A Faster, Transparent Airalo Alternative',
      pt: 'eSIM Panda vs Airalo: Uma Alternativa à Airalo Mais Rápida e Transparente',
    },
    description: {
      en: 'Looking for an Airalo alternative? Compare eSIM Panda vs Airalo — instant QR delivery, transparent pricing and affordable data for 190+ destinations.',
      pt: 'À procura de uma alternativa à Airalo? Compara eSIM Panda vs Airalo — entrega instantânea do QR, preços transparentes e dados acessíveis para mais de 190 destinos.',
    },
    intro: {
      en: 'Airalo is one of the biggest names in travel eSIMs, with a huge catalog. But if you want straightforward pricing and data that’s online the moment you land, eSIM Panda is a strong alternative. Here’s an honest comparison.',
      pt: 'A Airalo é um dos maiores nomes em eSIMs de viagem, com um catálogo enorme. Mas se queres preços simples e dados ligados assim que aterras, o eSIM Panda é uma forte alternativa. Aqui está uma comparação honesta.',
    },
    competitorStrength: {
      en: 'What Airalo does well: a very large destination catalog and an established brand trusted by millions of travelers.',
      pt: 'O que a Airalo faz bem: um catálogo de destinos muito grande e uma marca consolidada, com a confiança de milhões de viajantes.',
    },
    pandaPitch: {
      en: 'Where eSIM Panda wins: transparent, budget-friendly pricing with no hidden fees, instant QR delivery to your email, and a plan that’s ready in under two minutes — backed by 20,000+ travelers.',
      pt: 'Onde o eSIM Panda ganha: preços transparentes e acessíveis sem custos escondidos, entrega instantânea do QR no teu email e um plano pronto em menos de dois minutos — com a confiança de mais de 20 000 viajantes.',
    },
    rows: [
      {
        feature: { en: 'Starting price', pt: 'Preço inicial' },
        panda: { en: 'from {price}', pt: 'desde {price}' },
        them: { en: 'Varies by destination', pt: 'Varia conforme o destino' },
        highlight: true,
      },
      {
        feature: { en: 'Pricing', pt: 'Preços' },
        panda: { en: 'Transparent, no hidden fees', pt: 'Transparentes, sem custos escondidos' },
        them: { en: 'Per-package', pt: 'Por pacote' },
        highlight: true,
      },
      {
        feature: { en: 'QR delivery', pt: 'Entrega do QR' },
        panda: { en: 'Instant, by email', pt: 'Instantânea, por email' },
        them: { en: 'Instant, by email', pt: 'Instantânea, por email' },
        highlight: false,
      },
      {
        feature: { en: 'Ready to use', pt: 'Pronto a usar' },
        panda: { en: 'Under 2 minutes', pt: 'Menos de 2 minutos' },
        them: { en: 'Typically a few minutes', pt: 'Normalmente alguns minutos' },
        highlight: true,
      },
      {
        feature: { en: 'Keep your number', pt: 'Mantém o teu número' },
        panda: { en: 'Yes (dual SIM)', pt: 'Sim (dual SIM)' },
        them: { en: 'Yes (dual SIM)', pt: 'Sim (dual SIM)' },
        highlight: false,
      },
      {
        feature: { en: 'Destinations', pt: 'Destinos' },
        panda: { en: '190+', pt: '190+' },
        them: { en: '200+', pt: '200+' },
        highlight: false,
      },
    ],
    faq: [
      {
        q: { en: 'Is eSIM Panda a good alternative to Airalo?', pt: 'O eSIM Panda é uma boa alternativa à Airalo?' },
        a: {
          en: 'Yes — if you want transparent pricing and instant activation for 190+ destinations, eSIM Panda covers the same core need with a simpler, budget-friendly experience.',
          pt: 'Sim — se queres preços transparentes e ativação instantânea para mais de 190 destinos, o eSIM Panda cobre a mesma necessidade com uma experiência mais simples e acessível.',
        },
      },
      {
        q: { en: 'Is eSIM Panda cheaper than Airalo?', pt: 'O eSIM Panda é mais barato que a Airalo?' },
        a: {
          en: 'eSIM Panda focuses on affordable, transparent per-plan pricing with no hidden fees. Exact savings depend on the destination and plan size — check the live price on any destination page.',
          pt: 'O eSIM Panda aposta em preços acessíveis e transparentes por plano, sem custos escondidos. A poupança exata depende do destino e do tamanho do plano — confirma o preço atual em qualquer página de destino.',
        },
      },
      {
        q: { en: 'Can I keep my phone number?', pt: 'Posso manter o meu número?' },
        a: {
          en: 'Yes. Like any eSIM, eSIM Panda runs alongside your existing SIM, so you keep your number and simply add travel data.',
          pt: 'Sim. Como qualquer eSIM, o eSIM Panda funciona ao lado do teu SIM atual, por isso manténs o número e apenas adicionas dados de viagem.',
        },
      },
      {
        q: { en: 'How fast do I get my eSIM?', pt: 'Quão rápido recebo o meu eSIM?' },
        a: {
          en: 'Instantly. Your QR code is emailed right after payment, so you can install it before you travel and connect the moment you land.',
          pt: 'Instantaneamente. O QR é enviado por email logo após o pagamento, por isso podes instalá-lo antes de viajar e ligar-te assim que aterras.',
        },
      },
    ],
  },
  {
    slug: 'holafly',
    competitor: 'Holafly',
    title: {
      en: 'eSIM Panda vs Holafly: An Affordable Holafly Alternative',
      pt: 'eSIM Panda vs Holafly: Uma Alternativa Acessível à Holafly',
    },
    description: {
      en: 'Holafly alternative? Compare eSIM Panda vs Holafly — pay only for the data you use, transparent pricing and instant activation for 190+ destinations.',
      pt: 'Alternativa à Holafly? Compara eSIM Panda vs Holafly — paga só os dados que usas, preços transparentes e ativação instantânea para mais de 190 destinos.',
    },
    intro: {
      en: 'Holafly is well known for unlimited-data eSIMs. But unlimited often comes at a premium, and not everyone needs it. If you’d rather pay only for the data you use, eSIM Panda is an affordable Holafly alternative.',
      pt: 'A Holafly é conhecida pelos eSIMs com dados ilimitados. Mas o ilimitado costuma ter um preço premium, e nem todos precisam dele. Se preferes pagar só os dados que usas, o eSIM Panda é uma alternativa acessível à Holafly.',
    },
    competitorStrength: {
      en: 'What Holafly does well: unlimited-data plans and a solid customer-support reputation.',
      pt: 'O que a Holafly faz bem: planos com dados ilimitados e uma boa reputação de apoio ao cliente.',
    },
    pandaPitch: {
      en: 'Where eSIM Panda wins: budget-friendly plans where you pay only for the data you need, transparent pricing with no hidden fees, and instant QR delivery for 190+ destinations.',
      pt: 'Onde o eSIM Panda ganha: planos acessíveis em que pagas só os dados de que precisas, preços transparentes sem custos escondidos e entrega instantânea do QR para mais de 190 destinos.',
    },
    rows: [
      {
        feature: { en: 'Pricing model', pt: 'Modelo de preços' },
        panda: { en: 'Pay for the data you use', pt: 'Pagas os dados que usas' },
        them: { en: 'Unlimited-focused (premium)', pt: 'Focado em ilimitado (premium)' },
        highlight: true,
      },
      {
        feature: { en: 'Starting price', pt: 'Preço inicial' },
        panda: { en: 'from {price}', pt: 'desde {price}' },
        them: { en: 'Premium', pt: 'Premium' },
        highlight: true,
      },
      {
        feature: { en: 'Best for', pt: 'Ideal para' },
        panda: { en: 'Travelers who want value', pt: 'Quem quer bom preço' },
        them: { en: 'Heavy unlimited users', pt: 'Grandes consumidores ilimitados' },
        highlight: true,
      },
      {
        feature: { en: 'QR delivery', pt: 'Entrega do QR' },
        panda: { en: 'Instant, by email', pt: 'Instantânea, por email' },
        them: { en: 'Instant, by email', pt: 'Instantânea, por email' },
        highlight: false,
      },
      {
        feature: { en: 'Keep your number', pt: 'Mantém o teu número' },
        panda: { en: 'Yes (dual SIM)', pt: 'Sim (dual SIM)' },
        them: { en: 'Yes (dual SIM)', pt: 'Sim (dual SIM)' },
        highlight: false,
      },
      {
        feature: { en: 'Destinations', pt: 'Destinos' },
        panda: { en: '190+', pt: '190+' },
        them: { en: '190+', pt: '190+' },
        highlight: false,
      },
    ],
    faq: [
      {
        q: { en: 'Is eSIM Panda a good alternative to Holafly?', pt: 'O eSIM Panda é uma boa alternativa à Holafly?' },
        a: {
          en: 'Yes — especially if you don’t need unlimited data. eSIM Panda lets you pay only for what you use, with transparent pricing and instant activation for 190+ destinations.',
          pt: 'Sim — sobretudo se não precisas de dados ilimitados. O eSIM Panda deixa-te pagar só o que usas, com preços transparentes e ativação instantânea para mais de 190 destinos.',
        },
      },
      {
        q: { en: 'Is eSIM Panda cheaper than Holafly?', pt: 'O eSIM Panda é mais barato que a Holafly?' },
        a: {
          en: 'For most travelers, yes — Holafly focuses on premium unlimited plans, while eSIM Panda offers affordable data packages where you pay for the amount you need. Check the live price on any destination page.',
          pt: 'Para a maioria dos viajantes, sim — a Holafly foca-se em planos ilimitados premium, enquanto o eSIM Panda oferece pacotes de dados acessíveis em que pagas a quantidade de que precisas. Confirma o preço atual em qualquer página de destino.',
        },
      },
      {
        q: { en: 'Do I really need unlimited data?', pt: 'Preciso mesmo de dados ilimitados?' },
        a: {
          en: 'Most travelers don’t. Maps, messaging and browsing use modest data, so a right-sized plan is usually cheaper than unlimited. eSIM Panda lets you pick the plan that fits your trip.',
          pt: 'A maioria dos viajantes não precisa. Mapas, mensagens e navegação usam pouco, por isso um plano à medida costuma ser mais barato que ilimitado. O eSIM Panda deixa-te escolher o plano certo para a tua viagem.',
        },
      },
      {
        q: { en: 'How fast do I get my eSIM?', pt: 'Quão rápido recebo o meu eSIM?' },
        a: {
          en: 'Instantly. Your QR code is emailed right after payment, so you can install it before you travel and connect the moment you land.',
          pt: 'Instantaneamente. O QR é enviado por email logo após o pagamento, por isso podes instalá-lo antes de viajar e ligar-te assim que aterras.',
        },
      },
    ],
  },
];

export function listComparisonSlugs(): string[] {
  return COMPARISONS.map((c) => c.slug);
}

export function getComparison(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}

export function isCompareLocale(locale: string): locale is CompareLocale {
  return (COMPARISON_LOCALES as readonly string[]).includes(locale);
}
