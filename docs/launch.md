# Launch status

## Hosting

- Vercel project `kauredos-projects/hallstream-website`, linked to this repo. Pushes to `main` deploy to production; other branches get previews. The `.vercel.app` URLs sit behind Vercel Authentication; only the custom domains are public.
- The Vercel MCP connector cannot create or change this project (403). Use the Vercel CLI, logged in as the owner.
- `hallstream.com` is live (Cloudflare DNS, CNAMEs `@` and `www` to `96d2f421a30f6ed4.vercel-dns-016.com`, proxy off; Let's Encrypt certificate). `www.hallstream.com` 308-redirects to the apex, path kept (a project domain setting, not in `vercel.json`). Check with `vercel domains verify hallstream.com --scope kauredos-projects`.

## Launch, 25 November 2026

- [x] DNS at Cloudflare; both domains verified.
- [x] Lighthouse on the live domain, English and Portuguese, phone and desktop: accessibility, best practices and SEO all 100, no failing audit.
- [x] Phone trace (Slow 4G, 4x CPU, no cache): CLS 0, LCP 2.35 s. The LCP element is the hero frame; it was 3.4 s until the hero got WebP copies (phone crop 134 KB to 78 KB, `scripts/webp.mjs`). Halving the maple texture did not move it.
- [ ] Baseline the five spot-check prompts in `marketing-aeo.md` once the site is indexed.
- [ ] Submit `https://hallstream.com/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools (needs the owner's accounts).

## After launch

- [x] A release rebuilds the site: the Vercel deploy hook `app-release` (branch `main`) is the app repo secret `VERCEL_DEPLOY_HOOK`, called by the app's `release.yml` after it publishes, and by `site.yml` for a release published by hand.
- [x] A Portuguese 404 for missing `/pt/` URLs. Vercel serves the root `404.html`, with its 404 status, for every missing path. Under `/pt/` an inline script in that page fetches `/pt/404/` and writes it in, so the status stays 404. A `vercel.json` `routes` entry was tried on a preview and dropped: without `handle: filesystem` it turned every `/pt/` page into a 404, and with it the deployment lost every header from `headers` except HSTS.
- [ ] Recapture the app screenshots in English for the EN pages once the app ships `en.json`.
- [ ] Optional: blur the third-party sponsor names in the arena photo behind `onair-*.jpg` (see `docs/image-credits.md`).
- [ ] Upgrade Astro to 7 as a normal upgrade. The npm audit's Astro advisories need a server runtime this static build does not have. Bump `sharp` (build-time only) at the same time.
- [ ] The first vs page, with a source and a checked date for every fact (`docs/vs-pages.md`).
