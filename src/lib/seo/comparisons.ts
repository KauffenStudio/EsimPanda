// Comparison ("X alternative") pages — bottom-funnel SEO.
//
// Editorial stance: clearly favorable to eSIM Panda. We lead with Panda's
// strengths, frame each competitor around its real trade-off (the "catch"), and
// keep the comparison table tilted to where Panda wins. The one guardrail: no
// fabricated facts/prices about named competitors (legal + deceptive-comparison
// risk) — competitor cells stay qualitative and defensible, with a small
// disclaimer. Panda's starting price is pulled live from the catalog.
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
  competitorCatch: L; // the competitor's real trade-off / downside
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
      en: 'eSIM Panda vs Airalo: A Cheaper, Faster Airalo Alternative',
      pt: 'eSIM Panda vs Airalo: Uma Alternativa à Airalo Mais Barata e Rápida',
    },
    description: {
      en: 'Looking for an Airalo alternative? eSIM Panda gives you transparent pricing with no hidden fees, instant QR delivery and a plan ready in under 2 minutes for 190+ destinations.',
      pt: 'À procura de uma alternativa à Airalo? O eSIM Panda dá-te preços transparentes sem custos escondidos, entrega instantânea do QR e um plano pronto em menos de 2 minutos para mais de 190 destinos.',
    },
    intro: {
      en: 'Airalo is a big name in travel eSIMs — but its per-package pricing can add up and the experience is built around its app. If you want transparent pricing and data that’s online the moment you land, eSIM Panda is the simpler, better-value alternative.',
      pt: 'A Airalo é um grande nome nos eSIMs de viagem — mas os preços por pacote podem acumular e a experiência gira à volta da app. Se queres preços transparentes e dados ligados assim que aterras, o eSIM Panda é a alternativa mais simples e com melhor preço.',
    },
    competitorCatch: {
      en: 'Per-package pricing that can add up, an app-centric setup, and top-ups that travelers frequently report as hit-or-miss.',
      pt: 'Preços por pacote que podem acumular, uma experiência centrada na app e recargas que muitos viajantes relatam como pouco fiáveis.',
    },
    pandaPitch: {
      en: 'Transparent, budget-friendly pricing with no hidden fees, an instant QR in your inbox, and a plan ready in under two minutes — trusted by 20,000+ travelers.',
      pt: 'Preços transparentes e acessíveis sem custos escondidos, um QR instantâneo no teu email e um plano pronto em menos de dois minutos — com a confiança de mais de 20 000 viajantes.',
    },
    rows: [
      {
        feature: { en: 'Starting price', pt: 'Preço inicial' },
        panda: { en: 'from {price}', pt: 'desde {price}' },
        them: { en: 'Per-package, adds up', pt: 'Por pacote, acumula' },
        highlight: true,
      },
      {
        feature: { en: 'Pricing', pt: 'Preços' },
        panda: { en: 'Transparent, no hidden fees', pt: 'Transparentes, sem custos escondidos' },
        them: { en: 'Per-package add-ons', pt: 'Extras por pacote' },
        highlight: true,
      },
      {
        feature: { en: 'Ready to use', pt: 'Pronto a usar' },
        panda: { en: 'Under 2 minutes', pt: 'Menos de 2 minutos' },
        them: { en: 'Typically a few minutes', pt: 'Normalmente alguns minutos' },
        highlight: true,
      },
      {
        feature: { en: 'Top-ups', pt: 'Recargas' },
        panda: { en: 'Easy, anytime from your account', pt: 'Fáceis, a qualquer hora na tua conta' },
        them: { en: 'Mixed reviews', pt: 'Críticas mistas' },
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
    ],
    faq: [
      {
        q: { en: 'Is eSIM Panda a good alternative to Airalo?', pt: 'O eSIM Panda é uma boa alternativa à Airalo?' },
        a: {
          en: 'Yes. For 190+ destinations you get the same instant-eSIM convenience with transparent, budget-friendly pricing and a faster, simpler setup.',
          pt: 'Sim. Para mais de 190 destinos tens a mesma conveniência de eSIM instantâneo, com preços transparentes e acessíveis e uma configuração mais rápida e simples.',
        },
      },
      {
        q: { en: 'Is eSIM Panda cheaper than Airalo?', pt: 'O eSIM Panda é mais barato que a Airalo?' },
        a: {
          en: 'eSIM Panda uses transparent per-plan pricing with no hidden fees, so what you see is what you pay. Check the live price on any destination page for your trip.',
          pt: 'O eSIM Panda usa preços transparentes por plano, sem custos escondidos — o que vês é o que pagas. Confirma o preço atual em qualquer página de destino para a tua viagem.',
        },
      },
      {
        q: { en: 'Can I keep my phone number?', pt: 'Posso manter o meu número?' },
        a: {
          en: 'Yes. eSIM Panda runs alongside your existing SIM, so you keep your number and simply add travel data.',
          pt: 'Sim. O eSIM Panda funciona ao lado do teu SIM atual, por isso manténs o número e apenas adicionas dados de viagem.',
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
      en: 'eSIM Panda vs Holafly: A Cheaper Holafly Alternative',
      pt: 'eSIM Panda vs Holafly: Uma Alternativa Mais Barata à Holafly',
    },
    description: {
      en: 'Holafly alternative? Stop overpaying for unlimited. eSIM Panda lets you pay only for the data you use, with transparent pricing and instant activation for 190+ destinations.',
      pt: 'Alternativa à Holafly? Deixa de pagar a mais por ilimitado. O eSIM Panda deixa-te pagar só os dados que usas, com preços transparentes e ativação instantânea para mais de 190 destinos.',
    },
    intro: {
      en: 'Holafly is built around premium unlimited plans — which means you often pay top dollar even for a short trip or light use. With eSIM Panda you pay only for the data you actually need, at transparent prices, for 190+ destinations.',
      pt: 'A Holafly aposta em planos ilimitados premium — ou seja, pagas muitas vezes caro mesmo numa viagem curta ou com uso leve. Com o eSIM Panda pagas só os dados de que realmente precisas, a preços transparentes, para mais de 190 destinos.',
    },
    competitorCatch: {
      en: 'Premium unlimited pricing you pay even for light use or short trips, with hotspot/tethering limited on some plans.',
      pt: 'Preços premium de ilimitado que pagas mesmo com uso leve ou viagens curtas, com partilha de internet (hotspot) limitada nalguns planos.',
    },
    pandaPitch: {
      en: 'Pay only for the data you actually need, with transparent pricing, no hidden fees and an instant QR for 190+ destinations — trusted by 20,000+ travelers.',
      pt: 'Paga só os dados de que realmente precisas, com preços transparentes, sem custos escondidos e um QR instantâneo para mais de 190 destinos — com a confiança de mais de 20 000 viajantes.',
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
        feature: { en: 'Short or light trips', pt: 'Viagens curtas ou leves' },
        panda: { en: 'Great value', pt: 'Ótimo preço' },
        them: { en: 'You overpay', pt: 'Pagas a mais' },
        highlight: true,
      },
      {
        feature: { en: 'Hotspot / tethering', pt: 'Hotspot / partilha' },
        panda: { en: 'Yes', pt: 'Sim' },
        them: { en: 'Limited on some plans', pt: 'Limitado nalguns planos' },
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
    ],
    faq: [
      {
        q: { en: 'Is eSIM Panda a good alternative to Holafly?', pt: 'O eSIM Panda é uma boa alternativa à Holafly?' },
        a: {
          en: 'Yes — especially if you don’t need unlimited data. You pay only for what you use, with transparent pricing and instant activation for 190+ destinations.',
          pt: 'Sim — sobretudo se não precisas de dados ilimitados. Pagas só o que usas, com preços transparentes e ativação instantânea para mais de 190 destinos.',
        },
      },
      {
        q: { en: 'Is eSIM Panda cheaper than Holafly?', pt: 'O eSIM Panda é mais barato que a Holafly?' },
        a: {
          en: 'For most travelers, yes. Holafly focuses on premium unlimited plans, while eSIM Panda offers affordable packages sized to your trip — so you don’t pay for data you won’t use.',
          pt: 'Para a maioria dos viajantes, sim. A Holafly foca-se em planos ilimitados premium, enquanto o eSIM Panda oferece pacotes acessíveis à medida da tua viagem — por isso não pagas por dados que não vais usar.',
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
