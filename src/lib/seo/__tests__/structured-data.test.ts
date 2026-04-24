import { describe, it } from 'vitest';

describe('structured-data', () => {
  describe('buildProductJsonLd', () => {
    it.todo('returns valid Product schema with @context and @type');
    it.todo('includes plan name with destination, data, and duration');
    it.todo('formats price from cents to EUR decimal string');
    it.todo('sets availability to InStock');
  });

  describe('buildFaqJsonLd', () => {
    it.todo('returns valid FAQPage schema');
    it.todo('maps questions to Question/Answer entities');
  });

  describe('buildBreadcrumbJsonLd', () => {
    it.todo('returns BreadcrumbList with Home and Destinations');
    it.todo('adds destination as 3rd item when provided');
    it.todo('uses locale in URL paths');
  });
});
