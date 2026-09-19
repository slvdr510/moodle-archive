import { execFileSync } from 'node:child_process';

const sizes = [16, 32, 48, 128];
const svg = new URL('../src/icons/icon.svg', import.meta.url).pathname;

for (const size of sizes) {
  const out = new URL(`../src/icons/icon${size}.png`, import.meta.url).pathname;
  execFileSync('rsvg-convert', ['-w', String(size), '-h', String(size), svg, '-o', out]);
}

console.log(`Rendered icon.svg into ${sizes.length} PNGs (${sizes.join(', ')}px)`);
