import "server-only";

/**
 * Încarcă Italiana (fontul serif al brandului) pentru generarea OG images.
 *
 * Satori — motorul din spatele `ImageResponse` — NU suportă woff2, doar
 * TTF/OTF/WOFF. Google Fonts servește woff2 către browsere moderne, dar
 * întoarce TTF când request-ul nu are `User-Agent`. De asta cerem CSS-ul
 * fără UA și extragem URL-ul .ttf din el.
 *
 * Dacă rețeaua pică, întoarcem `null` și ImageResponse cade pe fontul
 * default — imaginea iese mai puțin „de brand", dar nu se rupe build-ul.
 */

let cached: ArrayBuffer | null | undefined;

export async function loadItalianaFont(): Promise<ArrayBuffer | null> {
  if (cached !== undefined) return cached;

  try {
    const cssRes = await fetch(
      "https://fonts.googleapis.com/css2?family=Italiana&display=swap",
    );
    if (!cssRes.ok) throw new Error(`css ${cssRes.status}`);

    const css = await cssRes.text();
    const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
    if (!url) throw new Error("font url not found in css");

    const fontRes = await fetch(url);
    if (!fontRes.ok) throw new Error(`font ${fontRes.status}`);

    cached = await fontRes.arrayBuffer();
    return cached;
  } catch (err) {
    console.error("[og-font] Italiana indisponibil, folosesc fontul default:", err);
    cached = null;
    return null;
  }
}
