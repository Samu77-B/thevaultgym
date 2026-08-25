# Sanity CMS — setup checklist (Cloudflare Pages)

Studio (edit content): **https://thevaultgym.sanity.studio/**  
Site: **https://thevaultgym.pages.dev/** or **https://www.thevaultgym.co.uk**  
Project ID: **`7jggn04g`** · Dataset: **`production`**

Publish in Studio only updates Sanity. The website updates after Cloudflare **rebuilds** using Sanity data.

---

## A. Cloudflare env vars (required)

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. Open your Vault Pages project
3. **Settings** → **Variables and Secrets** (or **Environment variables**)
4. Add for **Production** (and Preview if you use it):

| Name | Value |
|------|--------|
| `SANITY_PROJECT_ID` | `7jggn04g` |
| `SANITY_DATASET` | `production` |
| `NODE_VERSION` | `22` (if not already set) |

Optional (only if dataset is private):

| Name | Value |
|------|--------|
| `SANITY_API_READ_TOKEN` | Viewer token from Sanity → API → Tokens |

5. **Save**
6. Go to **Deployments** → open the latest → **Retry deployment** (or **Manage deployment** → Retry)

Wait until the deploy is **Success**.

### Check the build log

Open that deployment → **Build log**. Search for:

- `[cms] Sanity OK for "about"` → Cloudflare is reading Sanity ✓  
- `[cms] SANITY_PROJECT_ID not set` → env vars missing or not on Production ✗  

---

## B. Deploy hook (Cloudflare) + webhook (Sanity)

### B1. Cloudflare Deploy Hook

1. Same Pages project → **Settings** → **Builds & deployments**
2. Scroll to **Deploy hooks**
3. **Add deploy hook**
   - Name: `Sanity publish`
   - Branch: `master` (your production branch)
4. **Copy the hook URL** (long `https://api.cloudflare.com/.../deploy_hooks/...` link)

### B2. Sanity Webhook

1. Open **https://www.sanity.io/manage/project/7jggn04g/api/webhooks**  
   (must be **manage.sanity.io**, not Studio)
2. **Create webhook**
3. Fill in:

| Field | Value |
|--------|--------|
| **Name** | `Cloudflare rebuild` |
| **URL** | paste the Cloudflare Deploy Hook URL |
| **Dataset** | `production` |
| **Trigger on** | Create, Update, Delete |
| **Filter** | `_type == "page"` (optional) |
| **Drafts** | leave **off** |

4. **Save**

---

## C. End-to-end test

1. Studio → **About** → change H1 to `SANITY TEST 123` → **Publish**
2. Cloudflare → **Deployments** — a new build should start within ~30–60 seconds  
   - If **no** new deploy → webhook URL wrong or webhook not saved
3. When deploy succeeds, hard-refresh **https://thevaultgym.pages.dev/about** (Ctrl+F5)
4. You should see **SANITY TEST 123**

If a deploy ran but text is still old → check build log for `[cms] Sanity OK` (section A).

---

## D. Local checks (optional)

```bash
# From repo root — confirms Sanity has published pages
node --env-file=.env scripts/test-sanity-connection.mjs
```

---

## Quick “what’s broken?” guide

| Symptom | Fix |
|---------|-----|
| Publish does nothing on site; **no** new Cloudflare deploy | Fix Sanity webhook URL / recreate deploy hook |
| New Cloudflare deploy runs, site still old | Add `SANITY_PROJECT_ID` + `SANITY_DATASET` on **Production**, retry deploy |
| Build log says `SANITY_PROJECT_ID not set` | Env vars missing or only set on Preview |
| Build log says `Sanity OK` but browser shows old text | Hard refresh / wait for CDN; confirm you’re on the right domain |
| Studio 404 | Studio is at https://thevaultgym.sanity.studio/ (already deployed) |

---

## Client workflow (once setup works)

1. Open https://thevaultgym.sanity.studio/  
2. Edit a page → **Publish**  
3. Wait 1–3 minutes → refresh the live site  

No GitHub. No `/admin`.
