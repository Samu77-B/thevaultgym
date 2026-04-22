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
  kind: 'heading' | 'tagline' | 'sectionTitle' | 'paragraph' | 'list' | 'html';
  text?: string;
  /** For `kind: heading` — semantic level (defaults to h1). */
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** One bullet per line when kind is `list`. */
  listText?: string;
  /** Raw inner HTML (links, etc.) when kind is `html` — trusted CMS editors only. */
  html?: string;
};

export type HeroOverlayButton = {
  label: string;
  href: string;
};

export type HeroOverlay = {
  /** Centered H1 over hero image. */
  heading?: string;
  /** Centered H2 over hero image. */
  subheading?: string;
  /** Optional buttons/links shown below the text. */
  buttons?: HeroOverlayButton[];
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
  /** Optional centered hero overlay (H1/H2 + buttons). */
  heroOverlay?: HeroOverlay;
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

function sanitizeHref(raw: string): string | null {
  const t = String(raw ?? '').trim();
  if (!t) return null;
  if (/^(https?:)?\/\//i.test(t)) return t;
  if (/^(mailto:|tel:)/i.test(t)) return t;
  if (t.startsWith('/')) return t;
  if (!/^[\w\-./]+$/.test(t)) return null;
  if (t.includes('..')) return null;
  return `/${t.replace(/^\.?\//, '')}`;
}

function renderContentBlocks(blocks: ContentBlock[]): string {
  const parts: string[] = [];
  for (const b of blocks) {
    const text = escapeHtml((b.text ?? '').trim());
    switch (b.kind) {
      case 'heading': {
        const raw = (b.headingLevel ?? 'h1').toLowerCase();
        const level = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(raw) ? raw : 'h1') as
          | 'h1'
          | 'h2'
          | 'h3'
          | 'h4'
          | 'h5'
          | 'h6';
        let cls = 'heading';
        if (level === 'h2') cls = 'vault-page-tagline';
        else if (level === 'h3') cls = 'vault-page-section-title';
        else if (level !== 'h1') cls = 'vault-page-section-title';
        parts.push(`<${level} class="${cls}">${text}</${level}>`);
        break;
      }
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
      case 'html': {
        const h = (b.html ?? '').trim();
        if (!h) break;
        if (/^<p[\s>]/i.test(h)) {
          parts.push(h);
        } else {
          parts.push(`<p class="paragraph-2">${h}</p>`);
        }
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

/** Pick hero strip selector: most inner pages use `.section-9`; home uses `.section-3.sportssec`. */
function heroBackgroundSelector(bodyMarkup: string, wfPage: string): string {
  const safeWf = wfPage.replace(/"/g, '');
  if (bodyMarkup.includes('section-9') && bodyMarkup.includes('wf-section')) {
    return wfPage
      ? `html[data-wf-page="${safeWf}"] .section-9.wf-section`
      : `.section-9.wf-section`;
  }
  if (bodyMarkup.includes('section-3') && bodyMarkup.includes('sportssec')) {
    return '.section-3.sportssec';
  }
  return wfPage ? `html[data-wf-page="${safeWf}"] .section-9.wf-section` : `.section-9.wf-section`;
}

function applyHeroBackgroundImage(
  headStyles: string,
  bodyMarkup: string,
  wfPage: string,
  imagePath: string,
): string {
  const safe = sanitizePublicImagePath(imagePath);
  if (!safe) return headStyles;
  const cssUrl = safe.replace(/'/g, "\\'");
  const selector = heroBackgroundSelector(bodyMarkup, wfPage);
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

function renderHeroOverlayHtml(overlay: HeroOverlay): string {
  const heading = (overlay.heading ?? '').trim();
  const subheading = (overlay.subheading ?? '').trim();
  const buttons = (overlay.buttons ?? []).filter((b) => (b?.label ?? '').trim() && (b?.href ?? '').trim());

  if (!heading && !subheading && buttons.length === 0) return '';

  const parts: string[] = [];
  parts.push(`<div class="vault-cms-hero-overlay">`);
  parts.push(`<div class="vault-cms-hero-overlay__inner">`);
  if (heading) parts.push(`<h1 class="vault-cms-hero-overlay__h1">${escapeHtml(heading)}</h1>`);
  if (subheading) parts.push(`<h2 class="vault-cms-hero-overlay__h2">${escapeHtml(subheading)}</h2>`);
  if (buttons.length) {
    const btns = buttons
      .map((b, idx) => {
        const href = sanitizeHref(b.href);
        if (!href) return '';
        const label = escapeHtml(String(b.label).trim());
        const cls = idx === 0 ? 'hero-button primary' : 'hero-button secondary';
        return `<a class="${cls}" href="${href}">${label}</a>`;
      })
      .filter(Boolean)
      .join('');
    if (btns) parts.push(`<div class="hero-buttons vault-cms-hero-overlay__buttons">${btns}</div>`);
  }
  parts.push(`</div>`);
  parts.push(`</div>`);
  return parts.join('');
}

function heroOverlayCss(bodyMarkup: string, wfPage: string): string {
  const selector = heroBackgroundSelector(bodyMarkup, wfPage);
  return `
/* CMS: hero overlay text */
${selector} { position: relative; }
.vault-cms-hero-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: clamp(16px, 4vw, 48px);
  pointer-events: none;
}
.vault-cms-hero-overlay__inner { max-width: min(60rem, 100%); }
.vault-cms-hero-overlay__h1 {
  margin: 0 0 14px;
  color: #fff;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.15;
  font-weight: 700;
}
.vault-cms-hero-overlay__h2 {
  margin: 0 0 28px;
  color: rgba(255, 255, 255, 0.92);
  font-size: clamp(1.1rem, 2.6vw, 1.6rem);
  line-height: 1.35;
  font-weight: 500;
}
.vault-cms-hero-overlay__buttons { pointer-events: auto; }
`;
}

function applyHeroOverlay(bodyMarkup: string, wfPage: string, overlay: HeroOverlay): string {
  const html = renderHeroOverlayHtml(overlay);
  if (!html) return bodyMarkup;

  const $ = load(bodyMarkup, { decodeEntities: false }, false);

  const homeHero = $('.section-3.sportssec').first();
  if (homeHero.length) {
    const h1 = (overlay.heading ?? '').trim();
    const h2 = (overlay.subheading ?? '').trim();

    if (h1) homeHero.find('.vault-hero-title').first().text(h1);
    if (h2) homeHero.find('.vault-hero-subtitle').first().text(h2);

    const buttons = (overlay.buttons ?? []).filter((b) => (b?.label ?? '').trim() && (b?.href ?? '').trim());
    if (buttons.length) {
      // Preserve the existing visual style: update the first N existing buttons; if none exist, fall back to overlay buttons.
      const existing = homeHero.find('a.vault-logo-button');
      if (existing.length) {
        existing.each((i, el) => {
          const b = buttons[i];
          if (!b) return;
          const href = sanitizeHref(b.href);
          const label = String(b.label).trim();
          if (!href || !label) return;
          $(el).attr('href', href);
          $(el).find('.vault-button-text').first().text(label);
          $(el).attr('aria-label', label);
        });
      } else {
        homeHero.append(html);
      }
    }

    return $.root().html() ?? bodyMarkup;
  }

  const innerHero = $('.section-9.wf-section').first();
  if (innerHero.length) {
    innerHero.append(html);
    return $.root().html() ?? bodyMarkup;
  }

  // Fallback: do nothing if we can't locate a hero section reliably.
  return bodyMarkup;
}

export function mergePage(gen: PageGen, cms: PageCms = {}) {
  const seo = { ...gen.seo, ...(cms.seo || {}) };
  const wfPage = cms.wfPageId ?? gen.wfPage;

  let headStyles = cms.headStyles ?? gen.headStyles;
  if (cms.heroBackgroundImage) {
    headStyles = applyHeroBackgroundImage(headStyles, gen.bodyMarkup, wfPage, cms.heroBackgroundImage);
  }

  let bodyMarkup = cms.bodyMarkup ?? gen.bodyMarkup;
  if (!cms.bodyMarkup && cms.contentBlocks && cms.contentBlocks.length > 0) {
    bodyMarkup = applyContentBlocksToAboutContainer(bodyMarkup, cms.contentBlocks);
  }
  if (!cms.bodyMarkup && cms.heroOverlay) {
    bodyMarkup = applyHeroOverlay(bodyMarkup, wfPage, cms.heroOverlay);
    headStyles = `${headStyles}\n${heroOverlayCss(bodyMarkup, wfPage)}`;
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
