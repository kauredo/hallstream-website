#!/usr/bin/env node
// Writes WebP copies of the hero frame, which the home page serves ahead of the JPEGs.
// Run it after replacing onair-classico*.jpg (or re-running crops.mjs).
import sharp from "sharp";

for (const name of ["onair-classico", "onair-classico-960", "onair-classico-phone"]) {
  const out = `public/images/${name}.webp`;
  const { size } = await sharp(`public/images/${name}.jpg`).webp({ quality: 72, effort: 6 }).toFile(out);
  console.log(`  ${out}  ${Math.round(size / 1024)} KB`);
}
