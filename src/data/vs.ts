// The shape of a "Hallstream vs <alternative>" page. No page uses it yet:
// a vs page ships only once every fact about the alternative has a source
// and a checked date. docs/vs-pages.md says how to add one.

/** One fact about the alternative, with where it came from and when. */
export interface Sourced {
  text: string;
  source: string; // a URL
  checked: string; // ISO day, e.g. "2026-11-24"
}

export interface VsAlternative {
  slug: string; // the page lives at /vs/<slug>/
  name: string;
  /** What it is, who it is for and what it costs, in one sentence. */
  summary: Sourced;
  /** One per row of the head-to-head table, in the order of `questions`. */
  facts: Record<VsQuestion, Sourced>;
  /** The closing sentence of the opening answer: which club each one suits.
   *  Without it, the page says Hallstream suits a club that wants the score
   *  on screen without anyone typing it. */
  fit?: string;
  /** Which of `alwaysStrengths` hold for this alternative; all of them when absent. */
  generic?: (keyof typeof alwaysStrengths)[];
  /** Things the alternative does better, in plain sentences. */
  strengths: Sourced[];
  /** Anything to export or cancel in the alternative before switching. */
  switchStep?: Sourced;
  /** The answer to "Can I use both on the same PC?". */
  samePc: Sourced;
}

export const questions = ["cost", "platform", "score", "graphics", "cameras", "sports", "accounts", "licence"] as const;
export type VsQuestion = (typeof questions)[number];

// Hallstream's side of the table. Keep it to what ships; "coming" goes in
// `soon`. Sources: app/README.md and app/docs/ROADMAP.md.
export const hallstream: Record<VsQuestion, { label: string; text: string; soon?: string }> = {
  cost: { label: "What it costs", text: "Free. No subscription and no paid tier." },
  platform: { label: "Platform", text: "Windows.", soon: "macOS and Linux." },
  score: {
    label: "Where the score comes from",
    text: "A Stramatel console through the Stream Box, over Bluetooth, or a phone at the scorer's table.",
  },
  graphics: { label: "Graphics in club colours", text: "Yes. Five looks, your accent colours and a photo of your hall." },
  cameras: { label: "Multi-camera", text: "One camera today.", soon: "more than one camera." },
  sports: { label: "Sports", text: "Basketball today.", soon: "futsal, handball, volleyball and soccer." },
  accounts: { label: "Accounts", text: "No account to make." },
  licence: { label: "Licence", text: "Open source, AGPL-3.0." },
};

// Reasons a club might pick the alternative that hold for most of them. A page
// lists the ones its alternative's `generic` names, or all of them.
export const alwaysStrengths = {
  mac: "You stream from a Mac or a Linux machine. Hallstream runs on Windows only for now.",
  cameras: "You need more than one camera in the same broadcast today.",
  sports: "Your club plays a sport other than basketball.",
};
