/**
 * Seed Sanity with current src/content/pages/*.json overlays.
 *
 * Requires:
 *   SANITY_PROJECT_ID
 *   SANITY_DATASET=production
 *   SANITY_API_WRITE_TOKEN  (Editor or Admin token with create/update)
 *
 * Usage (from repo root):
 *   node --env-file=.env scripts/seed-sanity-from-json.mjs
 */
import { createClient } from '@sanity/client';
import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const pagesDir = join(root, 'src', 'content', 'pages');

const projectId = (process.env.SANITY_PROJECT_ID || '').trim();
const dataset = (process.env.SANITY_DATASET || 'production').trim();
const token = (process.env.SANITY_API_WRITE_TOKEN || '').trim();

if (!projectId || projectId === 'YOUR_PROJECT_ID') {
  console.error('Set SANITY_PROJECT_ID in .env');
  process.exit(1);
}
if (!token) {
  console.error('Set SANITY_API_WRITE_TOKEN in .env (Sanity → API → Tokens → Add API token with Editor)');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-01-01',
  token,
  useCdn: false,
});

const TITLE_BY_SLUG = {
  index: 'Home',
  about: 'About',
  contact: 'Contact',
  'train-for-a-living': 'Work With Us',
  'train-with-a-pro': 'Train With Us',
  'pt-consultations': 'Specialist Services',
  'shoreditch-gym': 'Shoreditch Gym',
  'sports-specific-training': 'Sports Specific Training',
  nutrition: 'Nutrition',
  'services-personal-training': 'Services — Personal Training',
  'services-boxing': 'Services — Boxing',
  'services-heavy-weights': 'Services — Heavy Weights',
  'services-hyrox': 'Services — HYROX',
  'services-muay-thai': 'Services — Muay Thai',
  'services-pilates': 'Services — Pilates',
  'services-yoga': 'Services — Yoga',
  'services-course-venues': 'Services — Course Venues',
  terms: 'Terms',
  'privacy-policy': 'Privacy Policy',
};

function toDoc(slug, json) {
  const title = TITLE_BY_SLUG[slug] || slug;
  const doc = {
    _id: `page.${slug}`,
    _type: 'page',
    title,
    slug,
    paragraphColumns: json.paragraphColumns === true,
  };

  if (json.heroBackgroundImage) {
    doc.heroImagePath = json.heroBackgroundImage;
  }

  if (json.heroOverlay) {
    doc.heroOverlay = {
      heading: json.heroOverlay.heading || '',
      subheading: json.heroOverlay.subheading || '',
      buttons: (json.heroOverlay.buttons || []).map((b) => ({
        _type: 'heroButton',
        _key: Math.random().toString(36).slice(2, 10),
        label: b.label || '',
        href: b.href || '',
      })),
    };
  }

  if (Array.isArray(json.contentBlocks) && json.contentBlocks.length) {
    doc.contentBlocks = json.contentBlocks.map((b) => ({
      _type: 'contentBlock',
      _key: Math.random().toString(36).slice(2, 10),
      kind: b.kind,
      text: b.text || '',
      href: b.href || '',
      headingLevel: b.headingLevel || 'h1',
      html: b.html || '',
      listText: b.listText || '',
    }));
  }

  if (json.seo) {
    doc.seo = {
      title: json.seo.title || '',
      description: json.seo.description || '',
      ogImage: json.seo.ogImage || '',
    };
  }

  return doc;
}

const files = (await readdir(pagesDir)).filter((f) => f.endsWith('.json'));
console.log(`Seeding ${files.length} pages into Sanity project ${projectId}/${dataset}…`);

const tx = client.transaction();
for (const file of files) {
  const slug = file.replace(/\.json$/, '');
  const raw = await readFile(join(pagesDir, file), 'utf8');
  const json = JSON.parse(raw);
  const doc = toDoc(slug, json);
  tx.createOrReplace(doc);
  console.log('  +', doc.title, `(${slug})`);
}

await tx.commit();
console.log('Done. Open Sanity Studio and publish each page (or bulk publish).');
