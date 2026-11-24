#!/usr/bin/env node
// Cuts the phone crops the <picture> elements swap in below 600 px. Each crop
// keeps the part of the frame that still reads at 390 px wide:
//   onair-classico    4:5 from the left (the score bug and the lower third)
//   youth-game        4:3 from the centre
//   marcar            34:25 from the left (the home half and the clock)
//   panel-aparencia   the preview and the list of looks
// Run it after replacing a picture in public/images/.
import sharp from "sharp";

const crops = [
  ["onair-classico", { left: 0, top: 0, width: 864, height: 1080 }],
  ["youth-game", { left: 156, top: 0, width: 2569, height: 1927 }, 1080],
  ["marcar", { left: 0, top: 0, width: 1005, height: 739 }],
  ["panel-aparencia", { left: 336, top: 108, width: 1216, height: 737 }],
];

for (const [name, box, width] of crops) {
  const out = `public/images/${name}-phone.jpg`;
  let img = sharp(`public/images/${name}.jpg`).extract(box);
  if (width) img = img.resize({ width });
  await img.jpeg({ quality: 80, mozjpeg: true }).toFile(out);
  console.log(`  ${out}  ${box.width}x${box.height}`);
}
