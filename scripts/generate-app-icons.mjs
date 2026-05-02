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
  const img = sharp(srcPath);
  const { width, height } = await img.metadata();
  // Sample top-left pixel to use as padding color (matches the gray gradient bg).
  const { data } = await sharp(srcPath)
    .extract({ left: 0, top: 0, width: 4, height: 4 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const [r, g, b] = [data[0], data[1], data[2]];
  const side = Math.max(width, height);
  const padLeft = Math.floor((side - width) / 2);
  const padRight = side - width - padLeft;
  const padTop = Math.floor((side - height) / 2);
  const padBottom = side - height - padTop;
  return sharp(srcPath)
    .extend({
      top: padTop,
      bottom: padBottom,
      left: padLeft,
      right: padRight,
      background: { r, g, b, alpha: 1 },
    })
    .toBuffer();
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
