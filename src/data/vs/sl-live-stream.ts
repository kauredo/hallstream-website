import type { VsAlternative } from "@/data/vs";

// Researched and checked on 2026-11-25 against Stramatel's own pages and its
// Play listing. Stramatel publishes no price for the Stream Box or for the
// Premium upgrade, so the page states none.
const sheet = "https://www.stramatel.com/wp-content/uploads/2020/07/SL-Stream-Box_Premium_Stramatel_FR_A.pdf";
const advert = "https://www.stramatel.com/wp-content/uploads/2020/07/SL-Live-Stream-advert-Multisport.pdf";
const product = "https://www.stramatel.com/en/sport-range/sl-live-stream/";
const play = "https://play.google.com/store/apps/details?id=application.stramatel.livesl";
// The Stream Box takes one connection at a time, which Hallstream's own panel says.
const oneLink = "https://github.com/kauredo/hallstream/blob/main/web/i18n/en.json";
const checked = "2026-11-25";

export const alt: VsAlternative = {
  slug: "sl-live-stream",
  name: "SL Live Stream",
  summary: {
    text: "SL Live Stream is Stramatel's free Android app for clubs with a Stramatel console: it films the game on a phone and streams it with the score from an SL Stream Box, which is sold separately.",
    source: sheet,
    checked,
  },
  fit: "Hallstream suits a club that plays basketball, futsal, handball, volleyball or soccer and streams from a Windows PC with OBS and wants every graphic in its own colours. SL Live Stream suits a club that wants to stream from one Android phone.",
  generic: [],
  facts: {
    cost: {
      text: "The app is free to download. It needs an SL Stream Box, and Stramatel publishes no price for the box or for the Premium upgrade.",
      source: sheet,
      checked,
    },
    platform: { text: "Android phones, from Google Play. There is no iPhone or Windows version.", source: sheet, checked },
    score: {
      text: "From a Stramatel console installed since 2010, through the SL Stream Box: by radio or cable for consoles from 2017, by cable for those from 2010 to 2016.",
      source: sheet,
      checked,
    },
    graphics: {
      text: "You type the team names and pick their colours. Premium replaces the Stramatel logo with your sponsors' logos.",
      source: sheet,
      checked,
    },
    cameras: { text: "The phone's own camera. Stramatel describes no way to add a second one.", source: sheet, checked },
    sports: {
      text: "Basketball, handball, volleyball, futsal, hockey, tennis, football, rugby, field hockey, water polo and ice hockey, depending on the console.",
      source: product,
      checked,
    },
    accounts: {
      text: "You go live by signing in with Facebook, or by entering another RTMP server.",
      source: advert,
      checked,
    },
    licence: { text: "A Google Play app. Stramatel publishes no source code for it.", source: play, checked },
  },
  strengths: [
    { text: "You want to film and stream from one Android phone, with no PC or OBS to set up.", source: sheet, checked },
    {
      text: "Your club plays a sport Hallstream does not score yet. SL Live Stream covers eleven across Stramatel's consoles.",
      source: product,
      checked,
    },
    {
      text: "You want the shot clocks, exclusion timers and tenths of a second on screen, which Premium shows, from the company that makes the console.",
      source: advert,
      checked,
    },
  ],
  switchStep: {
    text: "Close SL Live Stream on every phone and tablet before a game with Hallstream. The Stream Box takes one connection at a time.",
    source: oneLink,
    checked,
  },
  samePc: {
    text: "SL Live Stream does not run on a PC. It can stay on the phone, but only one of the two can be connected to the Stream Box during a game.",
    source: oneLink,
    checked,
  },
};
