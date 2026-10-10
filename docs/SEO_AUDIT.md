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

Rezolvate tot atunci, în afara listei de audit:
- Preț pe litru afișat lângă fiecare preț (HG 947/2000) + `unit_pricing_measure` în feed — cerut de Merchant Center.
- /retur conform OUG 34/2014 art. 13–14: rambursare de la anunțarea retragerii, inclusiv livrarea inițială; clientul are 14 zile să trimită produsele.
- Plata la livrare = **doar cu cardul** (POS curier), nu numerar. Texte corectate în Termeni, Cum cumperi, pagina de succes, mailul de confirmare (și în DB, `email_templates.order_confirmation.payment_cash`).
- Livrare = **2–4 zile lucrătoare** peste tot (checkout, Cum cumperi, PDP, Termeni, mailuri, Merchant Center).
- Butonul „vezi vinurile” de pe `/plata` ducea la /vinuri (404) → /shop.

## Rămase, în ordine

### 5. Domeniul fără www redirecționează cu 307 (temporar) — Important, îl face Mihai
`https://domeniul-locus.ro` → 307 → www. Trebuie 308 (permanent).
Vercel → proiect → Settings → Domains → `domeniul-locus.ro` → Edit → redirect permanent (308) către www.

### 6. Pagini „ascunse” dar indexabile — decizia lui Mihai
`/cuvinte`, `/semne`, `/pauze`, `/parteneri` sunt scoase din meniu dar sunt în `sitemap.xml`. `/social` nu e în sitemap dar e indexabilă (200 + canonical).
De întrebat: rămân în Google sau `noindex` + scoase din `app/sitemap.ts` până sunt gata?

### 7. Descrieri repetate în feed / JSON-LD — Minor, conținut
Câmpurile `short` și `notes` ale vinurilor (din admin) se suprapun → fraze dublate în descriere. Partea de cod e rezolvată (vezi tabelul).

### 8. Meta description pe paginile de vin — Minor, copy
~65 caractere, conține prețul (se poate învechi). Se generează în `app/(storefront)/vinuri/[slug]/page.tsx`. **Propune texte lui Mihai înainte.**

### 10. AVIF neactivat — Minor
`next.config` → `images.formats: ["image/avif", "image/webp"]`. Acum se servește doar WebP.

### 12. LCP lent pe mobil (home + paginile de vin) — Important
Vezi măsurătorile Lighthouse de mai jos. Imaginea LCP e descoperită devreme și preîncărcată, dar:
- **Pagina de vin** (`components/pdp/wine-gallery.tsx`): imaginea sticlei n-are `sizes` → pe mobil se descarcă varianta de 1920px pentru 370px afișați. Fără `fetchPriority="high"` (în Next 16, `priority` face doar preload). Galeria e în `<Reveal>` (`components/pdp/wine-hero.tsx`) → pornește cu `opacity: 0` până la hidratare.
- **Home** (`components/landing/hero.tsx`): poza hero n-are `fetchPriority="high"`. „Element render delay” variază între 20 ms și 2 s de la o rulare la alta — de investigat cu un trace înainte de alte schimbări.

### 13. 12 fișiere de font preîncărcate pe fiecare pagină — Important
`app/layout.tsx` încarcă 6 familii (Italiana, Cormorant Garamond, Libre Caslon Display, IBM Plex Mono, Bellefair, Inter), ~270 KB preload pe orice pagină.
- **Inter** e folosit doar în admin (`admin.css`) → `preload: false` (sau mutat în layout-ul de admin).
- Italiana apare într-un singur loc (hero), Libre Caslon în două → de discutat cu Mihai dacă rămân.

### Lighthouse — 10 oct 2026
Lighthouse 12 local (Chrome headless, profil mobil simulat), pe versiunea live după `61989ac`. Două rulări pe pagină — prima cu cache rece, a doua cu cache cald.

| Pagina | Performance | LCP | FCP | CLS | TBT | Accessibility | Best practices | SEO |
|---|---|---|---|---|---|---|---|---|
| `/` | 71 / 87 | 5,2 / 4,1 s | 3,0 / 1,4 s | 0,001 | 90 / 20 ms | 97 | 100 | 100 |
| `/shop` | 95 / 90 | 2,9 / 3,6 s | 1,3 / 1,2 s | 0,001 | 20 / 30 ms | 100 | 100 | 100 |
| `/vinuri/feteasca-neagra-cuvinte` | 80 / 89 | 5,0 / 3,8 s | 1,2 / 1,1 s | 0 | 90 / 30 ms | 99 | 100 | 100 |

Ținta din CLAUDE.md e > 95 la Performance; o atinge doar `/shop` la prima rulare. Accessibility: contrast insuficient pe home, ordine greșită a titlurilor pe pagina de vin.
De rulat din nou după 12 și 13: `npx lighthouse@12 <url> --only-categories=performance,seo,accessibility,best-practices`, de 2–3 ori pe pagină (variația e mare).

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
- Tabelul pe zone de pe `/livrare` spune 1–2 zile pentru București/vecini, sub cele „2–4 zile” promise în rest. De întrebat dacă se ajustează.
- Seturile de pe home (3 sticle) nu au preț pe litru — de confirmat cu juristul dacă e nevoie.
- Retur parțial (doar unele sticle): nu e clar dacă se datorează transportul inițial — de confirmat cu juristul.
- Imaginea de partajare (`app/opengraph-image.tsx`) e un card tipografic generat din cod; Mihai poate vrea o fotografie reală.
