// Scoate fundalul alb din PNG-uri, cu 2 profile:
//   - "vector"  → aggressive (pentru logo/graphics: pur negru/auriu pe alb pur)
//   - "photo"   → smooth feather (pentru sticle: shadows subtili, evita edges dure)
//
// Rulează:
//   node scripts/strip-white-bg.mjs
//
// Overwrite direct fișierele. Fișierele originale în Assets/ rămân neatinse.

import { Jimp, intToRGBA } from "jimp";
import { readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = "new_webpages/assets";

// ─── Config: ce profile aplic pe ce folder ─────────────────────────
const TARGETS = [
  { dir: `${ROOT}/logos`, profile: "vector", threshold: 235 },
  { dir: `${ROOT}/graphics`, profile: "vector", threshold: 235 },
  // Bottles: flood-fill de la marginea imaginii. threshold=220 înseamnă
  // orice pixel cu brightness ≥220 e „candidat bg"; BFS îl marchează doar
  // dacă e conectat cu marginea. Eticheta cremă din interior rămâne opacă
  // pentru că e izolată de sticla închisă. featherPx=3 = tranziție smooth
  // de 3 pixeli la marginea sticlei (fără edges dure).
  { dir: `${ROOT}/bottles`, profile: "photo", threshold: 220, feather: 3 },
];

/**
 * Vector — aggressive. Pixel „aproape alb" (r,g,b > threshold) → alpha 0.
 * Restul intact. Bun pentru artwork negru pe alb curat.
 */
function stripVector(img, threshold) {
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  const data = img.bitmap.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      if (r > threshold && g > threshold && b > threshold) {
        data[idx + 3] = 0;
      }
    }
  }
}

/**
 * Photo — flood-fill de la colțuri, doar pixelii conectați de bg exterior
 * devin transparenți. Eticheta interior (chiar dacă e crem/luminoasă)
 * rămâne opacă pentru că e izolată de sticla închisă din jur.
 *
 * Pași:
 *  1. Marchează toți pixelii cu brightness >= threshold ca „candidați bg"
 *  2. BFS de la fiecare colț al imaginii; extinde-te doar prin candidați bg
 *  3. Pixelii atinși de BFS → alpha 0 (bg extern)
 *  4. Pass de feather 1-2px: pixelii de la marginea BG-ului primesc alpha
 *     gradient (evită edges dure la sticla)
 *
 * threshold sugerat: 220-230. Feather (raza de smoothing): 2-4 px.
 */
function stripPhoto(img, threshold, featherPx = 3) {
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  const data = img.bitmap.data;
  const N = w * h;

  // 1. Bg candidate map (brightness >= threshold)
  const isCandidate = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    const idx = i * 4;
    const b = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    if (b >= threshold) isCandidate[i] = 1;
  }

  // 2. BFS de la marginea imaginii (nu doar cele 4 colțuri — orice pixel
  //    de pe bordură care e candidat bg)
  const isOutside = new Uint8Array(N);
  const queue = new Int32Array(N);
  let qHead = 0;
  let qTail = 0;

  function seed(i) {
    if (isCandidate[i] && !isOutside[i]) {
      isOutside[i] = 1;
      queue[qTail++] = i;
    }
  }
  // Top + bottom rows
  for (let x = 0; x < w; x++) {
    seed(x);
    seed((h - 1) * w + x);
  }
  // Left + right cols
  for (let y = 0; y < h; y++) {
    seed(y * w);
    seed(y * w + w - 1);
  }

  // BFS 4-connected
  while (qHead < qTail) {
    const p = queue[qHead++];
    const x = p % w;
    const y = (p - x) / w;
    if (x > 0) seed(p - 1);
    if (x < w - 1) seed(p + 1);
    if (y > 0) seed(p - w);
    if (y < h - 1) seed(p + w);
  }

  // 3. Aplică alpha: outside → 0
  for (let i = 0; i < N; i++) {
    if (isOutside[i]) data[i * 4 + 3] = 0;
  }

  // 4. Feather la margine — pentru fiecare pixel opac, verifică dacă un
  //    vecin la distanță <= featherPx e outside; dacă da, aplică alpha
  //    proporțional cu distanța (max distance → alpha 255, min → 30).
  if (featherPx > 0) {
    const alphaBackup = new Uint8Array(N);
    for (let i = 0; i < N; i++) alphaBackup[i] = data[i * 4 + 3];

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (isOutside[i]) continue;
        if (alphaBackup[i] === 0) continue;

        let minDist = featherPx + 1;
        for (let dy = -featherPx; dy <= featherPx; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= h) continue;
          for (let dx = -featherPx; dx <= featherPx; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= w) continue;
            const ni = ny * w + nx;
            if (isOutside[ni]) {
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d < minDist) minDist = d;
            }
          }
        }

        if (minDist <= featherPx) {
          // Linear interp: dist=0 → alpha 60, dist=featherPx → alpha 255
          const t = minDist / featherPx;
          const target = Math.round(60 + (255 - 60) * t);
          const cur = alphaBackup[i];
          if (target < cur) data[i * 4 + 3] = target;
        }
      }
    }
  }
}

async function processFile(path, profile, threshold, feather) {
  const img = await Jimp.read(path);
  if (profile === "vector") stripVector(img, threshold);
  else stripPhoto(img, threshold, feather);
  await img.write(path);
  return { path, w: img.bitmap.width, h: img.bitmap.height };
}

async function run() {
  let total = 0;
  for (const target of TARGETS) {
    const files = readdirSync(target.dir).filter(
      (f) => extname(f).toLowerCase() === ".png",
    );
    console.log(`\n▸ ${target.dir}  (${target.profile}, threshold ${target.threshold})`);
    for (const f of files) {
      const full = join(target.dir, f);
      if (!statSync(full).isFile()) continue;
      const r = await processFile(full, target.profile, target.threshold, target.feather ?? 0);
      console.log(`  ✓ ${f}  (${r.w}×${r.h})`);
      total++;
    }
  }
  console.log(`\nDone — ${total} files processed.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
