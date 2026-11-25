#!/usr/bin/env node
// Writes WebP copies of the hero frame, which the home page serves ahead of the JPEGs.
// Run it after replacing onair-classico*.jpg (or re-running crops.mjs).
// `node scripts/webp.mjs public/images/en` does the English copies.
import sharp from "sharp";

const dir = process.argv[2] ?? "public/images";

for (const name of ["onair-classico", "onair-classico-960", "onair-classico-phone"]) {
  const out = `${dir}/${name}.webp`;
  const { size } = await sharp(`${dir}/${name}.jpg`).webp({ quality: 72, effort: 6 }).toFile(out);
  console.log(`  ${out}  ${Math.round(size / 1024)} KB`);
}
