# Audit SEO — stadiu și pași rămași

Audit făcut pe 9 oct 2026 cu skill-ul `seo-locus` (`.claude/skills/seo-locus`),
fără motorul generic `~/.claude/skills/seo` (instalat doar pe laptop).
Verificări directe pe www.domeniul-locus.ro + cod + Supabase.

**Mod de lucru agreat cu Mihai:** luăm punctele pe rând, unul câte unul.
Rezolvi un punct, îl arăți, faci commit + push doar după confirmarea lui, apoi treci la următorul.
Textele vizibile (titluri, descrieri, copy) se propun întâi, nu se schimbă direct.

---

## Rezolvate

| # | Ce | Unde |
|---|---|---|
| 1 | Feed Google avea transport 19 lei (rămas de la Sameday); acum 32 lei Standard + 18 lei FANbox, luate din `lib/shipping.ts` | `lib/feed/products.ts` |
| 2 | og:image + og:site_name + og:locale lipseau pe /shop, /despre, /cuvinte, /semne, /pauze, /social (și site_name/locale pe paginile de vin). Helper comun `pageOpenGraph()` | `lib/seo/open-graph.ts` |
| 3 | Canonical pe `/`, `/contact`, `/parteneri`, `/livrare`, `/cum-cumperi`, `/termeni`, `/confidentialitate`, `/cookies` (`23d1e3f`) | `metadata.alternates` în fiecare `page.tsx` |
| 4 | Brandul de două ori în `<title>` pe `/shop`, `/parteneri`, `/livrare`, `/cum-cumperi` (+ `/cos`, `/checkout`, `/checkout/success`, `/coming-soon`) (`a0f5a67`) | `metadata.title` din pagini |
| 4b | og:title / og:url moșteneau homepage-ul pe contact, parteneri, livrare, cum-cumperi, retur, termeni, confidențialitate, cookies → `pageOpenGraph()` pe toate (`1b94c3f`) | `page.tsx` respective |
| 7 | Partea de cod: `wineDescription` punea toată descrierea de pairing cu literă mică → acum doar prima literă (`0b0e9d7`) | `lib/seo/schema.ts` |
| 9 | `lastmod` real: vinurile din `products.updated_at`, /shop și gamele = cea mai recentă modificare a vinurilor lor, paginile statice fără `lastmod` (`f3a0841`) | `app/sitemap.ts` |
| 11 | Redirect permanent 308 `/vinuri` → `/shop` (`64fa2c9`) | `next.config.ts` |
| 14 | `sameAs` → Instagram în schema `Winery` (`161e07b`) | `lib/seo/schema.ts` |
| 10 | AVIF cu fallback WebP (poza sticlei −31%) (`07b0b06`) | `next.config.ts` |
| 12 | LCP: sticla vizibilă din primul cadru (intrare doar CSS, fără `<Reveal>`), `sizes` + `fetchPriority` pe PDP (`b001262`); `fetchPriority` pe poza hero (`3386e11`); `gtm.js` încărcat `lazyOnload` (`99385ab`) | `components/pdp/*`, `components/landing/hero.tsx`, `app/layout.tsx` |
| 13 | Italiana + Libre Caslon declarate doar în pagina home, Inter doar în layout-ul admin → 8 fonturi preîncărcate în loc de 12 pe paginile obișnuite (`84323de`) | `app/(storefront)/page.tsx`, `app/(admin)/admin/layout.tsx` |
| 15 | **robots.txt bloca `/contact`**: regula `Disallow: /cont` era prefix → acum `/cont$` (`bc09dac`) | `app/robots.ts` |
| 16 | Accessibility 100 pe toate paginile publice: titlurile din footer `h4` → `h2`, pașii de pe /cum-cumperi `h3` → `h2`, cardurile „în curând" opacity 0.65 → 0.8 (contrast ≥ 4.5:1) (`7ca839a`) | `components/landing/footer.tsx`, `app/(storefront)/cum-cumperi/page.tsx`, `app/globals.css` |
| 17 | Fonturi: fără Cormorant italic și fără text înclinat (`ff70489`); un singur serif, Libre Caslon Display, în loc de Cormorant + Bellefair (`44c2c89`). Preload pe paginile obișnuite: 5 fișiere (era 12), ~75–85 KB fonturi (era 287 KB) | `app/layout.tsx`, `app/globals.css` |
| 6 | Pagini ascunse de Google până sunt gata: `/parteneri`, `/pauze`, `/social` → `noindex` + scoase din sitemap. `/cuvinte` și `/semne` rămân indexate (se ajunge la ele din gamele de pe home). Lista e într-un singur loc: `lib/seo/hidden-pages.ts` | `lib/seo/hidden-pages.ts` |
| 18 | `/llms.txt` — rezumatul magazinului pentru asistenții AI (vinuri, prețuri, livrare, contact), generat din catalog la fiecare oră. Crawlerele AI rămân permise (decizia lui Mihai: vrea să apară în răspunsurile asistenților) | `app/llms.txt/route.ts` |
| 5 | Redirect `domeniul-locus.ro` → www trecut din 307 în **308 permanent** (Vercel, setarea domeniului, 10 oct). Calea și parametrii se păstrează | Vercel → Domains |
| 19 | **IndexNow** — cheie publicată (`public/a59592763354845b9a9662938c6267bb.txt`), cele 17 URL-uri din sitemap trimise pe 10 oct (HTTP 202). Anunță Bing, care alimentează căutarea ChatGPT și Copilot. După schimbări de conținut: `node scripts/indexnow.mjs` | `scripts/indexnow.mjs` |
| 20 | **Google Analytics 4 funcționează** (10 oct): proprietate `G-39GETPN76Z` pe contul firmei; container GTM nou `GTM-5F2DQ9QN` (containerul vechi `GTM-5TNDPL7Z` era pe alt cont și gol), versiunea 2 publicată din `docs/gtm/ga4-import.json` — Google tag + GA4 Event pentru cele 8 evenimente de e-commerce. Confirmat în GA4 Realtime. Legat de Search Console (Admin → Product links) | `app/layout.tsx`, `docs/gtm/ga4-import.json` |
| 21 | Imagini pentru feed-uri: JPG 1200×1200 pe alb (`public/photos/products/feed/`), pentru că PNG-urile transparente apăreau cu fundal negru în Shopping. Site-ul păstrează PNG-urile. La o poză nouă: `node scripts/build-feed-images.mjs` (`f3e1457`) | `scripts/build-feed-images.mjs`, `lib/seo/schema.ts` |
| 7 | Descrierea din feed / JSON-LD nu mai repetă aromele: folosește doar nota de degustare (`taste`) + asocieri + specificații. Câmpurile din admin rămân neschimbate, fiecare are locul ei pe site (`a4a9f93`) | `lib/seo/schema.ts` |
| 8 | Meta description pe paginile de vin (varianta A, aleasă de Mihai): rezumatul vinului + tip, dulceață, alcool + „DOC-CMD Panciu, din Buciumeni”. Fără preț — Google îl arată oricum din schema Product | `app/(storefront)/vinuri/[slug]/page.tsx` |

