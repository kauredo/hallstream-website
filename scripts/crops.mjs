#!/usr/bin/env node
// Cuts the phone crops the <picture> elements swap in below 600 px. Each crop
// keeps the part of the frame that still reads at 390 px wide:
//   onair-classico-phone     4:5 from the left (the hero: the score bug and the lower third)
//   onair-*-look-phone       4:5 from the top left, tight on the score bug (On air);
//                            Classic takes the full height, since its frame has a lower third
//   onair-cor-final-look-phone  the final result from the centre, topped up
//                            with its own blue and white to make 4:5
//   youth-game               4:3 from the centre
// `width` resizes the crop; `extend` adds solid edges after the cut.
// Run it after replacing a picture in public/images/; `node scripts/crops.mjs
// public/images/en` cuts the English on-air frames (youth-game is skipped there).
import { existsSync } from "node:fs";
import sharp from "sharp";

const dir = process.argv[2] ?? "public/images";

const bug = { left: 0, top: 0, width: 760, height: 950 };
const crops = [
  { name: "onair-classico", out: "onair-classico-phone", box: { left: 0, top: 0, width: 864, height: 1080 } },
  { name: "onair-classico", out: "onair-classico-look-phone", box: { left: 0, top: 0, width: 864, height: 1080 }, width: 760 },
  ...["lombada", "placa", "pavilhao"].map((look) => ({ name: `onair-${look}`, out: `onair-${look}-look-phone`, box: bug })),
  {
    name: "onair-cor-final",
    out: "onair-cor-final-look-phone",
    box: { left: 370, top: 0, width: 1180, height: 1080 },
    extend: [
      { top: 280, background: { r: 47, g: 74, b: 122 } },
      { bottom: 115, background: { r: 255, g: 255, b: 255 } },
    ],
    width: 864,
  },
  { name: "youth-game", out: "youth-game-phone", box: { left: 156, top: 0, width: 2569, height: 1927 }, width: 1080 },
];

for (const { name, out, box, extend = [], width } of crops) {
  if (!existsSync(`${dir}/${name}.jpg`)) continue;
  const file = `${dir}/${out}.jpg`;
  let buf = await sharp(`${dir}/${name}.jpg`).extract(box).toBuffer();
  for (const edge of extend) buf = await sharp(buf).extend(edge).toBuffer();
  let img = sharp(buf);
  if (width) img = img.resize({ width });
  const { width: w, height: h } = await img.jpeg({ quality: 80, mozjpeg: true }).toFile(file);
  console.log(`  ${file}  ${w}x${h}`);
}
