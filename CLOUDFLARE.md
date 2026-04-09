# Cloudflare Pages + Astro + Decap CMS

Use **Cloudflare Pages** (not Workers + Wrangler) for this static Astro site.

## Set up Pages (Option A) — step by step

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**.
2. Click **Create** / **Create application** → choose **Pages** (static site from Git).
3. **Connect to Git** → authorize GitHub → select repo **`Samu77-B/thevaultgym`**.
4. Configure the build:

   | Setting | Value |
   |--------|--------|
   | **Framework preset** | Astro (or **None**) |
   | **Build command** | `npm run build` |
   | **Build output directory** | `dist` |
   | **Root directory** | `/` |

5. **Environment variables** (if the build fails on Node): **Settings** → **Environment variables** → add **`NODE_VERSION`** = **`20`** (or `22`).
6. **Save and Deploy**.

**Important:** Do **not** set a **Deploy command** of `npx wrangler deploy`. Pages runs your build and publishes **`dist/`** automatically. The file [`wrangler.toml`](wrangler.toml) in this repo is **ignored by Pages**; you can leave it or delete it later.

### If you already created a Worker for this site

Keep the **Pages** project separate. Either:

- Use a slightly different Pages project name (e.g. `thevaultgym-site`), or  
- Stop using the old Worker build that ran `npx wrangler deploy` so you are not maintaining two deploys.

---

## What `npm run build` does

1. **`npm run generate`** — reads legacy `*.html` at the repo root → `src/generated/page-data/*.json` (gitignored; recreated every build).
2. **`npm run sync-public`** — copies `css/`, `js/`, `images/`, `icons/`, `components/` → `public/`.
3. **`astro build`** — outputs static files to **`dist/`** (`about.html`, `services/boxing.html`, etc.).

---

## CMS (Decap)

- Admin: `https://<your-pages-domain>/admin/`
- **Backend:** [Decap GitHub backend](https://decapcms.org/docs/github-backend/) (OAuth app on GitHub).
- **Content:** `src/content/pages/<slug>.json` — overrides `seo`, `jsonLd`, `headStyles`, `bodyMarkup`. **`slug`** must match the filename (e.g. `about.json` → `"slug": "about"`).
- **Uploads:** repo root `images/uploads/` → synced into the site on build.

Local CMS without OAuth: uncomment `local_backend: true` in `public/admin/config.yml`, run `npx decap-server`, open the URL Decap prints.

---

## After edits

Push to GitHub → Pages rebuilds automatically.

Keep root `*.html` and `services/*.html` in the repo until you no longer rely on `npm run generate` for baseline content.

---

## Optional: Workers + Wrangler instead

Only if you must deploy as a Worker: build command `npm run build`, deploy `npx wrangler deploy`, and use [`wrangler.toml`](wrangler.toml) with `[assets] directory = "./dist"`. For this project, **Pages is simpler**.
