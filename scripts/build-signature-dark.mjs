/**
 * Variantele deschise ale mărcilor, pentru semnătura pe fundal închis.
 *
 * Logoul brandului e negru pe transparent — pe fundal de pivniță ar
 * dispărea. Îl recolorăm în crem, la fel semnele și modelul triunghiular.
 * Nu inversăm imaginea: recolorăm doar pixelii opaci, ca forma să rămână
 * exact aceeași.
 *
 * Culorile sunt cele din tema dark a site-ului (`app/globals.css`):
 *   ink       #ebe1da   ink-soft  #cbbeae   ink-mute  #a89d8d
 */
import { Jimp, intToRGBA, rgbaToInt } from "jimp";
import fs from "node:fs";

const OUT = "public/brand/email/signature";
fs.mkdirSync(OUT, { recursive: true });

/** Recolorează tot ce e opac, păstrând forma și alpha. */
function tint(img, hex, alphaScale = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  for (let y = 0; y < img.bitmap.height; y++) {
    for (let x = 0; x < img.bitmap.width; x++) {
      const { a } = intToRGBA(img.getPixelColor(x, y));
      if (a === 0) continue;
      img.setPixelColor(rgbaToInt(r, g, b, Math.round(a * alphaScale)), x, y);
    }
  }
  return img;
}

async function recolor(src, out, hex, { width, alpha = 1 } = {}) {
  const img = await Jimp.read(src);
  if (width) img.resize({ w: width });
  tint(img, hex, alpha);
  await img.write(out);
  console.log(`${out.split("/").pop().padEnd(26)} ${img.bitmap.width}x${img.bitmap.height}`);
}

// Logo și simbol, în crem.
await recolor("public/brand/logo-locus.png", `${OUT}/logo-light.png`, "#ebe1da", { width: 360 });
await recolor("public/brand/simbol-negru.png", `${OUT}/simbol-light.png`, "#ebe1da");

// Semnele, în crem — rândul, coloana și fiecare separat.
for (const n of ["row", "col"]) {
  await recolor(`${OUT}/semne-${n}.png`, `${OUT}/semne-${n}-light.png`, "#ebe1da");
}
for (const n of ["square", "triangle", "asterisk", "circle", "diamond"]) {
  await recolor(`${OUT}/semn-${n}.png`, `${OUT}/semn-${n}-light.png`, "#cbbeae");
}

