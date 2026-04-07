# Cloudflare Pages + Astro + Decap CMS

## Build settings (Cloudflare dashboard)

| Setting | Value |
|--------|--------|
| Framework preset | None (or Astro if detected) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` (repository root) |

Node version: set **Environment variable** `NODE_VERSION` to `20` (or `22`) in Pages → Settings → Environment variables if the default is too old.

## What the build does

1. `npm run generate` — reads legacy `*.html` at the repo root and writes `src/generated/page-data/*.json`.
2. `npm run sync-public` — copies `css/`, `js/`, `images/`, `icons/`, `components/` into `public/` so URLs like `/css/...` and fetches to `/components/header.html` keep working.
3. `astro build` — writes static files to `dist/` with **file** URLs (`about.html`, `services/boxing.html`, etc.).

## CMS (Decap)

- Admin UI: `https://<your-pages-domain>/admin/`
- **Backend:** GitHub (see [Decap GitHub backend](https://decapcms.org/docs/github-backend/)). You need a GitHub OAuth App; Authorization callback URL must match Decap’s docs (typically `https://api.netlify.com/auth/done` is **not** used for GitHub — follow the current Decap GitHub guide for the exact callback).
- **Content files:** `src/content/pages/<slug>.json` — optional overrides for `seo`, `jsonLd`, `headStyles`, `bodyMarkup`. The `slug` field must match the file name (e.g. `about.json` → `"slug": "about"`).
- **Images:** uploads go to `images/uploads/` at the repo root (committed to Git). The next `sync-public` copies them into `public/images/uploads/` for the live site.

### Local editing without GitHub OAuth

From the repo root:

```bash
npx decap-server
```

Uncomment `local_backend: true` in `public/admin/config.yml` while testing, then point the admin at `http://localhost:8080/admin/` (see Decap local backend docs).

## After changing content

Commit changes to `src/content/pages/` and/or `images/uploads/`, push to GitHub — Cloudflare Pages rebuilds automatically.

## Legacy HTML

Keep the root-level `*.html` and `services/*.html` files in the repo; `npm run generate` depends on them until you stop regenerating and maintain content only in the CMS JSON.
