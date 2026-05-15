import sharp from 'sharp';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dirs = [
  'public/vitrine/hanger',
  'public/vitrine/square',
];

let totalBefore = 0;
let totalAfter = 0;

for (const dir of dirs) {
  const files = readdirSync(dir).filter((f) => f.endsWith('.png'));
  for (const f of files) {
    const src = join(dir, f);
    const out = join(dir, f.replace(/\.png$/, '.webp'));
    const before = statSync(src).size;
    totalBefore += before;
    await sharp(src)
      .resize(640, 640, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(out);
    const after = statSync(out).size;
    totalAfter += after;
    const pct = ((1 - after / before) * 100).toFixed(1);
    console.log(`${f}: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB (-${pct}%)`);
  }
}

console.log(`\nTotal: ${(totalBefore / 1024 / 1024).toFixed(1)}MB → ${(totalAfter / 1024 / 1024).toFixed(1)}MB`);
