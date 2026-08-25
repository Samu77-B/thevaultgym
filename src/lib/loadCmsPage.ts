import type { ContentBlock, HeroOverlay, PageCms } from './mergePage';
import { getSanityClient, isSanityConfigured, sanityImageUrl } from './sanityClient';

type SanityContentBlock = {
  kind?: string;
  text?: string;
  href?: string;
  headingLevel?: string;
  html?: string;
  listText?: string;
};

type SanityPageDoc = {
  title?: string;
  slug?: string;
  paragraphColumns?: boolean;
  heroBackgroundImage?: { asset?: { _ref?: string } } | null;
  heroImagePath?: string | null;
  heroOverlay?: {
    heading?: string;
    subheading?: string;
    buttons?: { label?: string; href?: string }[];
  } | null;
  contentBlocks?: SanityContentBlock[] | null;
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
  } | null;
};

function mapBlocks(blocks: SanityContentBlock[] | null | undefined): ContentBlock[] | undefined {
  if (!blocks?.length) return undefined;
  const out: ContentBlock[] = [];
  for (const b of blocks) {
    const kind = (b.kind || '').trim() as ContentBlock['kind'];
    if (!['heading', 'tagline', 'sectionTitle', 'paragraph', 'list', 'html'].includes(kind)) continue;
    const block: ContentBlock = { kind };
    if (b.text) block.text = b.text;
    if (b.href) block.href = b.href;
    if (b.headingLevel) {
      const hl = b.headingLevel.toLowerCase();
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(hl)) {
        block.headingLevel = hl as ContentBlock['headingLevel'];
      }
    }
    if (b.html) block.html = b.html;
    if (b.listText) block.listText = b.listText;
    out.push(block);
  }
  return out.length ? out : undefined;
}

function mapOverlay(raw: SanityPageDoc['heroOverlay']): HeroOverlay | undefined {
  if (!raw) return undefined;
  const heading = (raw.heading || '').trim();
  const subheading = (raw.subheading || '').trim();
  const buttons = (raw.buttons || [])
    .filter((b) => (b?.label || '').trim() && (b?.href || '').trim())
    .map((b) => ({ label: String(b.label).trim(), href: String(b.href).trim() }));
  if (!heading && !subheading && !buttons.length) return undefined;
  return { heading: heading || undefined, subheading: subheading || undefined, buttons: buttons.length ? buttons : undefined };
}

/** Convert a Sanity `page` document into the existing PageCms shape used by mergePage. */
export function sanityDocToPageCms(doc: SanityPageDoc): PageCms {
  const fromUpload = sanityImageUrl(doc.heroBackgroundImage || undefined);
  const legacyPath = (doc.heroImagePath || '').trim();
  const heroBackgroundImage = fromUpload || legacyPath || undefined;

  const seo: Record<string, string> = {};
  if (doc.seo?.title) seo.title = doc.seo.title;
  if (doc.seo?.description) seo.description = doc.seo.description;
  if (doc.seo?.ogImage) seo.ogImage = doc.seo.ogImage;

  const cms: PageCms = {};
  if (heroBackgroundImage) cms.heroBackgroundImage = heroBackgroundImage;
  const overlay = mapOverlay(doc.heroOverlay);
  if (overlay) cms.heroOverlay = overlay;
  const blocks = mapBlocks(doc.contentBlocks);
  if (blocks) cms.contentBlocks = blocks;
  if (doc.paragraphColumns === true) cms.paragraphColumns = true;
  if (Object.keys(seo).length) cms.seo = seo;
  return cms;
}

const PAGE_QUERY = `*[_type == "page" && slug == $slug][0]{
  title,
  slug,
  paragraphColumns,
  heroBackgroundImage,
  heroImagePath,
  heroOverlay,
  contentBlocks,
  seo
}`;

/**
 * Load CMS overlay for a page slug.
 * Prefer Sanity when SANITY_PROJECT_ID is set; otherwise use local JSON (Decap / fallback).
 */
export async function loadCmsPage(slug: string, jsonFallback: PageCms = {}): Promise<PageCms> {
  if (!isSanityConfigured()) {
    console.warn(`[cms] SANITY_PROJECT_ID not set — using local JSON for "${slug}"`);
    return jsonFallback;
  }

  const client = getSanityClient();
  if (!client) {
    console.warn(`[cms] Sanity client missing — using local JSON for "${slug}"`);
    return jsonFallback;
  }

  try {
    const doc = await client.fetch<SanityPageDoc | null>(PAGE_QUERY, { slug });
    if (!doc) {
      console.warn(`[cms] No Sanity page for slug "${slug}" — using local JSON fallback`);
      return jsonFallback;
    }
    console.log(`[cms] Sanity OK for "${slug}"`);
    return sanityDocToPageCms(doc);
  } catch (err) {
    console.warn(`[cms] Sanity fetch failed for "${slug}" — using local JSON fallback`, err);
    return jsonFallback;
  }
}
