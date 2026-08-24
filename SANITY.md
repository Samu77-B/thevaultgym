# Sanity CMS (Cloudflare Pages)

The Vault site stays on **Cloudflare Pages**. Editors use **Sanity Studio** (no GitHub login).

Until `SANITY_PROJECT_ID` is set, the site keeps using the existing Decap JSON files in `src/content/pages/`.

## 1. Create a Sanity project

1. Go to [https://www.sanity.io/get-started](https://www.sanity.io/get-started) and create a free project (e.g. **The Vault Gym**).
2. Note the **Project ID** and use dataset **`production`**.
3. In Sanity → **API** → **Tokens**:
   - **Viewer** (or Editor) token for builds → `SANITY_API_READ_TOKEN` (optional if dataset is public)
   - **Editor** token for seeding → `SANITY_API_WRITE_TOKEN` (local only; do not put write token in Cloudflare)

## 2. Configure this repo

Root `.env` (local):

```env
SANITY_PROJECT_ID=yourProjectId
SANITY_DATASET=production
SANITY_API_READ_TOKEN=
SANITY_API_WRITE_TOKEN=
SANITY_STUDIO_PROJECT_ID=yourProjectId
SANITY_STUDIO_DATASET=production
```

Studio uses the same project — also set in `studio/.env`:

```env
SANITY_STUDIO_PROJECT_ID=yourProjectId
SANITY_STUDIO_DATASET=production
```

Or replace `YOUR_PROJECT_ID` in `studio/sanity.config.ts` / `studio/sanity.cli.ts`.

## 3. Install & run Studio

```bash
cd studio
npm install
npm run dev
```

Open the URL printed (usually `http://localhost:3333`). Sign in with the Sanity account that owns the project.

Invite your client: Sanity manage → **Members** → invite by email as **Editor**.

## 4. Seed current page content

From the **repo root** (with write token in `.env`):

```bash
npm install
node --env-file=.env scripts/seed-sanity-from-json.mjs
```

Then in Studio, open each page and click **Publish** (seeded docs may start as drafts depending on workflow).

## 5. Cloudflare Pages env vars

In Cloudflare → Pages → your project → **Settings** → **Environment variables** (Production + Preview):

| Name | Value |
|------|--------|
| `SANITY_PROJECT_ID` | your project id |
| `SANITY_DATASET` | `production` |
| `SANITY_API_READ_TOKEN` | viewer/editor read token (if dataset is private) |

Redeploy after saving.

## 6. Publish → live site (webhook)

Without this, Publish updates Sanity only; the static site waits for the next Cloudflare build.

1. Cloudflare Pages → **Settings** → **Builds & deployments** → **Deploy hooks** → create hook (e.g. “Sanity publish”).
2. Copy the hook URL.
3. Sanity → **API** → **Webhooks** → create webhook:
   - URL: the Cloudflare deploy hook
   - Trigger on: **Create / Update / Delete** for dataset `production`
   - Filter (optional): `_type == "page"`
4. Test: edit a page in Studio → **Publish** → Cloudflare should start a build → site updates in ~1–3 minutes.

## 7. Deploy Studio for the client

Easiest free option:

```bash
cd studio
npm run deploy
```

Sanity hosts Studio at `https://<studio-name>.sanity.studio`. Give that URL to the client.

## 8. Decap /admin

Leave Decap in place until Sanity is seeded and live. Then you can remove `/admin` and the GitHub OAuth Functions later.

## Client workflow

1. Open Studio URL  
2. Open a page  
3. Edit text / images  
4. **Publish**  
5. Wait 1–3 minutes → refresh thevaultgym.co.uk  

They never need GitHub or Cloudflare.
