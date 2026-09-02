/**
 * Desenează „semnele" brandului — pătrat, triunghi, asterisc, cerc, romb —
 * ca PNG-uri pentru semnătura de email.
 *
 * De ce nu SVG: Outlook desktop randează emailul cu motorul Word, care nu
 * afișează SVG. De ce nu fișierele din `Assets/Graphics`: acelea sunt
 * modelele triunghiulare („semne grafica 1/2/3"), nu rândul de marcaje.
 *
 * Desenăm la rezoluție mare și micșorăm la final — așa marginile ies
 * netede fără să implementăm anti-aliasing de mână.
 */
import { Jimp, rgbaToInt } from "jimp";
import fs from "node:fs";

const INK = "#1a1a1a";
const SS = 6; // factor de supraeșantionare
const BOX = 22; // latura casetei unui semn, la 2x
const GAP = 34; // spațiul dintre semne, la 2x

/** Testele de apartenență: primesc coordonate normalizate în [-1, 1]. */
const MARKS = {
  square: (x, y) => Math.abs(x) <= 0.72 && Math.abs(y) <= 0.72,
  triangle: (x, y) => {
    // triunghi echilateral cu vârful în sus
    const h = 0.86;
    if (y > h) return false;
    const t = (y + h) / (2 * h); // 0 la vârf, 1 la bază
    return Math.abs(x) <= h * t;
  },
  asterisk: (x, y) => {
    // șase brațe la 60°, groase cât `w`
    const w = 0.16;
    const len = 0.95;
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI) / 3;
      const px = x * Math.cos(a) + y * Math.sin(a);
      const py = -x * Math.sin(a) + y * Math.cos(a);
      if (Math.abs(py) <= w && Math.abs(px) <= len) return true;
    }
    return false;
  },
  circle: (x, y) => x * x + y * y <= 0.76 * 0.76,
  diamond: (x, y) => Math.abs(x) + Math.abs(y) <= 0.98,
};

const r = parseInt(INK.slice(1, 3), 16);
const g = parseInt(INK.slice(3, 5), 16);
const b = parseInt(INK.slice(5, 7), 16);
const COLOR = rgbaToInt(r, g, b, 255);

/** Desenează un semn într-o imagine pătrată de latură `size` (deja la SS). */
function drawMark(img, name, ox, oy, size) {
  const test = MARKS[name];
  const half = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x - half + 0.5) / half;
      const ny = (y - half + 0.5) / half;
      if (test(nx, ny)) img.setPixelColor(COLOR, ox + x, oy + y);
    }
  }
}

fs.mkdirSync("public/brand/email/signature", { recursive: true });

const names = Object.keys(MARKS);

// ── Rândul complet ────────────────────────────────────────────────
{
  const w = names.length * BOX + (names.length - 1) * GAP;
  const big = new Jimp({ width: w * SS, height: BOX * SS, color: 0x00000000 });
  names.forEach((n, i) => {
    drawMark(big, n, i * (BOX + GAP) * SS, 0, BOX * SS);
  });
  big.resize({ w, h: BOX });
  await big.write("public/brand/email/signature/semne-row.png");
  console.log(`semne-row.png        ${w}x${BOX}`);
}

// ── Rândul vertical ───────────────────────────────────────────────
{
  const h = names.length * BOX + (names.length - 1) * GAP;
  const big = new Jimp({ width: BOX * SS, height: h * SS, color: 0x00000000 });
  names.forEach((n, i) => {
    drawMark(big, n, 0, i * (BOX + GAP) * SS, BOX * SS);
  });
  big.resize({ w: BOX, h });
  await big.write("public/brand/email/signature/semne-col.png");
  console.log(`semne-col.png        ${BOX}x${h}`);
}

// ── Fiecare semn separat, pentru marcaje de listă ─────────────────
for (const n of names) {
  const big = new Jimp({ width: BOX * SS, height: BOX * SS, color: 0x00000000 });
  drawMark(big, n, 0, 0, BOX * SS);
  big.resize({ w: BOX, h: BOX });
  await big.write(`public/brand/email/signature/semn-${n}.png`);
}
console.log(`semn-*.png           ${BOX}x${BOX}  (${names.join(", ")})`);
