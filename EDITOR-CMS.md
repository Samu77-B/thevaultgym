# Editing the site (Decap CMS)

The admin UI lives at **`/admin/`** on the deployed site (for example `https://www.thevaultgym.co.uk/admin/`). You must sign in with a **GitHub account that has write access** to the content repository.

## Slugs and files

- Each page entry is a JSON file: `src/content/pages/<slug>.json`.
- The **`slug`** field inside the file must match the filename **without** `.json`.
- Slugs are derived from the legacy HTML paths (see `scripts/generate-page-data.mjs`):

  | Page URL | Slug (filename) |
  |----------|-------------------|
  | `/about.html` | `about` |
  | `/services/boxing.html` | `services-boxing` |
  | `/train-for-a-living.html` | `train-for-a-living` |

Create a new file in Decap only if that slug already has a matching Astro route (otherwise the build will not expose that URL).

## SEO

Use the **SEO** group in Decap to set title, meta description, Open Graph, and Twitter fields. Values you set here override the defaults taken from the original HTML at build time.

## Images

- **Media library** uploads go to the repo at **`images/uploads/`** and appear on the site under **`/images/uploads/...`** after the next deploy.
- **Hero background image** (optional): upload an image, then select it for **Hero background image**. This applies to pages that use the top **`.section-9`** hero strip (dark gradient + photo). It does not replace inline images inside article HTML unless you also edit the body.

## Structured main content (optional)

**Structured main content** lets you rebuild the main text block inside **`.about-info-container`** using simple blocks (headings, paragraphs, bullet lists) **without** pasting raw HTML.

- If you fill this list, it **replaces** that main content area.
- If you leave it empty, the original text from the site template is used.
- **Body HTML override** (advanced) still wins: if that field is set, it replaces the entire body HTML and structured blocks are ignored.

## Advanced overrides

- **Head CSS override**: replaces the page’s inline `<style>` block from the template. Use only if you need full control (for example swapping a `background-image` URL by hand).
- **Body HTML override**: replaces everything inside the page layout’s body wrapper. Copy from the baseline HTML or from a developer if you use this.
- **JSON-LD override**: replaces structured data JSON for the page.

## After saving

Decap commits to **GitHub**. **Cloudflare Pages** rebuilds the site automatically. Allow a minute for the build, then hard-refresh the live page to see changes.

## Local editing without GitHub login

From the repository root, uncomment `local_backend: true` in `public/admin/config.yml`, run `npx decap-server`, and open the URL the CLI prints. Turn off `local_backend` before committing for production.
