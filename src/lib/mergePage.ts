import { load } from 'cheerio';

export type HeadLink = {
  rel: string;
  href: string;
  type?: string;
  sizes?: string;
  media?: string;
};

export type PageGen = {
  slug: string;
  sourceFile: string;
  wfPage: string;
  wfSite: string;
  seo: Record<string, string>;
  jsonLd: string;
  headExtraLinks: HeadLink[];
  stylesheetHrefs: string[];
  headStyles: string;
  headScripts: ScriptRec[];
  bodyMarkup: string;
  bodyScripts: ScriptRec[];
};

export type ScriptRec = {
  src?: string;
  inline?: string;
  integrity?: string;
  crossorigin?: string;
  async?: boolean;
  defer?: boolean;
  type?: string;
};

/** Structured blocks for `.about-info-container` (Vault page pattern). */
export type ContentBlock = {
  kind: 'heading' | 'tagline' | 'sectionTitle' | 'paragraph' | 'list';
  text?: string;
  /** One bullet per line when kind is `list`. */
  listText?: string;
};

export type PageCms = {
  wfPageId?: string;
  wfSiteId?: string;
  seo?: Record<string, string>;
  jsonLd?: string;
  headStyles?: string;
  bodyMarkup?: string;
  /** Public path to hero image (e.g. /images/uploads/photo.jpg). Appends CSS for `.section-9.wf-section`. */
  heroBackgroundImage?: string;
  /** When set and `bodyMarkup` is not, replaces inner HTML of `.about-info-container`. */
  contentBlocks?: ContentBlock[];
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Allow only site-relative asset paths for injected CSS `url()`. */
function sanitizePublicImagePath(p: string): string | null {
  let t = p.trim();
  if (!t.startsWith('/')) t = `/${t}`;
  if (!/^\/[\w\-./]+$/.test(t)) return null;
  if (t.includes('..')) return null;
  return t;
}

function renderContentBlocks(blocks: ContentBlock[]): string {
  const parts: string[] = [];
  for (const b of blocks) {
    const text = escapeHtml((b.text ?? '').trim());
    switch (b.kind) {
      case 'heading':
        parts.push(`<h1 class="heading">${text}</h1>`);
        break;
      case 'tagline':
        parts.push(`<h2 class="vault-page-tagline">${text}</h2>`);
        break;
      case 'sectionTitle':
        parts.push(`<h3 class="vault-page-section-title">${text}</h3>`);
        break;
      case 'paragraph':
        parts.push(`<p class="paragraph-2">${text}</p>`);
        break;
      case 'list': {
        const items = (b.listText ?? '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
          .map((item) => `<li>${escapeHtml(item)}</li>`);
        parts.push(`<ul class="vault-gym-list paragraph-2">${items.join('')}</ul>`);
        break;
      }
      default:
        break;
    }
  }
  return parts.join('\n');
}

function applyContentBlocksToAboutContainer(bodyMarkup: string, blocks: ContentBlock[]): string {
  if (!blocks.length) return bodyMarkup;
  const $ = load(bodyMarkup, { decodeEntities: false }, false);
  const container = $('.about-info-container').first();
  if (!container.length) return bodyMarkup;
  container.html(renderContentBlocks(blocks));
  return $.root().html() ?? bodyMarkup;
}

function applyHeroBackgroundImage(headStyles: string, wfPage: string, imagePath: string): string {
  const safe = sanitizePublicImagePath(imagePath);
  if (!safe) return headStyles;
  const cssUrl = safe.replace(/'/g, "\\'");
  const selector = wfPage
    ? `html[data-wf-page="${wfPage.replace(/"/g, '')}"] .section-9.wf-section`
    : `.section-9.wf-section`;
  const block = `
/* CMS: hero background */
${selector} {
  background-image: linear-gradient(180deg, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url('${cssUrl}') !important;
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
}
`;
  return `${headStyles}\n${block}`;
}

export function mergePage(gen: PageGen, cms: PageCms = {}) {
  const seo = { ...gen.seo, ...(cms.seo || {}) };
  const wfPage = cms.wfPageId ?? gen.wfPage;

  let headStyles = cms.headStyles ?? gen.headStyles;
  if (cms.heroBackgroundImage) {
    headStyles = applyHeroBackgroundImage(headStyles, wfPage, cms.heroBackgroundImage);
  }

  let bodyMarkup = cms.bodyMarkup ?? gen.bodyMarkup;
  if (!cms.bodyMarkup && cms.contentBlocks && cms.contentBlocks.length > 0) {
    bodyMarkup = applyContentBlocksToAboutContainer(bodyMarkup, cms.contentBlocks);
  }

  return {
    wfPage,
    wfSite: cms.wfSiteId ?? gen.wfSite,
    seo,
    jsonLd: cms.jsonLd ?? gen.jsonLd,
    headExtraLinks: gen.headExtraLinks,
    stylesheetHrefs: gen.stylesheetHrefs,
    headStyles,
    headScripts: gen.headScripts,
    bodyMarkup,
    bodyScripts: gen.bodyScripts,
  };
}
