'use client';

import { useState } from 'react';
import { getFaqsForDestination } from '@/lib/seo/faq-templates';
import { buildFaqJsonLd } from '@/lib/seo/structured-data';
import { JsonLd } from '@/components/seo/json-ld';

interface FAQSectionProps {
  countryName: string;
}

export function FAQSection({ countryName }: FAQSectionProps) {
  const faqs = getFaqsForDestination(countryName);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section>
      <JsonLd data={buildFaqJsonLd(faqs)} />
      <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
      <div className="divide-y divide-[#E5E5E5]">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="py-6">
              <button
                type="button"
                className="w-full text-left flex items-center justify-between gap-4"
                aria-expanded={isOpen}
                onClick={() => toggle(index)}
              >
                <span className="font-semibold text-base">{faq.question}</span>
                <span
                  className="text-gray-400 text-xl shrink-0 transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
                >
                  +
                </span>
              </button>
              <div
                className="overflow-hidden transition-all duration-200 ease-out"
                style={{ maxHeight: isOpen ? '300px' : '0px' }}
              >
                <p className="text-gray-600 text-sm leading-relaxed pt-3">
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
