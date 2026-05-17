import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    env: {
      NEXT_PUBLIC_STRIPE_MOCK: 'true',
    },
    // Quarantine the Playwright VER-01 spec — it spends real money / sends
    // real email and must never run under jsdom via `npm test`.
    exclude: ['e2e/**', 'node_modules/**', 'dist/**', '.next/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // `server-only` is a Next.js build-time guard package not resolvable by
      // Vite — alias it to an empty stub so server-only modules can be unit-tested.
      'server-only': path.resolve(__dirname, './src/test-stubs/server-only.ts'),
    },
  },
});
