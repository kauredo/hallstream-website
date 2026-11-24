export type Lang = "en" | "pt";

// Every page, in both languages. The language switch, hreflang and the
// canonical URL all read this, so a page added here gets all three.
export const routes = {
  home: { en: "/", pt: "/pt/", indexed: true },
  consoles: { en: "/guides/supported-consoles/", pt: "/pt/guides/supported-consoles/", indexed: true },
  privacy: { en: "/privacy/", pt: "/pt/privacy/", indexed: true },
  notFound: { en: "/404/", pt: "/pt/404/", indexed: false },
} as const;

export type RouteId = keyof typeof routes;

export const other = (lang: Lang): Lang => (lang === "en" ? "pt" : "en");

/** The same page's path in a language. */
export const path = (id: RouteId, lang: Lang): string => routes[id][lang];

/** html lang and og:locale per language. */
export const htmlLang = { en: "en", pt: "pt-PT" } as const;
export const ogLocale = { en: "en_GB", pt: "pt_PT" } as const;
