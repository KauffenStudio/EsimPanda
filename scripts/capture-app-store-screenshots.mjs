#!/usr/bin/env node
import { chromium } from 'playwright';
import path from 'node:path';
import { mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TEMPLATE_DIR = path.join(ROOT, '.planning/app-store/templates');
const SHOT_DIR = path.join(ROOT, '.planning/app-store/screenshots');

// Canvas profiles by template prefix.
// iPhone 6.9" (1320x2868) is Apple's primary required set; iPad 13" (2064x2752).
const PROFILES = {
  phone: { w: 1320, h: 2868, out: '6.9' },
  ipad: { w: 2064, h: 2752, out: 'ipad-13' },
};

function profileFor(file) {
  return file.startsWith('ipad-') ? PROFILES.ipad : PROFILES.phone;
}

async function run() {
  const arg = process.argv[2];
  const files = (await readdir(TEMPLATE_DIR))
    .filter((f) => /^(slot|lifestyle|ipad)-\d+\.html$/.test(f))
    .sort();

  const targets = arg
    ? files.filter((f) => f.endsWith(`-${arg}.html`))
    : files;

  if (targets.length === 0) {
    console.error('No matching templates.');
    process.exit(1);
  }

  const browser = await chromium.launch();
  let count = 0;

  for (const file of targets) {
    const prof = profileFor(file);
    const outDir = path.join(SHOT_DIR, prof.out);
    await mkdir(outDir, { recursive: true });

    const ctx = await browser.newContext({
      viewport: { width: prof.w, height: prof.h },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    const url = pathToFileURL(path.join(TEMPLATE_DIR, file)).href;
    process.stdout.write(`  ${file.padEnd(16)} ${prof.w}x${prof.h} ... `);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    const out = path.join(outDir, file.replace('.html', '.png'));
    await page.screenshot({ path: out, omitBackground: false, fullPage: false });
    await ctx.close();
    console.log('ok');
    count++;
  }

  await browser.close();
  console.log(`\nDone — ${count} screenshots`);
}

run().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
