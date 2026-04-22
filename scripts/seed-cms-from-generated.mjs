/**
 * One-way sync: fills src/content/pages/<slug>.json from src/generated/page-data/<slug>.json
 * so Decap shows existing title, hero image, main text, and SEO. Run after `npm run generate`.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const genDir = join(root, 'src', 'generated', 'page-data');
const cmsDir = join(root, 'src', 'content', 'pages');

/** Same slugs as scripts/generate-page-data.mjs (skip 404). */
const SLUGS = [
  'index',
  'about',
  'contact',
  'train-for-a-living',
  'train-with-a-pro',
  'pt-consultations',
  'terms',
  'sports-specific-training',
  'shoreditch-gym',
  'privacy-policy',
  'nutrition',
  'services-course-venues',
  'services-personal-training',
  'services-boxing',
  'services-pilates',
  'services-yoga',
];

function normalizeImagePath(raw) {
  let p = String(raw).trim().replace(/^['"]|['"]$/g, '');
  if (!p || /^https?:\/\//i.test(p)) return null;
  if (!p.startsWith('/')) p = `/${p.replace(/^\/?/, '')}`;
  if (!p.startsWith('/images/')) {
    p = `/images/${p.replace(/^\/images\//, '')}`;
  }
  return p;
}

function extractHeroImage(headStyles, bodyMarkup) {
  if (!headStyles) return null;
  const blocks = [];
  const m9 = headStyles.match(/html\[[^\]]+\]\s*\.section-9\.wf-section\s*\{[^}]*\}/s);
  const m9b = headStyles.match(/\.section-9\.wf-section\s*\{[^}]*\}/s);
  if (m9) blocks.push(m9[0]);
  else if (m9b) blocks.push(m9b[0]);
  if (bodyMarkup.includes('section-3') && bodyMarkup.includes('sportssec')) {
    const m3 = headStyles.match(/\.section-3\.sportssec\s*\{[^}]*\}/s);
    if (m3) blocks.push(m3[0]);
  }
  for (const block of blocks) {
    const urls = [...block.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)].map((x) => x[1].trim());
    const img = urls.find(
      (u) =>
        /\.(png|jpe?g|webp|svg)$/i.test(u) &&
        !/gradient|^rgba|^http/i.test(u),
    );
    if (img) return normalizeImagePath(img);
  }
  return null;
}

function containerToBlocks(bodyMarkup) {
  const $ = cheerio.load(bodyMarkup, { decodeEntities: false });
  const container = $('.about-info-container').first();
  if (!container.length) return [];

  const blocks = [];
  container.children().each((_, el) => {
    const $el = $(el);
    const tag = el.tagName?.toLowerCase() ?? '';

    if (tag === 'h1' || $el.hasClass('heading')) {
      blocks.push({ kind: 'heading', text: $el.text().trim(), headingLevel: 'h1' });
      return;
    }
    if (tag === 'h2' || $el.hasClass('vault-page-tagline')) {
      blocks.push({ kind: 'tagline', text: $el.text().trim() });
      return;
    }
    if (tag === 'h3' || $el.hasClass('vault-page-section-title')) {
      blocks.push({ kind: 'sectionTitle', text: $el.text().trim() });
      return;
    }
    if (tag === 'p') {
      const inner = ($el.html() ?? '').trim();
      if (/<[a-z][\s\S]*>/i.test(inner)) {
        blocks.push({ kind: 'html', html: inner });
      } else {
        blocks.push({ kind: 'paragraph', text: $el.text().trim() });
      }
      return;
    }
    if (tag === 'ul') {
      const lines = $el
        .find('li')
        .map((_, li) => $(li).text().trim())
        .get()
        .filter(Boolean)
        .join('\n');
      blocks.push({ kind: 'list', listText: lines });
    }
  });

  return blocks;
}

function pickSeo(seo) {
  const out = {};
  if (seo.title?.trim()) out.title = seo.title.trim();
  if (seo.description?.trim()) out.description = seo.description.trim();
  if (seo.ogImage?.trim()) out.ogImage = seo.ogImage.trim();
  return out;
}

mkdirSync(cmsDir, { recursive: true });

for (const slug of SLUGS) {
  const genPath = join(genDir, `${slug}.json`);
  const cmsPath = join(cmsDir, `${slug}.json`);
  const gen = JSON.parse(readFileSync(genPath, 'utf8'));

  const heroBackgroundImage = extractHeroImage(gen.headStyles ?? '', gen.bodyMarkup ?? '');
  const contentBlocks = containerToBlocks(gen.bodyMarkup ?? '');
  const seo = pickSeo(gen.seo ?? {});

  const cms = {};
  if (heroBackgroundImage) cms.heroBackgroundImage = heroBackgroundImage;
  if (contentBlocks.length) cms.contentBlocks = contentBlocks;
  if (Object.keys(seo).length) cms.seo = seo;

  writeFileSync(cmsPath, `${JSON.stringify(cms, null, 2)}\n`, 'utf8');
  console.log('seeded', slug, '->', cmsPath);
}

console.log('Done. Seeded', SLUGS.length, 'CMS overlay files.');
