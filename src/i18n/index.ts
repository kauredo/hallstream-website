import en from "./en.json";
import pt from "./pt.json";
import type { Lang } from "./routes.ts";

export type Strings = typeof en;
const strings: Record<Lang, Strings> = { en, pt };

export const t = (lang: Lang): Strings => strings[lang];

export { fill } from "../utils/fill.ts";

export const langFromUrl = (url: URL): Lang => (url.pathname.startsWith("/pt/") ? "pt" : "en");
