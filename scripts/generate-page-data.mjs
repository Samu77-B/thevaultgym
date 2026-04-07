/**
 * Parses legacy Webflow HTML files and writes src/generated/page-data/<slug>.json
 * for Astro static builds. Run via npm run generate.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'src', 'generated', 'page-data');

const FILES = [
  'index.html',
  'about.html',
  'contact.html',
  'join-us.html',
  'pt-consultations.html',
  'terms.html',
  'sports-specific-training.html',
  'shoreditch-gym.html',
  'privacy-policy.html',
  'nutrition.html',
  '404.html',
  'services/course-venues.html',
  'services/personal-training.html',
  'services/boxing.html',
  'services/pilates.html',
  'services/yoga.html',
];

function slugFromFile(f) {
  return f.replace(/\.html$/i, '').replace(/\//g, '-');
}

function isServicePath(f) {
  return f.startsWith('services/');
}

function normalizeUrl(href, inServices) {
  if (!href) return href;
  if (href.startsWith('http') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return href;
  }
  if (href.startsWith('/')) return href;
  if (inServices && href.startsWith('../')) {
    return '/' + href.replace(/^\.\.\//, '');
  }
  if (!inServices && !href.startsWith('/')) {
    return '/' + href.replace(/^\.\//, '');
  }
  return href;
}

function rewriteHtmlAssets(html, inServices) {
  if (!inServices) return html;
  return html
    .replace(/\.\.\/css\//g, '/css/')
    .replace(/\.\.\/js\//g, '/js/')
    .replace(/\.\.\/images\//g, '/images/')
    .replace(/\.\.\/icons\//g, '/icons/')
    .replace(/\.\.\/components\//g, '/components/')
    .replace(/url\((['"]?)\.\.\/images\//g, "url($1/images/")
    .replace(/url\((['"]?)\.\.\/css\//g, "url($1/css/");
}

function scriptRecord($, el, inServices) {
  const src = $(el).attr('src');
  const rec = {
    src: src ? normalizeUrl(src, inServices) : undefined,
    inline: undefined,
    integrity: $(el).attr('integrity') || undefined,
    crossorigin: $(el).attr('crossorigin') || undefined,
    async: el.attribs?.async !== undefined,
    defer: el.attribs?.defer !== undefined,
    type: $(el).attr('type') || undefined,
  };
  if (!src) {
    rec.inline = $(el).html() || '';
  }
  return rec;
}

function extractPage(file) {
  const abs = join(root, file);
  const raw = readFileSync(abs, 'utf8');
  const inServices = isServicePath(file);
  const $ = cheerio.load(raw, { decodeEntities: false });

  const wfPage = $('html').attr('data-wf-page') || '';
  const wfSite = $('html').attr('data-wf-site') || '';

  const seo = {
    title: $('title').first().text().trim() || '',
    description: '',
    keywords: '',
    robots: '',
    geoRegion: '',
    geoPlacename: '',
    ogTitle: '',
    ogDescription: '',
    ogType: '',
    ogUrl: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterCard: '',
  };

  $('head meta').each((_, el) => {
    const name = $(el).attr('name');
    const prop = $(el).attr('property');
    const content = $(el).attr('content');
    if (content == null) return;
    if (name === 'description') seo.description = content;
    else if (name === 'keywords') seo.keywords = content;
    else if (name === 'robots') seo.robots = content;
    else if (name === 'geo.region') seo.geoRegion = content;
    else if (name === 'geo.placename') seo.geoPlacename = content;
    else if (name === 'twitter:card') seo.twitterCard = content;
    else if (prop === 'og:title') seo.ogTitle = content;
    else if (prop === 'og:description') seo.ogDescription = content;
    else if (prop === 'og:type') seo.ogType = content;
    else if (prop === 'og:url') seo.ogUrl = content;
    else if (prop === 'og:image') seo.ogImage = normalizeUrl(content, inServices);
    else if (prop === 'twitter:title') seo.twitterTitle = content;
    else if (prop === 'twitter:description') seo.twitterDescription = content;
    else if (name === 'twitter:title') seo.twitterTitle = content;
    else if (name === 'twitter:description') seo.twitterDescription = content;
  });

  let jsonLd = '';
  $('head script[type="application/ld+json"]').each((_, el) => {
    jsonLd += $(el).html() || '';
  });

  const stylesheetHrefs = [];
  const headExtraLinks = [];
  $('head link').each((_, el) => {
    const rel = $(el).attr('rel') || '';
    const href = $(el).attr('href');
    if (!href) return;
    if (rel === 'stylesheet') {
      stylesheetHrefs.push(normalizeUrl(href, inServices));
      return;
    }
    headExtraLinks.push({
      rel,
      href: normalizeUrl(href, inServices),
      type: $(el).attr('type') || undefined,
      sizes: $(el).attr('sizes') || undefined,
      media: $(el).attr('media') || undefined,
    });
  });

  const headStyles = $('head style')
    .map((_, el) => $(el).html() || '')
    .get()
    .join('\n');

  const headScripts = [];
  $('head script').each((_, el) => {
    const type = ($(el).attr('type') || '').toLowerCase();
    if (type === 'application/ld+json') return;
    headScripts.push(scriptRecord($, el, inServices));
  });

  const bodyScripts = [];
  $('body script').each((_, el) => {
    bodyScripts.push(scriptRecord($, el, inServices));
  });
  $('body script').remove();

  let bodyMarkup = $('body').html() || '';
  bodyMarkup = rewriteHtmlAssets(bodyMarkup, inServices);

  const headStylesNorm = rewriteHtmlAssets(headStyles, inServices);

  return {
    slug: slugFromFile(file),
    sourceFile: file,
    wfPage,
    wfSite,
    seo,
    jsonLd: jsonLd.trim(),
    headExtraLinks,
    stylesheetHrefs,
    headStyles: headStylesNorm,
    headScripts,
    bodyMarkup,
    bodyScripts,
  };
}

mkdirSync(outDir, { recursive: true });

for (const file of FILES) {
  const data = extractPage(file);
  const slug = data.slug;
  writeFileSync(join(outDir, `${slug}.json`), JSON.stringify(data, null, 2), 'utf8');
  console.log('generated', slug, '<-', file);
}

console.log('Done. Wrote', FILES.length, 'files to', outDir);