Rezolvate tot atunci, în afara listei de audit:
- Preț pe litru afișat lângă fiecare preț (HG 947/2000) + `unit_pricing_measure` în feed — cerut de Merchant Center.
- /retur conform OUG 34/2014 art. 13–14: rambursare de la anunțarea retragerii, inclusiv livrarea inițială; clientul are 14 zile să trimită produsele.
- Plata la livrare = **doar cu cardul** (POS curier), nu numerar. Texte corectate în Termeni, Cum cumperi, pagina de succes, mailul de confirmare (și în DB, `email_templates.order_confirmation.payment_cash`).
- Livrare = **2–4 zile lucrătoare** peste tot (checkout, Cum cumperi, PDP, Termeni, mailuri, Merchant Center).
- Butonul „vezi vinurile” de pe `/plata` ducea la /vinuri (404) → /shop.

## Rămase, în ordine (actualizat 10 oct 2026)

Partea tehnică de pe site e terminată. Ce a rămas se face din conturi, din admin sau în afara site-ului.

### Pe conturi — le face Mihai, câteva minute fiecare
1. **Google Search Console** — proprietatea Domeniu `domeniul-locus.ro` e verificată (prin Cloudflare, 10 oct). De făcut: retrimite `https://www.domeniul-locus.ro/sitemap.xml` (avea „Eroare temporară de procesare”) și Solicită indexarea pentru `/contact`, `/shop` și cele 5 pagini de vin. Peste 3–7 zile: Indexare → Pagini.
3. **Bing Webmaster Tools** (opțional, pentru rapoarte) — login cu contul Google → „Import from Google Search Console”. Indexarea în Bing nu mai depinde de asta: e acoperită de IndexNow (#19).
4. **Merchant Center** — confirmă că la Products → „Provided by you” sunt 5 vinuri aprobate.


### GEO în afara site-ului — ca asistenții AI să recomande crama
Asistenții AI recomandă mai ales branduri menționate în surse de încredere, nu doar pe site-ul propriu.
7. **Google Business Profile** pentru cramă — adresă, poze, program de degustări, categorie „Cramă / Winery”. Gemini și ChatGPT îl folosesc des. (Claude poate scrie textele.)
8. **Recenzii reale** — Google, Vivino, eventual pe site.
9. **Mențiuni externe** — articole / bloguri despre vinuri, ghiduri ale podgoriei Panciu, liste de crame din Vrancea și Galați, presă locală.
10. **Nume, adresă, telefon identice peste tot** (site, Google, Vivino, social) — ca asistenții să recunoască aceeași cramă. Când apar profiluri oficiale noi, se adaugă în `sameAs` (`lib/seo/schema.ts`).

### Lighthouse — 10 oct 2026
Lighthouse 12 local (Chrome headless, profil mobil simulat), pe versiunea live după `61989ac`. Două rulări pe pagină — prima cu cache rece, a doua cu cache cald.

| Pagina | Performance | LCP | FCP | CLS | TBT | Accessibility | Best practices | SEO |
|---|---|---|---|---|---|---|---|---|
| `/` | 71 / 87 | 5,2 / 4,1 s | 3,0 / 1,4 s | 0,001 | 90 / 20 ms | 97 | 100 | 100 |
| `/shop` | 95 / 90 | 2,9 / 3,6 s | 1,3 / 1,2 s | 0,001 | 20 / 30 ms | 100 | 100 | 100 |
| `/vinuri/feteasca-neagra-cuvinte` | 80 / 89 | 5,0 / 3,8 s | 1,2 / 1,1 s | 0 | 90 / 30 ms | 99 | 100 | 100 |

Ținta din CLAUDE.md e > 95 la Performance; o atinge doar `/shop` la prima rulare. Accessibility: contrast insuficient pe home, ordine greșită a titlurilor pe pagina de vin.
De rulat din nou după 12 și 13: `npx lighthouse@12 <url> --only-categories=performance,seo,accessibility,best-practices`, de 2–3 ori pe pagină (variația e mare).


### Lighthouse — după etapele B și C (10 oct 2026)
Build de producție local, Lighthouse 12 mobil simulat, 3 rulări:

| Pagina | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| `/` | 83–85 | 100 | 100 | 100 |
| `/shop` | 84–89 | 100 | 100 | 100 |
| `/vinuri/feteasca-neagra-cuvinte` | 87–88 | 100 | 100 | 100 |

LCP real (fără throttling) 0,2–0,4 s; cu throttling real 4G ~2,6–3,1 s. Ce a mai rămas pentru > 95: fonturile preîncărcate concurează cu imaginea LCP pe conexiuni lente.
- **Încercat și respins:** IBM Plex Mono fără preload → CLS 0,32 pe pagina de vin (fișa produsului se lățește la swap). Plex rămâne preîncărcat.
- **Decis 10 oct:** fără italic; Libre Caslon Display singurul serif; Italiana doar în hero; Plex Mono la text și la cuvintele din manifest / numele gamelor.

### Lighthouse pe site-ul live — 10 oct 2026, după toate etapele
Lighthouse 12 mobil simulat pe www.domeniul-locus.ro, 3 rulări:

| Pagina | Performance | LCP | Accessibility | Best practices | SEO |
|---|---|---|---|---|---|
| `/` | 95–98 | 1,9–2,7 s | 100 | 100 | 100 |
| `/shop` | 91–96 | 1,9–2,5 s | 100 | 100 | 100 |
| `/vinuri/feteasca-neagra-cuvinte` | 85–93 | 2,6–3,1 s | 100 | 100 | 100 |
| `/despre` | 97 | 2,4–2,5 s | 100 | 100 | 100 |
| `/contact` | 95–97 | 2,5 s | 100 | 100 | 100 |

Pornire: home 71–87, shop 90–95, PDP 80–89 (tabelul din 10 oct de mai sus).
---

## Google Merchant Center (configurat 9 oct 2026)

Cont ID **5871567489**, nume „Domeniul Locus”.
- Shipping: 32 RON flat, gratuit peste 250 RON. Livrare 2–4 zile (handling 1, transit 1–3, L–V, cut-off 14:00 București).
- Retur: 14 zile, doar produse noi, by mail, clientul plătește transportul, rambursare 14 zile, URL `/retur`.
- Feed: `https://www.domeniul-locus.ro/api/feed/google.xml` = „PRODUCTS SOURCE 2”, zilnic, Romania, Romanian. Generat live din DB — un vin nou activ în admin apare singur.
- Sursa „Found by Google” a fost oprită („Stop managing products”), ca toate cele 5 vinuri să vină din feed.
- **De verificat:** Products → „Provided by you” trebuie să fie 5; produsele așteaptă verificarea inițială (până la 3 zile lucrătoare). Mesajul „Alcoholic beverages” e doar informativ — nu se apasă „I disagree”.
- Verificarea site-ului (meta tag / fișier HTML): dacă Google o cere, Mihai trimite codul și se pune pe site.

## Alte lucruri deschise

- **Reminder plată neefectuată** (livrat 8 oct): sesiunea Stripe expiră după 3h → alertă la office@ + mail către client cu link `/plata/...` valabil 7 zile. **Netestat în producție** — la prima comandă neplătită, verifică în admin istoricul („Reminder de plată trimis clientului”) și mailul.
- Seturile de pe home (3 sticle) nu au preț pe litru — de confirmat cu juristul dacă e nevoie.
- Retur parțial (doar unele sticle): nu e clar dacă se datorează transportul inițial — de confirmat cu juristul.
