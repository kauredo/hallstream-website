#!/usr/bin/env node
// Renders the app's screenshots from a running Hallstream, in the language
// that copy is set to: the on-air frames (the real overlay over the hall
// photo), the score bugs, the scoring page and the panel's Aparência card.
//
//   node scripts/app-shots.mjs <hall-photo.jpg> [outdir]
//
// Start the app first, without -demo so the scoring page scores (`go run
// ./cmd/hallstream -nobrowser` in ../app, or a built exe), with Settings set
// to the language you want, the club named
// HOME with the short name HOM (CASA and CAS for Portuguese), scoring on a
// phone, and Cor do Clube as the look. outdir defaults to public/images/en.
// The overlay fixtures' data is Portuguese (CASA, VISITANTE, Jornada 5); for
// English the script renames it on the way in. Afterwards run
// `node scripts/crops.mjs <outdir>` and `node scripts/webp.mjs <outdir>`.
// The hall photo is the Unsplash one in docs/image-credits.md.
import { mkdirSync, readFileSync } from "node:fs";
import puppeteer from "puppeteer";
import sharp from "sharp";

const [photo, out = "public/images/en"] = process.argv.slice(2);
if (!photo) {
  console.error("usage: node scripts/app-shots.mjs <hall-photo.jpg> [outdir]");
  process.exit(2);
}
mkdirSync(out, { recursive: true });
const BASE = "http://127.0.0.1:8765";
const settings = await (await fetch(`${BASE}/api/settings`)).json();
const english = settings.lang === "en";
const names = english
  ? [
      ["Campeonato Regional", "Regional League"],
      ["Jornada 5", "Round 5"],
      ["Sénior Masculino", "Senior Men"],
      ["VISITANTE", "AWAY"],
      ["CASA", "HOME"],
      ["VIS", "AWA"],
      ["CAS", "HOM"],
    ]
  : [];

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setRequestInterception(true);
page.on("request", async (req) => {
  // The overlay's own URL names the fixture in its query, so match the path.
  if (!english || !new URL(req.url()).pathname.startsWith("/overlay/fixtures/")) return req.continue();
  let body = await (await fetch(req.url())).text();
  for (const [from, to] of names) body = body.replaceAll(`"${from}"`, `"${to}"`);
  req.respond({ status: 200, contentType: "application/json", body });
});
const settle = (ms) => new Promise((r) => setTimeout(r, ms));
const overlay = (qs) => `${BASE}/overlay?state=/overlay/fixtures/${qs}&anim=0&now=2026-11-15T17:48:00Z`;

// On air: the overlay as a transparent iframe over the photo, 1920x1080, plus a 960 copy.
const bg = "data:image/jpeg;base64," + readFileSync(photo).toString("base64");
const frames = [
  ["onair-classico", "rodape-jogador.json&style=classico"],
  ["onair-placa", "marcador.json&style=placa"],
  ["onair-lombada", "marcador-bonus.json&style=lombada"],
  ["onair-cor-final", "final.json&style=cor"],
  ["onair-pavilhao", "marcador-24s-quente.json&style=pavilhao"],
];
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
for (const [name, qs] of frames) {
  await page.setContent(`<!doctype html><style>html,body{margin:0;width:1920px;height:1080px;overflow:hidden}
    img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(1.05)}
    iframe{position:absolute;inset:0;width:1920px;height:1080px;border:0;background:transparent}</style>
    <img src="${bg}"><iframe allowtransparency src="${overlay(qs)}"></iframe>`);
  await settle(3500);
  const shot = await page.screenshot({ type: "png" });
  await sharp(shot).jpeg({ quality: 82, mozjpeg: true }).toFile(`${out}/${name}.jpg`);
  await sharp(shot).resize({ width: 960 }).jpeg({ quality: 80, mozjpeg: true }).toFile(`${out}/${name}-960.jpg`);
  console.log(`  ${out}/${name}.jpg`);
}

// Score bugs: the overlay over the court photo (?preview=foto), 760x200 from the bug's corner.
for (const look of ["classico", "lombada", "cor", "placa", "pavilhao"]) {
  await page.goto(overlay(`marcador.json&style=${look}&preview=foto`), { waitUntil: "load" });
  await settle(1500);
  await page.screenshot({ path: `${out}/bug-${look}.png`, clip: { x: 30, y: 30, width: 760, height: 200 } });
  console.log(`  ${out}/bug-${look}.png`);
}

// The scoring page, a phone held sideways, mid-game: 5 to 5, a +3 just in, the clock running.
// Each run adds points to the saved game, so it only runs on a game at 0 to 0.
const live = (await (await fetch(`${BASE}/api/state`)).json()).live || {};
const fresh = !live.home && !live.away;
if (!fresh) console.log("  skipped marcar.jpg: the game is not at 0-0 (start a new game on the scoring page first)");
await page.setViewport({ width: 844, height: 390, deviceScaleFactor: 2 });
if (fresh) await page.goto(`${BASE}/marcar`, { waitUntil: "load" });
await settle(800);
if (fresh) await page.evaluate(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const tap = (sel) => document.querySelector(sel)?.click();
  tap('[data-do="take"]'); // the first tap takes the scoring over
  await wait(600);
  for (const [team, n] of [["home", 2], ["home", 3], ["away", 2], ["away", 3]]) {
    tap(`[data-team="${team}"] [data-do="point"][data-n="${n}"]`);
    await wait(300);
  }
  tap('[data-team="home"] [data-do="foul"]');
  tap('[data-team="away"] [data-do="foul"]');
  await wait(300);
  tap("#arrancar"); // start the clock
});
if (fresh) {
  await settle(1200);
  const scorer = await page.screenshot({ type: "png" });
  await sharp(scorer).resize({ width: 1600 }).jpeg({ quality: 82, mozjpeg: true }).toFile(`${out}/marcar.jpg`);
  console.log(`  ${out}/marcar.jpg`);
}

// The panel's Aparência card, with the lower third showing in the preview.
await page.setViewport({ width: 1600, height: 1085, deviceScaleFactor: 1 });
await page.goto(`${BASE}/painel#definicoes`, { waitUntil: "load" });
await settle(1500);
await page.evaluate(() => {
  document.querySelector('#lookView [data-view="rodape"], #lookView [data-view]:nth-child(2)')?.click();
  const card = document.querySelector(".aparencia")?.closest(".card") || document.querySelector(".aparencia");
  if (card) window.scrollTo(0, card.getBoundingClientRect().top + window.scrollY - 96);
});
await settle(1500);
await page.screenshot({ path: `${out}/panel-aparencia.jpg`, type: "jpeg", quality: 85 });
console.log(`  ${out}/panel-aparencia.jpg`);

await browser.close();
