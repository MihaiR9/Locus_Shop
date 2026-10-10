// Imagini pentru feed-urile de produse (Google Merchant, Meta): JPG pătrat
// 1200×1200 pe fundal alb, sticla centrată pe ~90% din înălțime.
//
// De ce: pozele de pe site sunt PNG transparente; Google Shopping afișează
// transparența ca negru la cele care au pixelii transparenți codificați negru.
// Site-ul păstrează PNG-urile; doar feed-ul folosește variantele din feed/.
//
// Rulează după ce se schimbă o poză de produs:
//   node scripts/build-feed-images.mjs

import { Jimp } from "jimp";
import { mkdirSync, readdirSync } from "node:fs";
import { join, basename, extname } from "node:path";

const SRC = "public/photos/products";
const OUT = join(SRC, "feed");
const SIZE = 1200;
const BOTTLE_HEIGHT = Math.round(SIZE * 0.9);

mkdirSync(OUT, { recursive: true });

for (const file of readdirSync(SRC).filter((f) => extname(f) === ".png")) {
  const bottle = await Jimp.read(join(SRC, file));
  bottle.resize({ h: BOTTLE_HEIGHT });

  const canvas = new Jimp({ width: SIZE, height: SIZE, color: 0xffffffff });
  canvas.composite(
    bottle,
    Math.round((SIZE - bottle.bitmap.width) / 2),
    Math.round((SIZE - bottle.bitmap.height) / 2),
  );

  const out = join(OUT, `${basename(file, ".png")}.jpg`);
  await canvas.write(out, { quality: 88 });
  console.log(out);
}
