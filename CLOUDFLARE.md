# Cloudflare Pages + Astro + Sanity CMS

Use **Cloudflare Pages** (not Workers + Wrangler) for this static Astro site.

Content is edited in **Sanity Studio** — see **[SANITY.md](SANITY.md)** and **[EDITOR-CMS.md](EDITOR-CMS.md)**.

## Clean production URL (no branch name like `webflow-cleanup`)

What you see in Cloudflare is controlled in the **dashboard**, not by renaming a file in Git.

1. **Production branch** — In **Workers & Pages** → your project → **Settings** → **Builds & deployments**, set **Production branch** to **`master`**. Production builds then use the main site URL (`https://<project-name>.pages.dev`). **Preview** deployments for other branches can still show the branch name in their links; that is normal.

2. **Project name (title / default subdomain)** — In the same project, use **Rename** (or recreate the project) so the name is something like **`thevaultgym`**, matching [`wrangler.toml`](wrangler.toml) `name`. That removes an old name such as `webflow-cleanup` from the default hostname.

3. **Custom domain** — Under **Custom domains**, attach **`www.thevaultgym.co.uk`** (and/or the apex). That is what visitors should use in production; it avoids `pages.dev` entirely.

This repo’s latest work is merged into **`master`**; point Cloudflare production at **`master`** and push future changes to **`master`** (or merge into it) for the live site.

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

5. **Environment variables (required for Astro 6):** **Settings** → **Environment variables** → add **`NODE_VERSION`** = **`22`** or **`22.12.0`** for **Production** and **Preview**. Astro 6 does **not** run on Node 20 (you will see `Node.js v20.x is not supported by Astro`).
6. **Save and Deploy**.

**Important:** Do **not** set a **Deploy command** of `npx wrangler deploy`. Pages runs your build and publishes **`dist/`** automatically. The repo includes [`wrangler.toml`](wrangler.toml) with **`pages_build_output_dir`** so Cloudflare Pages reads the output directory consistently.

The root [`.node-version`](.node-version) file hints Node **22.12.0** for local tools; Cloudflare still needs **`NODE_VERSION`** set in the dashboard unless your account picks it up automatically.

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

## CMS (Sanity)

See **[SANITY.md](SANITY.md)** for Studio setup, seeding, Cloudflare env vars, and the **Publish → rebuild webhook**.

### Cloudflare environment variables (Pages project)

| Variable | Value |
|----------|--------|
| `NODE_VERSION` | `22` or `22.12.0` (required for Astro 6) |
| `SANITY_PROJECT_ID` | Sanity project id (e.g. `7jggn04g`) |
| `SANITY_DATASET` | `production` |
| `SANITY_API_READ_TOKEN` | Viewer/Editor read token (if dataset is private) |

Redeploy after adding variables.

Optional but recommended: Sanity webhook → Cloudflare **Deploy hook** so Publish rebuilds the live site (details in SANITY.md).

Local JSON files in `src/content/pages/` remain as a **build fallback** if Sanity env vars are missing. Editors should only use Sanity Studio.

---

## After edits

- **Content:** edit in Sanity → Publish → Cloudflare rebuild (via webhook or next deploy).
- **Code/layout:** push to GitHub → Pages rebuilds automatically.

Keep root `*.html` and `services/*.html` in the repo until you no longer rely on `npm run generate` for baseline content.

---

## Optional: Workers + Wrangler instead

Only if you must deploy as a Worker: build command `npm run build`, deploy `npx wrangler deploy`, and use [`wrangler.toml`](wrangler.toml) with `[assets] directory = "./dist"`. For this project, **Pages is simpler**.
