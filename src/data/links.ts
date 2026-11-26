// Every outbound link the site uses, in one place.
const UTM = "utm_source=hallstream&utm_medium=website&utm_campaign=cross-link";
const withUtm = (url: string) => `${url}${url.includes("?") ? "&" : "?"}${UTM}`;

export const REPO = "https://github.com/kauredo/hallstream";

export const product = {
  github: REPO,
  issues: `${REPO}/issues`,
  releases: `${REPO}/releases`,
  license: `${REPO}/blob/main/LICENSE`,
} as const;

// The app's guide to two and three cameras, one file per language.
export const camerasGuide = {
  pt: `${REPO}/blob/main/docs/cameras/GUIDE.md`,
  en: `${REPO}/blob/main/docs/cameras/GUIDE.en.md`,
} as const;

// The maker's other projects, cross-linked from every footer.
export const maker: { name: string; href: string }[] = [
  { name: "Basketball Video Analyzer", href: withUtm("https://basketballvideoanalyzer.com") },
  { name: "Basketball Stats", href: withUtm("https://basketballstatsapp.com") },
  { name: "Calendário FPB", href: withUtm("https://calendariofpb.pt") },
  { name: "vascokf.com", href: withUtm("https://vascokf.com") },
  { name: "Ko-fi", href: withUtm("https://ko-fi.com/kauredo") },
];
