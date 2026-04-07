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

export type PageCms = {
  wfPageId?: string;
  wfSiteId?: string;
  seo?: Record<string, string>;
  jsonLd?: string;
  headStyles?: string;
  bodyMarkup?: string;
};

export function mergePage(gen: PageGen, cms: PageCms = {}) {
  const seo = { ...gen.seo, ...(cms.seo || {}) };
  return {
    wfPage: cms.wfPageId ?? gen.wfPage,
    wfSite: cms.wfSiteId ?? gen.wfSite,
    seo,
    jsonLd: cms.jsonLd ?? gen.jsonLd,
    headExtraLinks: gen.headExtraLinks,
    stylesheetHrefs: gen.stylesheetHrefs,
    headStyles: cms.headStyles ?? gen.headStyles,
    headScripts: gen.headScripts,
    bodyMarkup: cms.bodyMarkup ?? gen.bodyMarkup,
    bodyScripts: gen.bodyScripts,
  };
}
