/**
 * Quick Sanity → site wiring test.
 * Usage: node --env-file=.env scripts/test-sanity-connection.mjs
 */
import { createClient } from '@sanity/client';

const projectId = (process.env.SANITY_PROJECT_ID || '').trim();
const dataset = (process.env.SANITY_DATASET || 'production').trim();
const token = (
  process.env.SANITY_API_READ_TOKEN ||
  process.env.SANITY_API_WRITE_TOKEN ||
  ''
).trim();

console.log('--- Sanity connection test ---');
console.log('PROJECT_ID:', projectId || '(missing)');
console.log('DATASET:', dataset);
console.log('TOKEN:', token ? 'present' : 'none (public dataset only)');

if (!projectId || projectId === 'YOUR_PROJECT_ID') {
  console.error('FAIL: SANITY_PROJECT_ID not set');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-01-01',
  useCdn: false,
  token: token || undefined,
});

const pages = await client.fetch(
  `*[_type == "page"] | order(title asc) {
    _id,
    title,
    slug,
    "isDraft": _id in path("drafts.**"),
    "hasOverlayHeading": defined(heroOverlay.heading),
    "overlayHeading": heroOverlay.heading,
    "seoTitle": seo.title
  }`,
);

const published = pages.filter((p) => !p.isDraft);
const drafts = pages.filter((p) => p.isDraft);

console.log('\nDocuments found:', pages.length);
console.log('Published:', published.length);
console.log('Drafts only:', drafts.length);

console.log('\nPublished pages:');
for (const p of published) {
  console.log(
    `  - ${p.title} (${p.slug}) overlay="${p.overlayHeading || ''}" seo="${p.seoTitle || ''}"`,
  );
}

if (drafts.length) {
  console.log('\nDrafts (NOT used by the live site until you click Publish):');
  for (const p of drafts) {
    console.log(`  - ${p.title} (${p.slug}) id=${p._id}`);
  }
}

const about = await client.fetch(
  `*[_type == "page" && slug == "about" && !(_id in path("drafts.**"))][0]{
    title, slug, heroOverlay, seo
  }`,
);

console.log('\nAbout (published only):');
console.log(about ? JSON.stringify(about, null, 2) : 'NONE — About is not published (or missing)');

if (!published.length) {
  console.log('\nRESULT: No published pages. Open Studio → open each page → Publish.');
  process.exit(2);
}

console.log('\nRESULT: Sanity has published content. If live site still old:');
console.log('  1) Cloudflare must have SANITY_PROJECT_ID=7jggn04g + SANITY_DATASET=production');
console.log('  2) Trigger a new Cloudflare deploy after setting env vars');
console.log('  3) Optional: Sanity webhook → Cloudflare deploy hook for Publish');
