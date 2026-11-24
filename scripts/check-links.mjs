#!/usr/bin/env node
// Checks every internal link and asset in dist/ after `npm run build`:
// href, src, srcset and the og/twitter image URLs on hallstream.com must
// resolve to a built file, and every #fragment must name an id on its page.
// Exit 1 on any miss.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const site = "https://hallstream.com";
const pages = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".html")) pages.push(p);
  }
};
walk(dist);

const urlOf = (file) => "/" + file.slice(dist.length + 1).replace(/index\.html$/, "");
const ids = new Map(pages.map((f) => [urlOf(f), new Set([...readFileSync(f, "utf8").matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));

const resolveFile = (path) => {
  const p = decodeURIComponent(path);
  const candidates = p.endsWith("/") ? [join(dist, p, "index.html")] : [join(dist, p), join(dist, p, "index.html")];
  return candidates.some((c) => existsSync(c) && statSync(c).isFile());
};

const misses = [];
let checked = 0;
for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const here = urlOf(file);
  const refs = [
    ...[...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[1].split(",").map((s) => s.trim().split(/\s+/)[0])),
    ...[...html.matchAll(/<meta[^>]+content="(https:\/\/hallstream\.com[^"]*)"/g)].map((m) => m[1]),
  ];
  for (let ref of refs) {
    if (ref.startsWith(site)) ref = ref.slice(site.length) || "/";
    if (/^(https?:|mailto:|data:|\/\/)/.test(ref)) continue;
    checked++;
    const [pathPart, frag] = ref.split("#");
    const path = pathPart === "" ? here : pathPart.startsWith("/") ? pathPart : new URL(pathPart, `http://x${here}`).pathname;
    if (!resolveFile(path)) {
      misses.push(`${file}: ${ref} (no file)`);
      continue;
    }
    if (frag && ids.has(path) && !ids.get(path).has(frag)) misses.push(`${file}: ${ref} (no #${frag})`);
    if (path !== "/" && !path.endsWith("/") && !/\.[a-z0-9]+$/i.test(path)) misses.push(`${file}: ${ref} (no trailing slash)`);
  }
}

console.log(`${pages.length} pages, ${checked} internal links and assets checked`);
if (misses.length) {
  console.log(misses.join("\n"));
  process.exit(1);
}
console.log("no broken internal links");
