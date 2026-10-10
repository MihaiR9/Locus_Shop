// Fundalul imaginii de partajare (app/opengraph-image.tsx): fotografia cu
// dealurile din hero, decupată 1200×630 și adusă în tonul site-ului.
//
// Pe site, tonul vine din CSS (`.hero-frame.frame-1 .ken > img`:
// saturate(0.42) sepia(0.22)). Satori, care randează imaginea OG, nu
// suportă filtre, așa că îl aplicăm o dată, pe fișier.
//
// Rulează după ce se schimbă fotografia din hero:
//   node scripts/build-og-image.mjs

import { Jimp } from "jimp";

const SRC = "public/photos/hero/dealuri.jpg";
const OUT = "public/brand/og-dealuri.jpg";

const img = await Jimp.read(SRC);
img.cover({ w: 1200, h: 630 });
img.color([{ apply: "desaturate", params: [58] }]);

const sepia = img.clone().sepia();
img.composite(sepia, 0, 0, { opacitySource: 0.22 });

await img.write(OUT, { quality: 86 });
console.log(OUT);
