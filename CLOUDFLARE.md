# Cloudflare Pages + Astro + Decap CMS

Use **Cloudflare Pages** (not Workers + Wrangler) for this static Astro site.

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

## CMS (Decap)

- Admin: `https://www.thevaultgym.co.uk/admin/` (or your Pages hostname).
- **Backend:** [Decap GitHub backend](https://decapcms.org/docs/github-backend/). This repo uses **Cloudflare Pages Functions** at [`functions/api/auth.js`](functions/api/auth.js) and [`functions/api/callback.js`](functions/api/callback.js) so GitHub OAuth works without Netlify (pattern from [i40west/netlify-cms-cloudflare-pages](https://github.com/i40west/netlify-cms-cloudflare-pages)).

### GitHub OAuth App (required for production `/admin/`)

1. GitHub → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**.
2. **Homepage URL:** `https://www.thevaultgym.co.uk` (or your production site URL).
3. **Authorization callback URL:** `https://www.thevaultgym.co.uk/api/callback` — must match the deployed origin because the Functions use `redirect_uri = <origin>/api/callback`. For **preview** deployments (`*.pages.dev`), add a second callback URL for each preview host you use (GitHub allows multiple callback URLs on one OAuth app), or use [local backend](EDITOR-CMS.md) while testing.
4. Copy the **Client ID** and generate a **Client secret**.

### Cloudflare environment variables (Pages project)

In **Workers & Pages** → your project → **Settings** → **Environment variables**, add for **Production** (and **Preview** if editors use preview URLs):

| Variable | Value |
|----------|--------|
| `NODE_VERSION` | `22` or `22.12.0` (required for Astro 6) |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client secret (treat as secret / encrypted) |

Redeploy after adding variables so **Functions** pick them up.

[`public/admin/config.yml`](public/admin/config.yml) sets `site_domain`, `base_url`, and `auth_endpoint: /api/auth` for production. If the canonical domain changes, update those URLs to match.

### Content and uploads

- **Content:** `src/content/pages/<slug>.json` — merges with generated page data; see [EDITOR-CMS.md](EDITOR-CMS.md) for slugs, SEO, structured blocks, and overrides.
- **Uploads:** repo root `images/uploads/` → copied into the site on build via `sync-public`.

Local CMS without OAuth: uncomment `local_backend: true` in `public/admin/config.yml`, run `npx decap-server`, open the URL Decap prints.

---

## Troubleshooting: 404 on `/admin` or the CMS

1. **Use a trailing slash:** Open **`https://www.thevaultgym.co.uk/admin/`** (with `/` at the end). The repo includes [`public/_redirects`](public/_redirects) so **`/admin`** redirects to **`/admin/`** after deploy.
2. **Production branch:** Cloudflare must build the branch that contains **`public/admin/`** (see `git ls-files public/admin`). If production only tracks **`master`**, merge your feature branch into **`master`** and wait for the deployment to finish.
3. **Not the Pages build:** If the custom domain points at an old **Worker** or another host, you may get the site’s **404.html** for `/admin/`. Confirm **DNS** for `www.thevaultgym.co.uk` targets the **Pages** project shown in the dashboard.
4. **OAuth 404:** Login uses **`/api/auth`** and **`/api/callback`** (Pages **Functions** in [`functions/api/`](functions/api)). If those return 404, the Functions bundle may not be deploying — confirm the repo includes the **`functions/`** folder and redeploy; set **`GITHUB_CLIENT_ID`** / **`GITHUB_CLIENT_SECRET`** on the project.

---

## After edits

Push to GitHub → Pages rebuilds automatically.

Keep root `*.html` and `services/*.html` in the repo until you no longer rely on `npm run generate` for baseline content.

---

## Optional: Workers + Wrangler instead

Only if you must deploy as a Worker: build command `npm run build`, deploy `npx wrangler deploy`, and use [`wrangler.toml`](wrangler.toml) with `[assets] directory = "./dist"`. For this project, **Pages is simpler**.
