#!/usr/bin/env node
// Cuts the phone crops the <picture> elements swap in below 600 px. Each crop
// keeps the part of the frame that still reads at 390 px wide, the same cuts
// the canvas made with object-position:
//   overlay-classico  1:1 from the left (the score bug and the lower third)
//   overlay-cor-final 1:1 from the centre (the score by quarter)
//   marcar            34:25 from the left (the home half and the clock)
//   panel-aparencia   the preview and the list of looks
// Run it after replacing a screenshot in public/images/.
import sharp from "sharp";

const crops = [
  ["overlay-classico", { left: 0, top: 0, width: 900, height: 900 }],
  ["overlay-cor-final", { left: 350, top: 0, width: 900, height: 900 }],
  ["marcar", { left: 0, top: 0, width: 1005, height: 739 }],
  ["panel-aparencia", { left: 336, top: 108, width: 1216, height: 737 }],
];

for (const [name, box] of crops) {
  const out = `public/images/${name}-phone.jpg`;
  await sharp(`public/images/${name}.jpg`).extract(box).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
  console.log(`  ${out}  ${box.width}x${box.height}`);
}
