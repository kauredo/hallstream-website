#!/usr/bin/env node
// Every icon comes from the brand package's app icon: the Lâmpada mark on a
// Marcador rounded square (src/assets/brand/app-icon-1024.svg). The mark is
// a solid shape with no hairlines, so one drawing holds from 16 px up.
// Home-screen icons get a square ground, since the OS draws its own corners.
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const rounded = readFileSync("src/assets/brand/app-icon-1024.svg", "utf8");
const square = rounded.replace(/ rx="[^"]*"/, "");
const png = (svg, size, out) => sharp(Buffer.from(svg), { density: 144 }).resize(size, size).png().toFile(out);

for (const [out, size] of [
  ["public/favicon-16x16.png", 16],
  ["public/favicon-32x32.png", 32],
]) {
  await png(rounded, size, out);
  console.log(`  ${out}  ${size}px`);
}
for (const [out, size] of [
  ["public/apple-touch-icon.png", 180],
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
]) {
  await png(square, size, out);
  console.log(`  ${out}  ${size}px  square`);
}

writeFileSync("public/favicon.svg", rounded.replace(/ width="\d+" height="\d+"/, ""));
console.log("  public/favicon.svg  scalable");

// favicon.ico for the browsers and tools that ask for /favicon.ico.
const tmp = mkdtempSync(join(tmpdir(), "hs-ico-"));
const frames = [];
for (const size of [16, 32, 48]) {
  const f = join(tmp, `${size}.png`);
  await png(rounded, size, f);
  frames.push(f);
}
execFileSync("magick", [...frames, "public/favicon.ico"]);
console.log("  public/favicon.ico  16 32 48");
