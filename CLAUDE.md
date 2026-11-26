# Hallstream website

Astro 7 static site for hallstream.com. The app is `../app` (its own repo, `kauredo/hallstream`); the brand package is `../marketing/brand/hallstream-brand/`. Never edit either from here.

## Commands

- `npm run build` must be clean. Then `npm test` (`node --experimental-strip-types --test`) and `npm run check:links`, which fails on any internal link or asset in `dist/` that does not resolve.
- `npm run test:build` (`test/build.test.ts`, slow) builds the site twice into a temp dir, as it is and with `HALLSTREAM_RELEASE_FIXTURE=test/fixtures/release.json` standing in for a release, then checks both download states, the page invariants and the links. Run it after touching the download button, the home page or `release.ts`.
- Bump a page's `modified` in `src/data/pageDates.ts` when its content changes. The sitemap's lastmod, the article meta tags and the TechArticle JSON-LD read it.
- `npm run og` re-renders `public/og/*.png` after a title changes. `node scripts/crops.mjs [dir]` re-cuts the phone crops after a screenshot changes; then `node scripts/webp.mjs [dir]` rewrites the hero's WebP copies. Both default to `public/images`.
- Every URL ends in a slash (`trailingSlash: "always"`). Internal links and JSON-LD URLs use the slash form.

## Where the truth is

- What the product does: `../app/README.md`, `../app/docs/ROADMAP.md` and `../app/docs/CONTRACT.md`. The site states only what ships. macOS and Linux, more cameras, serial consoles and signed releases are "coming". Five sports ship (basketball, futsal, handball, volleyball, soccer), and the Stramatel console is tested on basketball only; the pages say so. The app has shipped in Portuguese and English since 0.1.0.
- Every string lives in `src/i18n/en.json` and `src/i18n/pt.json`. Both are written by hand; pt is European Portuguese, in the app's own words (consola, caixa, mesa de marcação, desconto de tempo). A test fails when the two files have different keys or a string has an em dash.
- `src/i18n/routes.ts` is the one list of pages in both languages. The language switch, hreflang and canonical read it.
- `src/data/links.ts` holds every outbound link; the footer's cross-links get the utm parameters there.
- The design is the "Tuned in" redesign (Nov 2026): a Marcador band with the ticking score over the real on-air frame, then Soalho, calmed maple (`hardwood.jpg`, a real plank photo, under a Soalho claro veil, with a painted court) and Marcador sections. Tokens are in `src/styles/global.css`: Soalho and Marcador share the ground, Lâmpada lights things (the colon, the focus ring, the tip-off) and may own a surface or a rule (the painted key, the Coming later rule), Lâmpada funda for accent text on Soalho. Download buttons are Soalho or Marcador, never Lâmpada. Archivo only, headings condensed (`--display`, 72%) and heavy. Photo sources are in `docs/image-credits.md`.

## Copy rules

- `~/.claude/writing-style.md` tier 2 on every string, both languages. No em dashes, no invented numbers.
- Guides open with a direct-answer paragraph that stands alone when quoted.
- A vs page needs a source and a checked date for every fact about the alternative (`docs/vs-pages.md`). No placeholder goes live, and the footer does not link a vs page until one exists.
- The app's screenshots come in both languages: `public/images/` (Portuguese) and `public/images/en/` (English, chosen in `Home.astro` by the page language). `node scripts/app-shots.mjs <hall photo> [outdir]` renders them from a running app, its header says how to set the app up, and then `crops.mjs` and `webp.mjs` take the same folder.

## Releases and deploys

The build reads the latest release of `kauredo/hallstream` (`src/utils/github.ts`, `assets.ts`, `release.ts`). The app's `build.sh` uploads `Hallstream-<version>.zip`, which `parseAssets` reads as the Windows download. With no release, `fallback.ts` points the button at the releases page and the button says "Follow the first release on GitHub". With one, it reads "Download for Windows", the note names the version and size, and a second line explains the SmartScreen warning (`src/utils/downloadCopy.ts`, tested). A push to `main` deploys on Vercel, and a release of the app rebuilds the site through a deploy hook (the app's `release.yml`). `docs/launch.md` has the Vercel project, the domain and DNS state, and the open launch items.

Conventional commits. Stage files by name.
