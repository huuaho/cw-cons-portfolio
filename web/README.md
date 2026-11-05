# Douglas Construction Solutions website

Next.js (static export) built from the Colorlib "Space" template, served by a Cloudflare Worker that also runs the client's website editor. Everything runs in the client's Cloudflare account.

## Preview mode (until launch)

While `site-path.json` says `{ "basePath": "/test-website" }`:

| URL | Serves |
|---|---|
| `/` | The under-construction placeholder (copied from `../under-construction/` at build) |
| `/test-website/…` | This site, `noindex` |
| `/test-website/admin/` | The editor |
| `/api/*`, `/media/*`, `/uploads/*`, `/fonts/*` | Unchanged, at the root |
| Anything else | 302 to `/` |

**Launch:** set `basePath` to `""`, commit, push. The site moves to `/` and the placeholder goes away; change the Cloudflare Access paths from `/test-website/admin` to `/admin` at the same time.

Code paths: `src/lib/base-path.ts` (`page()` for URLs written by hand), `scripts/place-site.mjs` (arranges `out/` after `next build`), the end of `worker/index.ts` (routing).

## How it fits together

| Piece | What it does |
|---|---|
| `src/app/(site)/` | The public site, built to static files in `out/` |
| `src/app/admin/` + `src/components/admin/` | The editor at `<base path>/admin` (forms generated from `src/admin/schema.ts`) |
| `worker/index.ts` | Serves `out/`; guards `<base path>/admin` and `/api/admin/*` with Cloudflare Access; saves content to D1 and photos to R2; serves photos at `/media/*`; Publish calls the build's deploy hook |
| `migrations/` | D1 tables (`documents`, `publishes`) |
| `scripts/pull-content.mjs` | Build step: fetches the saved content from the Worker into `content/` before `next build` |
| `scripts/seed-content.mjs` | Loads `content/` into D1 (first setup) |
| `content/` | Starting content and the build's input; on Cloudflare it is overwritten from D1 at each build |

Edit flow: the client edits at `/test-website/admin` (`/admin` after launch) (saved to D1 straight away) → **Publish** → Cloudflare rebuilds (`pnpm build:cf`, which pulls the content) and deploys → live in about 1–2 minutes.

## Run locally

```sh
pnpm install
pnpm build                 # out/ (the Worker serves it); arranges preview mode
pnpm db:migrate:local      # once
pnpm db:seed:local         # load content/ into the local database
pnpm dev:worker            # placeholder on http://localhost:8787/, site at /test-website/, editor at /test-website/admin/
pnpm dev                   # optional: Next dev server on :3000 (site at /test-website/), proxies /api and /media to :8787
pnpm lint && pnpm typecheck
```

`.dev.vars` (not committed) skips the Access check, on localhost only.

To see editor changes on the local site: `CONTENT_EXPORT_URL=http://localhost:8787/api/content/export BUILD_TOKEN=local-dev-token pnpm build:cf` (this rewrites `content/`; `git checkout -- content` to undo).

## Where things are

| Path | What |
|---|---|
| `content/site.json` | Business details |
| `content/home.json` | Home page sections (hero, our work, services, about, by the numbers, testimonials, news, contact; the last three can be hidden) |
| `content/projects/*.md` | One file per project (frontmatter only); the filename is the page address |
| `public/uploads/placeholders/` | Stand-in photos from Wikimedia Commons (credits in `PLACEHOLDER-CREDITS.md`; replace or credit before launch) |
| `src/styles/template.css` | The template's stylesheet, unchanged except for absolute font/image paths |
| `src/styles/site.css`, `admin.css` | Our additions |

## Elements page

`/test-website/elements/` is the template's showcase of interface pieces (accordion, lightbox gallery, video pop-up, form, slider). It is not in the menu and is hidden from search engines.

## Settings

| Name | Where | Purpose |
|---|---|---|
| `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD` | `wrangler.jsonc` vars | Cloudflare Access application that protects `/test-website/admin` and `/api/admin` |
| `DEPLOY_HOOK_URL` | Worker secret | Publish button starts a build |
| `BUILD_TOKEN` | Worker secret + build variable | Lets the build read the content |
| `CONTENT_EXPORT_URL` | Build variable | e.g. `https://douglasconstructionsolutions.com/api/content/export` |
| `NEXT_PUBLIC_SITE_URL` | Build variable (optional) | Site address for social previews |
| `NEXT_PUBLIC_GA_ID` | Build variable (optional) | Google Analytics 4 |
| `NEXT_PUBLIC_CONTACT_ENDPOINT` | Build variable | Contact form handler (not built yet) |
