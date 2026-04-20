# Editing the site (Decap CMS)

The admin UI lives at **`/admin/`** on the deployed site (for example `https://www.thevaultgym.co.uk/admin/`). You must sign in with a **GitHub account that has write access** to the content repository.

## Pages list (WordPress-style)

In Decap, editors choose a page from a **fixed list** (Home, About, Contact, Services, etc.). You do **not** need to create pages or manage “slugs”.

Behind the scenes, each page is a JSON file in `src/content/pages/` that overrides the site’s default content at build time.

## SEO

Use the **SEO** group in Decap to set the page title and meta description. Values you set here override the defaults taken from the original HTML at build time.

## Images

- **Media library** uploads go to the repo at **`images/uploads/`** and appear on the site under **`/images/uploads/...`** after the next deploy.
- **Hero image** (optional): upload an image, then select it for **Hero image**. This applies to pages that use the top **`.section-9`** hero strip (dark gradient + photo).

## Main page text (optional)

**Main page text** lets you rebuild the main text block inside **`.about-info-container`** using simple blocks (headings, paragraphs, bullet lists) **without** pasting raw HTML.

- If you fill this list, it **replaces** that main content area.
- If you leave it empty, the original text from the site template is used.

## After saving

Decap commits to **GitHub**. **Cloudflare Pages** rebuilds the site automatically. Allow a minute or two for the deploy, then hard-refresh the live page to see changes.

## Local editing without GitHub login

From the repository root, uncomment `local_backend: true` in `public/admin/config.yml`, run `npx decap-server`, and open the URL the CLI prints. Turn off `local_backend` before committing for production.
