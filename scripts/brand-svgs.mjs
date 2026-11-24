#!/usr/bin/env node
// Turns the brand package's reversed lockup into the site's inline lockup:
// no ground, every fill currentColor, and a viewBox cropped to the drawing
// (measured with getBBox: the mark runs x 3.6 to 168.5, the name 188.6 to
// 715.6, both 0 to 100 tall). Run it again if the brand package changes.
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync("src/assets/brand/reversed.svg", "utf8");
const out = src
  .replace(/<rect[^>]*\/>/, "")
  .replace(/fill="#[0-9A-Fa-f]{6}"/g, 'fill="currentColor"')
  .replace(/viewBox="[^"]*"/, 'viewBox="3 -1 714 102"')
  .replace(/ width="\d+" height="\d+"/, "");
writeFileSync("src/assets/brand/lockup.svg", out);
console.log("src/assets/brand/lockup.svg");
