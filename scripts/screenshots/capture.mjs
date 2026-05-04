// Captures raw app screenshots at iPhone 6.9" portrait (1320x2868 native).
//
// Mobile rendering: viewport CSS=440x956 with deviceScaleFactor=3 so Tailwind's
// `md:` breakpoint stays inactive (we want the mobile layout) and the resulting
// screenshot file is exactly 1320x2868 — Apple's required size.
//
// Run: NEXT_PUBLIC_STRIPE_MOCK=true npm run dev   (separate terminal)
//      node scripts/screenshots/capture.mjs

import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'screenshots', 'raw');
fs.mkdirSync(OUT_DIR, { recursive: true });

// iPhone 16 Pro Max — CSS resolution is 440x956 at 3x device pixel ratio.
const CSS_VIEWPORT = { width: 440, height: 956 };
const DEVICE_SCALE_FACTOR = 3;

const TARGETS = [
  {
    id: '01-landing',
    url: 'http://localhost:3000/en',
    waitForSelector: 'h1',
    extraWait: 1500,
  },
  {
    id: '02-browse',
    url: 'http://localhost:3000/en/browse',
    waitForSelector: 'h1, h2',
    extraWait: 1500,
  },
  {
    id: '03-destination-plans',
    url: 'http://localhost:3000/en/esim/portugal',
    waitForSelector: 'h1, h2',
    extraWait: 1500,
  },
  {
    id: '04-login',
    url: 'http://localhost:3000/en/login',
    waitForSelector: 'h1',
    extraWait: 1200,
    networkIdle: false,
  },
  {
    id: '05-profile',
    url: 'http://localhost:3000/en/profile',
    waitForSelector: 'h1',
    extraWait: 1200,
    networkIdle: false,
  },
  {
    id: '06-faq',
    url: 'http://localhost:3000/en/esim/portugal',
    waitForSelector: 'h2',
    extraWait: 1500,
    scrollTo: 'faq', // scroll into view of the FAQ section
  },
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: CSS_VIEWPORT,
  deviceScaleFactor: DEVICE_SCALE_FACTOR,
  isMobile: true,
  hasTouch: true,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});

const page = await context.newPage();
await page.addInitScript(() => {
  try {
    // Force light theme.
    localStorage.removeItem('esim-panda-theme');
    // Skip the 3.8s panda splash that runs on first visit per session.
    sessionStorage.setItem('esim-panda-splash-seen', '1');
  } catch {}
});

for (const t of TARGETS) {
  console.log(`Capturing ${t.id} <- ${t.url}`);
  try {
    await page.goto(t.url, {
      waitUntil: t.networkIdle === false ? 'domcontentloaded' : 'networkidle',
      timeout: 20000,
    });
  } catch (err) {
    console.warn(`  goto warning: ${err.message}`);
  }
  if (t.waitForSelector) {
    try {
      await page.waitForSelector(t.waitForSelector, { timeout: 10000 });
    } catch {
      console.warn(`  waitForSelector ${t.waitForSelector} timed out, continuing`);
    }
  }
  await page.waitForTimeout(t.extraWait ?? 1000);
  // Hide Next.js dev tools badge — it's bottom-left in dev mode and would
  // otherwise show in App Store screenshots.
  await page.addStyleTag({
    content: `
      [data-nextjs-toolbar],
      [data-nextjs-dev-tools-button],
      nextjs-portal,
      div[id^="__next-route-announcer"] { display: none !important; }
    `,
  });
  if (t.scrollTo === 'faq') {
    await page.evaluate(() => {
      const target = Array.from(document.querySelectorAll('h2')).find((h) =>
        /Frequently|FAQ/i.test(h.textContent ?? ''),
      );
      if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
    await page.waitForTimeout(400);
  } else {
    await page.evaluate(() => window.scrollTo(0, 0));
  }
  const out = path.join(OUT_DIR, `${t.id}.png`);
  await page.screenshot({ path: out, fullPage: false });
  const stat = fs.statSync(out);
  console.log(`  -> ${out} (${(stat.size / 1024).toFixed(0)} KB)`);
}

await browser.close();
console.log(`\nDone. Raw screenshots in ${OUT_DIR}`);
