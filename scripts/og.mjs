#!/usr/bin/env node
// Renders the share images (1200x630) into public/og/ from the two canvas
// templates: OG-Home (dark, title left, the Clássico frame right) and
// OG-Guide (Soalho, kicker and title, an ink band with the lockup and the
// domain). One image per page and language. Run it after changing a title.
//   node scripts/og.mjs
import puppeteer from "puppeteer";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(".");
const file = (p) => pathToFileURL(join(root, p)).href;
const lockup = readFileSync("src/assets/brand/lockup.svg", "utf8").replace("<svg ", '<svg aria-hidden="true" ');
const en = JSON.parse(readFileSync("src/i18n/en.json", "utf8"));
const pt = JSON.parse(readFileSync("src/i18n/pt.json", "utf8"));

const head = `<meta charset="utf-8"><style>
@font-face{font-family:Archivo;font-weight:100 900;font-stretch:62% 125%;src:url("${file("public/fonts/Archivo-var-latin.woff2")}") format("woff2");unicode-range:U+0000-00FF,U+2000-206F}
@font-face{font-family:Archivo;font-weight:100 900;font-stretch:62% 125%;src:url("${file("public/fonts/Archivo-var-latin-ext.woff2")}") format("woff2");unicode-range:U+0100-02BA,U+1E00-1E9F}
body{margin:0}
.lk svg{display:block;height:var(--h);width:auto}
</style>`;

const home = ({ title, price, platform, alt }) => `<!doctype html><html><head>${head}</head><body>
<div style="width:1200px;height:630px;overflow:hidden;display:grid;grid-template-columns:660px 540px;font-family:Archivo,sans-serif;background:#1C1A17;color:#F2E4C9">
  <div style="display:flex;flex-direction:column;justify-content:space-between;padding:56px 48px 48px 60px">
    <div class="lk" style="--h:56px;color:#F2E4C9">${lockup}</div>
    <p style="margin:0;font-stretch:113%;font-weight:800;font-size:${title.length > 44 ? 56 : 66}px;line-height:0.98;letter-spacing:-0.02em">${title}</p>
    <div>
      <div style="height:6px;border-top:4px solid #F2E4C9;border-bottom:1px solid #F2E4C9"></div>
      <div style="display:flex;justify-content:space-between;gap:24px;padding-top:14px;font-stretch:74%;font-weight:700;font-size:30px;line-height:1">
        <span>${price}</span><span>${platform}</span>
      </div>
    </div>
  </div>
  <div style="height:630px;overflow:hidden;background:#5C5346">
    <img src="${file("public/images/overlay-classico.jpg")}" alt="${alt}" style="width:100%;height:100%;object-fit:cover;object-position:0% 50%;display:block">
  </div>
</div></body></html>`;

const guide = ({ kicker, title }) => `<!doctype html><html><head>${head}</head><body>
<div style="width:1200px;height:630px;overflow:hidden;display:grid;grid-template-rows:minmax(0,1fr) 150px;font-family:Archivo,sans-serif;background:#F2E4C9;color:#1C1A17">
  <div style="padding:56px 60px 0;display:flex;flex-direction:column">
    <div style="height:7px;border-top:4px solid #1C1A17;border-bottom:1px solid #1C1A17"></div>
    <p style="margin:16px 0 0;font-stretch:74%;font-weight:700;font-size:32px;line-height:1;color:#5C5346">${kicker}</p>
    <p style="margin:auto 0 44px;font-stretch:113%;font-weight:800;font-size:112px;line-height:0.95;letter-spacing:-0.025em;max-width:11ch">${title}</p>
  </div>
  <div style="background:#1C1A17;color:#F2E4C9;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:0 60px">
    <div class="lk" style="--h:52px">${lockup}</div>
    <span style="font-stretch:74%;font-weight:700;font-size:34px;line-height:1">hallstream.com</span>
  </div>
</div></body></html>`;

const images = [
  ["home-en.png", home({ title: en.home.h1, price: "Price: free", platform: "For Windows", alt: en.home.coverAlt })],
  ["home-pt.png", home({ title: pt.home.h1, price: "Preço: grátis", platform: "Para Windows", alt: pt.home.coverAlt })],
  ["consoles-en.png", guide({ kicker: en.consoles.crumbGuides.replace(/s$/, ""), title: en.consoles.ogTitle })],
  ["consoles-pt.png", guide({ kicker: "Guia", title: pt.consoles.ogTitle })],
];

const dir = mkdtempSync(join(tmpdir(), "hs-og-"));
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
for (const [name, html] of images) {
  const src = join(dir, name.replace(".png", ".html"));
  writeFileSync(src, html);
  await page.goto(pathToFileURL(src).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `public/og/${name}`, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  console.log(`  public/og/${name}`);
}
await browser.close();
