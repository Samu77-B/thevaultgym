# Editing the site (Sanity CMS)

Content is edited in **Sanity Studio** — not on the website’s `/admin` page (that Decap/GitHub login has been removed).

## For editors (client)

1. Open the Studio URL you were given (local: `http://localhost:3333/`, or the hosted `*.sanity.studio` URL after deploy).
2. Sign in with the **Sanity** account you were invited to (email invite from the project owner).
3. Open a **Page**, edit text/images/SEO, then click **Publish**.
4. Wait 1–3 minutes for the site rebuild, then hard-refresh the live page.

You do **not** need GitHub or Cloudflare access.

## Pages list

Editors choose from a fixed list of site pages (Home, About, Contact, Work With Us, Train With Us, etc.). You do not create new page types unless a developer adds them.

## Fields

- **Hero image** — landscape, ideally 1920×1080+; subject centred.
- **Hero overlay** — optional H1 / H2 / buttons over the hero.
- **Main page text** — blocks (headings, paragraphs, lists, HTML with links).
- **SEO** — title and meta description.

## After publishing

Sanity saves immediately. The live static site updates after **Cloudflare Pages** rebuilds (automatic if the Publish webhook is set up — see [SANITY.md](SANITY.md)).

## Developers

- Full setup: [SANITY.md](SANITY.md)
- Hosting notes: [CLOUDFLARE.md](CLOUDFLARE.md)
- Seed from existing JSON: `npm run seed-sanity`
- Studio: `cd studio && npm run dev`
