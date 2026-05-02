import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'public/bambu/Logo Esim Panda.png');
const OUT = path.join(ROOT, 'public');

// Pad the source horizontally to a square by extending edge pixels.
// extendWith: 'copy' replicates the existing gray-gradient bg outward
// so there's no visible seam.
async function padToSquare(srcPath) {
  const { width, height } = await sharp(srcPath).metadata();
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
      extendWith: 'copy',
    })
    .toBuffer();
}

async function makeIcon(squareBuf, size, outPath) {
  await sharp(squareBuf).resize(size, size).png().toFile(outPath);
  console.log(`✓ ${path.basename(outPath)} (${size}×${size})`);
}

async function main() {
  console.log(`Source: ${path.relative(ROOT, SRC)}`);
  const square = await padToSquare(SRC);
  const meta = await sharp(square).metadata();
  console.log(`Padded to square: ${meta.width}×${meta.height}\n`);

  await makeIcon(square, 192, path.join(OUT, 'icon-192x192.png'));
  await makeIcon(square, 512, path.join(OUT, 'icon-512x512.png'));
  await makeIcon(square, 512, path.join(OUT, 'icon-512x512-maskable.png'));
  await makeIcon(square, 1024, path.join(OUT, 'icon-1024x1024.png'));

  console.log(`\nDone. Output in ${path.relative(ROOT, OUT)}/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
