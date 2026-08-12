'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { buildFaqJsonLd } from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/json-ld';

type FaqItem = { q: string; a: string };

export function HomeFaq() {
  const t = useTranslations('landing.faq');
  const items = t.raw('items') as FaqItem[];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => setOpenIndex((prev) => (prev === index ? null : index));

  return (
    <section className="w-full max-w-[760px] mx-auto px-4 mt-16 md:mt-28 mb-8">
      <JsonLd data={buildFaqJsonLd(items.map((i) => ({ question: i.q, answer: i.a })))} />
      <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-center mb-6 text-primary dark:text-gray-100">
        {t('title')}
      </h2>
      <div className="divide-y divide-border dark:divide-border-dark">
        {items.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="py-5">
              <button
                type="button"
                id={`faq-q-${index}`}
                className="w-full text-left flex items-center justify-between gap-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background dark:focus-visible:ring-offset-background-dark"
                aria-expanded={isOpen}
                aria-controls={`faq-a-${index}`}
                onClick={() => toggle(index)}
              >
                <span className="font-semibold text-base text-primary dark:text-gray-100">{faq.q}</span>
                <span
                  aria-hidden="true"
                  className="text-gray-400 dark:text-gray-600 text-xl shrink-0 transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                >
                  +
                </span>
              </button>
              <div
                id={`faq-a-${index}`}
                role="region"
                aria-labelledby={`faq-q-${index}`}
                className="grid transition-all duration-200 ease-out"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed pt-3">{faq.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
