# Douglas Construction Solutions website

Next.js (static export) built from the Colorlib "Space" template, with content the client edits through [Pages CMS](https://pagescms.org).

## Run locally

```sh
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # static site in out/
pnpm lint && pnpm typecheck
```

## Where things are

| Path | What |
|---|---|
| `content/site.json` | Business details (name, phone, email, address, hours, areas, social links, search text) |
| `content/home.json` | Home page text and photos (hero, services, our work, about, contact) |
| `content/projects/*.md` | One file per project (frontmatter only); the filename is the page address |
| `public/uploads/` | Photos uploaded through Pages CMS; `placeholders/photos/` holds stand-in photos from Wikimedia Commons (credits and licences in `PLACEHOLDER-CREDITS.md`; replace or credit before launch) |
| `.pages.yml` | The editing forms Pages CMS shows; keep in step with `src/lib/content.ts` |
| `src/styles/template.css` | The template's stylesheet, unchanged except for absolute font/image paths |
| `src/styles/site.css` | Our additions |

## Contact form

Shows a "not connected yet" message until `NEXT_PUBLIC_CONTACT_ENDPOINT` is set at build time.
