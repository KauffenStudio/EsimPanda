import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'public/bambu/Logo Esim Panda.png');
const OUT = path.join(ROOT, 'public');

const BRAND_BLUE = { r: 41, g: 121, b: 255, alpha: 1 };
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

async function squareCrop(srcPath) {
  const { width, height } = await sharp(srcPath).metadata();
  const side = Math.min(width, height);
  const left = Math.floor((width - side) / 2);
  // 1.0 = bottom-aligned crop. Drops the empty space above the panda's head
  // so the full body (including feet) fits in the square.
  const top = Math.floor((height - side) * 1.0);
  return sharp(srcPath).extract({ left, top, width: side, height: side }).toBuffer();
}

async function makeStandardIcon(squareBuf, size, outPath, bg) {
  await sharp({
    create: { width: size, height: size, channels: 4, background: bg },
  })
    .composite([{ input: await sharp(squareBuf).resize(size, size).toBuffer() }])
    .png()
    .toFile(outPath);
  console.log(`✓ ${path.basename(outPath)} (${size}×${size})`);
}

async function makeMaskableIcon(squareBuf, size, outPath, bg) {
  const safeZone = Math.round(size * 0.78);
  const offset = Math.round((size - safeZone) / 2);
  await sharp({
    create: { width: size, height: size, channels: 4, background: bg },
  })
    .composite([
      {
        input: await sharp(squareBuf).resize(safeZone, safeZone).toBuffer(),
        top: offset,
        left: offset,
      },
    ])
    .png()
    .toFile(outPath);
  console.log(`✓ ${path.basename(outPath)} (${size}×${size}, maskable, 78% safe zone)`);
}

async function main() {
  console.log(`Source: ${path.relative(ROOT, SRC)}`);
  const square = await squareCrop(SRC);
  const meta = await sharp(square).metadata();
  console.log(`Cropped to square: ${meta.width}×${meta.height}\n`);

  await makeStandardIcon(square, 192, path.join(OUT, 'icon-192x192.png'), WHITE);
  await makeStandardIcon(square, 512, path.join(OUT, 'icon-512x512.png'), WHITE);
  await makeMaskableIcon(square, 512, path.join(OUT, 'icon-512x512-maskable.png'), BRAND_BLUE);
  await makeStandardIcon(square, 1024, path.join(OUT, 'icon-1024x1024.png'), BRAND_BLUE);

  console.log(`\nDone. Output in ${path.relative(ROOT, OUT)}/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
