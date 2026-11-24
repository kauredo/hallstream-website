// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { pageDates } from "./src/data/pageDates.ts";

// https://astro.build/config
export default defineConfig({
  site: "https://hallstream.com",
  trailingSlash: "always",
  i18n: {
    locales: ["en", "pt"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      // English at /, European Portuguese at /pt/. The sitemap writes the
      // hreflang alternates from this map.
      i18n: { defaultLocale: "en", locales: { en: "en", pt: "pt-PT" } },
      filter: (page) => !/\/404\/?$/.test(new URL(page).pathname),
      serialize(item) {
        const dates = pageDates[new URL(item.url).pathname];
        if (dates) item.lastmod = dates.modified;
        return item;
      },
    }),
  ],
  build: { inlineStylesheets: "auto" },
  compressHTML: true,
});
