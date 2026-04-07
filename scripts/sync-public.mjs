/**
 * Copies static assets into public/ for Astro + Decap admin.
 */
import { cpSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const pub = join(root, 'public');

const dirs = ['css', 'js', 'images', 'icons', 'components'];

mkdirSync(pub, { recursive: true });

for (const d of dirs) {
  const src = join(root, d);
  const dest = join(pub, d);
  if (!existsSync(src)) {
    console.warn('skip missing', d);
    continue;
  }
  cpSync(src, dest, { recursive: true });
  console.log('copied', d, '-> public/' + d);
}

console.log('sync-public done');
