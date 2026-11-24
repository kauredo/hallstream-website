# Launch status

## Hosting

- Vercel project `kauredos-projects/hallstream-website`, linked to this repo. Pushes to `main` deploy to production; other branches get previews. The `.vercel.app` URLs sit behind Vercel Authentication; only the custom domains are public.
- The Vercel MCP connector cannot create or change this project (403). Use the Vercel CLI, logged in as the owner.
- `hallstream.com` and `www.hallstream.com` are attached to the project. Cloudflare hosts the DNS. Each needs a CNAME (`@` and `www`) to `96d2f421a30f6ed4.vercel-dns-016.com`, with the proxy off. Check with `vercel domains verify hallstream.com --scope kauredos-projects`.

## Before launch

- [ ] DNS at Cloudflare, then verify both domains.
- [ ] Lighthouse (SEO, accessibility, performance) on the live domain, both languages.
- [ ] Baseline the five spot-check prompts in `marketing-aeo.md` once the site is indexed.

## After launch

- [ ] A Vercel deploy hook in the app's release workflow (`kauredo/hallstream`), so a release rebuilds the site and the button switches to "Download for Windows". The hook URL goes in as a GitHub secret.
- [ ] A Portuguese 404 for missing `/pt/` URLs. Vercel serves the root `404.html` for every path; a rewrite would answer 200, so check Vercel's docs for a status-keeping option first.
- [ ] Recapture the app screenshots in English for the EN pages once the app ships `en.json`.
- [ ] Replace `hardwood.jpg` (generated) with a real maple photo.
- [ ] Optional: blur the third-party sponsor names in the arena photo behind `onair-*.jpg` (see `docs/image-credits.md`).
- [ ] Upgrade Astro to 7 as a normal upgrade. The npm audit's Astro advisories need a server runtime this static build does not have. Bump `sharp` (build-time only) at the same time.
- [ ] The first vs page, with a source and a checked date for every fact (`docs/vs-pages.md`).
