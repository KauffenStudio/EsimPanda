#!/usr/bin/env node
import { chromium } from 'playwright';
import path from 'node:path';
import { mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TEMPLATE_DIR = path.join(ROOT, '.planning/app-store/templates');
const OUT_DIR = path.join(ROOT, '.planning/app-store/screenshots/6.9');

// 6.9" iPhone 17 Pro Max class — Apple's 2026 primary required set.
const CANVAS_W = 1320;
const CANVAS_H = 2868;

async function run() {
  await mkdir(OUT_DIR, { recursive: true });

  const arg = process.argv[2];
  const files = (await readdir(TEMPLATE_DIR))
    .filter((f) => /^slot-\d+\.html$/.test(f))
    .sort();

  const targets = arg
    ? files.filter((f) => f === `slot-${arg}.html`)
    : files;

  if (targets.length === 0) {
    console.error('No matching templates.');
    process.exit(1);
  }

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: CANVAS_W, height: CANVAS_H },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();

  for (const file of targets) {
    const url = pathToFileURL(path.join(TEMPLATE_DIR, file)).href;
    process.stdout.write(`  ${file.padEnd(15)} ... `);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    const out = path.join(OUT_DIR, file.replace('.html', '.png'));
    await page.screenshot({ path: out, omitBackground: false, fullPage: false });
    console.log('ok');
  }

  await browser.close();
  console.log(`\nDone — ${targets.length} screenshots in ${OUT_DIR}`);
}

run().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
