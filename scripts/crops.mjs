#!/usr/bin/env node
// Cuts the phone crops the <picture> elements swap in below 600 px. Each crop
// keeps the part of the frame that still reads at 390 px wide:
//   onair-classico    4:5 from the left (the score bug and the lower third)
//   youth-game        4:3 from the centre
//   marcar            34:25 from the left (the home half and the clock)
// An optional third value resizes the crop to that width.
// Run it after replacing a picture in public/images/.
import sharp from "sharp";

const crops = [
  ["onair-classico", { left: 0, top: 0, width: 864, height: 1080 }],
  ["youth-game", { left: 156, top: 0, width: 2569, height: 1927 }, 1080],
  ["marcar", { left: 0, top: 0, width: 1005, height: 739 }],
];

for (const [name, box, width] of crops) {
  const out = `public/images/${name}-phone.jpg`;
  let img = sharp(`public/images/${name}.jpg`).extract(box);
  if (width) img = img.resize({ width });
  const { width: w, height: h } = await img.jpeg({ quality: 80, mozjpeg: true }).toFile(out);
  console.log(`  ${out}  ${w}x${h}`);
}
