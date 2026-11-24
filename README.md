# hallstream.com

The website for [Hallstream](https://github.com/kauredo/hallstream), a free, open-source Windows app that streams a basketball club's home games to YouTube with the score on screen.

It is a static Astro 5 site, in English at `/` and European Portuguese at `/pt/`, deployed on Vercel.

## Commands

```sh
npm install
npm run dev            # http://localhost:4321
npm run build          # static site in dist/
npm run preview        # serve dist/
npm test               # unit tests (node --experimental-strip-types --test)
npm run check:links    # every internal link and asset in dist/ resolves
npm run og             # re-render the share images into public/og/
npm run icons          # re-render the favicons from the brand app icon
node scripts/crops.mjs # re-cut the phone crops after replacing a screenshot
```

The build reads the latest release of `kauredo/hallstream` from the GitHub API. Set `GITHUB_TOKEN` for a higher rate limit. With no release, the download button reads "Follow the first release on GitHub" and links to the releases page.

## Pages

| Route | Page |
|---|---|
| `/`, `/pt/` | Home |
| `/guides/supported-consoles/`, `/pt/guides/supported-consoles/` | Supported consoles |
| `/privacy/`, `/pt/privacy/` | Privacy |
| `/404.html`, `/pt/404/` | Not found |

The "Hallstream vs …" template (`src/views/Vs.astro`) is built but not routed. `docs/vs-pages.md` says how to add one.

## Licence

The site's code is AGPL-3.0, like the app. Archivo is under the SIL Open Font License (`public/fonts/OFL.txt`).
