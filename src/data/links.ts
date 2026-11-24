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

// The maker's other projects, cross-linked from every footer. `note` is a
// key into the strings, for the one link that needs a line of context.
export const maker: { name: string; href: string; note?: "fpbNote" }[] = [
  { name: "Basketball Video Analyzer", href: withUtm("https://basketballvideoanalyzer.com") },
  { name: "Basketball Stats", href: withUtm("https://basketballstatsapp.com") },
  { name: "Calendário FPB", href: withUtm("https://calendariofpb.pt"), note: "fpbNote" },
  { name: "vascokf.com", href: withUtm("https://vascokf.com") },
  { name: "Ko-fi", href: withUtm("https://ko-fi.com/kauredo") },
];
