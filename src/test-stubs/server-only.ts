// Test-only stub for the `server-only` package.
// `server-only` ships with Next.js as a build-time guard and is not resolvable
// by Vitest/Vite. Aliasing it here lets `server-only` modules (e.g.
// src/lib/db/destinations.ts) be unit-tested. The real build still enforces the
// client-import guard — `npm run build` resolves the genuine package.
export {};
