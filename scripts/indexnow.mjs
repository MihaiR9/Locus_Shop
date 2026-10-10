// Anunță Bing (și restul motoarelor IndexNow: Yandex, Seznam, Naver…) că
// paginile din sitemap s-au schimbat. Fără cont: dovada că site-ul e al nostru
// e fișierul-cheie din public/.
//
// Rulează după un deploy cu schimbări de conținut (vin nou, preț nou, text nou):
//   node scripts/indexnow.mjs
//
// Bing tratează asta ca pe o invitație de recrawl, nu ca pe o garanție de
// indexare. Nu rula în buclă: retrimiterea acelorași URL-uri nu ajută.

const SITE = "https://www.domeniul-locus.ro";
const KEY = "a59592763354845b9a9662938c6267bb";

const keyRes = await fetch(`${SITE}/${KEY}.txt`);
if (!keyRes.ok || (await keyRes.text()).trim() !== KEY) {
  console.error(`Fișierul-cheie ${SITE}/${KEY}.txt nu e publicat încă. Așteaptă deploy-ul.`);
  process.exit(1);
}

const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urlList.length === 0) {
  console.error("Sitemap-ul nu conține URL-uri.");
  process.exit(1);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(SITE).host,
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList,
  }),
});

// 200 = primit, 202 = primit, cheia se validează ulterior.
console.log(`IndexNow: HTTP ${res.status} pentru ${urlList.length} URL-uri`);
if (res.status >= 400) {
  console.error(await res.text());
  process.exit(1);
}
