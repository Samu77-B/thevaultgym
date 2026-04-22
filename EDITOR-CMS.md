# Editing the site (Decap CMS)

The admin UI lives at **`/admin/`** on the deployed site (for example `https://www.thevaultgym.co.uk/admin/`). You must sign in with a **GitHub account that has write access** to the content repository.

## Pages list (WordPress-style)

In Decap, editors choose a page from a **fixed list** (Home, About, Contact, Services, etc.). You do **not** need to create pages or manage “slugs”.

Behind the scenes, each page is a JSON file in `src/content/pages/` that overrides the site’s default content at build time.

Those JSON files are **pre-filled** with the current hero image, main text (inside `.about-info-container`), and SEO so editors see what’s already on the site and can change it. The **right-hand “preview” pane in Decap** often stays blank or minimal (it does not render the full Astro page); use a **second browser tab** on the live site to check results after publish.

## SEO

Use the **SEO** group in Decap to set the page title and meta description. Values you set here override the defaults taken from the original HTML at build time.

## Images

- **Media library** uploads go to the repo at **`images/uploads/`** and appear on the site under **`/images/uploads/...`** after the next deploy.
- **Hero image** (optional): upload an image, then select it for **Hero image**. It applies to the large top hero: **`.section-9`** on inner pages and **`.section-3.sportssec`** on the home page (same field).

## Main page text (optional)

**Main page text** lets you edit the main text block inside **`.about-info-container`** using blocks (headings, paragraphs, bullet lists). Paragraphs that include **links** use the **Paragraph with links (HTML)** block type.

- The **home page** hero headlines and buttons are **not** in this list (they live in the page template). Use **Hero image** and **SEO** on Home; changing the big “Enter The Vault” text needs a code change or a future CMS field.
- If you **clear** the whole list, the original text from the site template is used again.

### Re-importing text from the HTML templates (developers)

After changing root `*.html` and running `npm run generate`, you can refresh CMS files from generated data with:

`npm run seed-cms`

**Warning:** this **overwrites** `src/content/pages/*.json` — do not run if you need to keep in-progress Decap edits; commit or back up first.

## After saving

Decap commits to **GitHub**. **Cloudflare Pages** rebuilds the site automatically. Allow a minute or two for the deploy, then hard-refresh the live page to see changes.

## Local editing without GitHub login

From the repository root, uncomment `local_backend: true` in `public/admin/config.yml`, run `npx decap-server`, and open the URL the CLI prints. Turn off `local_backend` before committing for production.
