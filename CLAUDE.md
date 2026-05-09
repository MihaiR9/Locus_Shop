# Domeniul Locus — Brief & Context complet pentru proiectul shop

> Fișier de export pentru continuarea proiectului într-un workspace VSCode separat
> dedicat aplicației de e-commerce. Conține brief-ul, contextul brand, design,
> stadiul curent, decizii arhitecturale și roadmap.
>
> **Pentru agentul AI care preia:** acest fișier e singura ta sursă de adevăr.
> Citește-l integral înainte să faci orice. Dacă ceva e ambiguu, întreabă pe Mihai
> (roscaneanumihai@gmail.com).

---

## 0. STARE CURENTĂ (mai 2026)

**Stadiu:** **prototip vizual finalizat**, NU lansabil ca atare.

**Ce există** (în repo-ul actual `/Users/mihairoscaneanu/0_Dev/1_Locus_agentic_team/`):
- `Locus_landing/Landing_V1.html` — landing principal (hero + manifesto Origine/Timp/Măsură + game + sticle + despre + newsletter + footer). 95 KB, complet stilat, animații reveal, theme dark/light.
- `Locus_landing/wine.html` — pagina produs (PDP) cu cart drawer + carousel sticle.
- `Locus_landing/checkout.html` — checkout 3 pași (livrare cu tabs curier/ridicare, facturare fizica/juridică, plată card online/la livrare) + sumar sticky + persistent localStorage.
- `Locus_landing/logo-locus.png` (transparent, extras din PDF brandbook), `logo-locus@2x.png`
- `Locus_landing/hero-amfora.png` (foto brand pentru hero)
- `brand-assets/Imagini/` — 3 foto-uri brand: amforă (`LOCUS_web_hompage_desaturat.png`), banc cu vin (`LOCUS_web_dining setup.png`), frunze (`LOCUS_webpage_frunze.jpeg`)
- `context/LOCUS_BRANDBOOK_260904.pdf.pdf` — brandbook oficial 18 pagini
- `context/LOCUS_LOGO_BOW_260311.pdf` — logo sursa
- `context/LOCUS_Landing.jpeg` — referință vizuală layout

**Ce NU există încă** (deci NU putem lansa):
- ❌ Backend real (totul e static HTML + localStorage)
- ❌ Bază de date (catalog hardcoded în JS, 6 vinuri)
- ❌ Plăți reale (checkout-ul e mock — buton "Plasează comanda" doar afișează overlay success)
- ❌ Cont Stripe / Smartbill / Sameday / ANAF
- ❌ Email tranzacțional
- ❌ Cont client (login, istoric)
- ❌ Admin (CRUD produse, comenzi)
- ❌ Pagini legale (T&C, GDPR, retur, ANPC)
- ❌ Verificare 18+ alcool
- ❌ Cookie banner
- ❌ Domeniu, hosting, deployment
- ❌ Foto-uri pentru toate cele 6 vinuri (avem doar SVG generate)
- ❌ Conținut text real per produs (descrieri, fișe tehnice, pairing)

---

## 1. Brand & business

**Numele:** Domeniul Locus
**Tagline:** *un loc. un timp. un vin.*
**Localizare:** Buciumeni — între Panciu și Nicorești (regiune viticolă istorică, Vrancea/Galați)
**Categoria:** producător de vin, vânzare directă (D2C) + posibil B2B/HoReCa
**Owner / decident:** Mihai Roscăneanu (roscaneanumihai@gmail.com)

**Voce / ton brand:**
- minimalist, contemplativ, "slow"
- limbaj scurt, cu pauză
- folosește des: *origine, timp, măsură, locul, parcurs, mărturie*
- **fără emoji, fără excese de marketing**
- mereu: avertisment "consum responsabil / sulfiți"

**Game produs (denumiri proprii):**
- **cuvinte** — gama de bază (LC01, LC02, LC04)
- **semne** — gama premium (LS01, LS02, LS04)
- **pauze** — viitor (rezerve / ediții limitate)

**Catalog actual (mock — vezi `Landing_V1.html` linia ~2233):**
| Cod | Nume | Gamă | Tip | Preț |
|-----|------|------|-----|------|
| LC01 | Fetească Regală | cuvinte | Alb · Demisec · 13.5% | 79 lei |
| LC02 | Fetească Neagră | cuvinte | Roșu · Demisec · 14.9% | 89 lei |
| LC04 | Riesling Italian | cuvinte | Alb · Sec · 13% | 79 lei |
| LS01 | Fetească Regală | semne | Alb · Demisec · 13.5% | 109 lei |
| LS02 | Fetească Neagră | semne | Roșu · Demisec · 14.9% | 119 lei |
| LS04 | Riesling Italian | semne | Alb · Sec · 13% | 109 lei |

---

## 2. Design system (extras din `Landing_V1.html`)

**Fonts (Google Fonts):**
- Serif display: **Italiana** — pentru hero, manifesto, game, prețuri (toate `--font-serif`)
- Mono: **IBM Plex Mono** — UI, eyebrow, body, labels

> ⚠️ Brandbook-ul oficial (pagina 10) specifică **Lora** ca font serif (Semibold pentru H1, Regular pentru H2). În testare, Mihai a preferat să rămână pe **Italiana** pentru landing pentru look-ul fashion/art-deco subțire mai apropiat de referință (`context/LOCUS_Landing.jpeg`). În noul proiect: **default Italiana, Lora rămâne disponibil ca opțiune secundară**. Discută cu Mihai înainte de a schimba.

**Tokens — light mode:**
```css
--pamant:   #EBE1DA;  /* bg principal */
--nisip:    #CBBEAE;
--piatra:   #A89D8D;  /* ink-mute */
--vie:      #3E4336;  /* accent verde închis (focus, success) */
--stejar:   #4A3C2D;  /* ink-soft */
--pivnita:  #1A1A1A;  /* ink principal */

--bg:       var(--pamant);
--bg-alt:   #E2D8CE;
--surface:  #F2EAE2;
--ink:      var(--pivnita);
--ink-soft: var(--stejar);
--ink-mute: var(--piatra);
--line:     rgba(74, 60, 45, 0.18);
--field-bg: #F6EFE8;
```

**Tokens — dark mode (`[data-theme="dark"]`):**
```css
--bg:       var(--pivnita);
--bg-alt:   #111111;
--surface:  #232220;
--ink:      var(--pamant);
--ink-soft: var(--nisip);
--ink-mute: var(--piatra);
--line:     rgba(203, 190, 174, 0.18);
```

**Typography utilities (Italiana, weight 400):**
- `.display` — clamp(56px, 11vw, 168px) line-height 0.92, letter-spacing -0.02em
- `.h2` — clamp(40px, 6vw, 88px) line-height 1.0
- `.h3` — clamp(28px, 3.5vw, 44px) line-height 1.1
- `.hero-title` — clamp(64px, 12vw, 192px) line-height 0.88
- `.manifesto-item .word` — clamp(56px, 7vw, 112px)
- `.gama-tag` — clamp(48px, 6vw, 88px)
- `.eyebrow` — 11px mono uppercase letter-spacing 0.22em cu liniuță (`::before width:18px height:1px`)
- `.lead` — 14px mono line-height 1.75
- `.caps` — 11px uppercase letter-spacing 0.18em

**Componente vizuale recurente:**
- **Film grain overlay** — SVG turbulence cu opacity 0.06, mix-blend-mode multiply (light) / screen (dark), `position: fixed inset:0 z-index:1000 pointer-events:none`
- **Reveal animations** — `.reveal` și `.reveal-stagger` cu IntersectionObserver, `prefers-reduced-motion: reduce` le forțează vizibile
- **Buton primar** — bordură 1px, fill animat de jos în sus la hover (`::after translateY 101% → 0`)
- **Săgeată CTA** — sprite SVG `#arrow-right` cu translate-x 6px la hover
- **Sticla SVG** — generator JS (`bottleSvg(color)` în `Landing_V1.html` ~linia 2256), două variante: `red` și `white`

**Easing & timing:**
```css
--ease:   cubic-bezier(0.22, 0.61, 0.36, 1);
--t-fast: 240ms;
--t-base: 480ms;
--t-slow: 800ms;
```

**Container:** `--container: 1320px`, `--px: clamp(20px, 4.5vw, 56px)`

---

## 3. Persistență client curentă (de migrat la Supabase)

LocalStorage keys folosite în prototip:
- `locus-cart` → `{ [code]: qty }` — produsele din coș
- `locus-shipping` → date livrare salvate (curier sau ridicare)
- `locus-billing` → date facturare (fizică sau juridică)
- `locus-theme` → `light` | `dark`

În noul proiect: cart pentru guest în cookie/sessionStorage, pentru user logat în DB. Theme rămâne în localStorage.

---

## 4. Decizia arhitecturală (deja luată)

**NU** Shopify. **NU** Lovable. **DA** stack propriu cu Claude Code.

### Stack final agreat
```
Frontend:    Next.js 15 (App Router) + Tailwind + tokens design existent
Backend:     Next.js Server Actions / API routes
DB:          Supabase (Postgres + Auth + Storage + RLS)
Plăți:       Stripe Checkout (PCI = SAQ-A, hosted)
Email:       Resend
Imagini:     Supabase Storage (sau Cloudinary)
Curier:      Sameday API
Facturare:   Smartbill API → ANAF e-Factura (UBL 2.1)
Hosting:     Vercel
Monitoring:  Sentry + Better Stack uptime
Admin:       Next.js dashboard custom cu Supabase Auth
```

### Cost lunar estimat
- Vercel free tier (până la trafic mediu)
- Supabase free / $25 Pro
- Resend free (3k emails/lună)
- Smartbill ~75 lei
- Sentry free
- Better Stack free
- **Total fix: ~150–250 lei/lună** (mai puțin decât Shopify Basic + apps)

### Cost variabil
- Stripe: 1.4% + 1 leu (carduri EU) per tranzacție
- Sameday: ~15–25 lei/colet (suportat de client prin transport)

---

## 5. ROADMAP IMPLEMENTARE — ce trebuie făcut

### Fază 0 — Setup inițial (1 zi)
- [ ] `pnpm create next-app locus-shop --typescript --tailwind --app`
- [ ] Configurare Tailwind cu tokens custom (`tailwind.config.ts`): mapare `pamant`, `vie`, `pivnita`, etc.
- [ ] Adăugare Italiana + IBM Plex Mono (Google Fonts via `next/font`)
- [ ] Conectare Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- [ ] Push pe GitHub privat
- [ ] Conectare Vercel pentru auto-deploy

### Fază 1 — Catalog & frontend (3-4 zile)
- [ ] Schemă DB: `products`, `product_images`, `variants` (vezi schema în secțiunea 8)
- [ ] Seed cele 6 vinuri cu prețuri și meta din tabelul de mai sus
- [ ] Upload foto-uri vinuri în Supabase Storage (când Mihai are shoot)
- [ ] **Port `Landing_V1.html`** → `app/page.tsx` (componentizat: Hero, Manifesto, MapSection, GameSection, WinesGrid, About, Newsletter, Footer)
- [ ] **Port `wine.html`** → `app/vinuri/[slug]/page.tsx`
- [ ] Catalog `app/vinuri/page.tsx` cu filtre (gamă, tip, preț, sec/demisec)
- [ ] Pagini gamă: `/cuvinte`, `/semne`, `/pauze` cu storytelling
- [ ] Cart drawer global (Zustand sau React Context) cu persistență localStorage pentru guest

### Fază 2 — Checkout & plăți (3-4 zile)
- [ ] **Port `checkout.html`** → `app/checkout/page.tsx`
- [ ] Server Action: `createOrder()` → insert `orders` cu status `pending_payment`
- [ ] Stripe Checkout Session cu metadata `{ order_id }`
- [ ] Webhook `/api/stripe/webhook` cu signature verification + idempotency table `processed_events`
- [ ] Pagină succes `/checkout/success?session={CHECKOUT_SESSION_ID}` care interoghează DB
- [ ] Edge cases: F5 după plată, webhook pierdut (cron retry zilnic), stoc race condition (Postgres `FOR UPDATE`)

### Fază 3 — Cont client (2 zile)
- [ ] Auth Supabase magic link (NU parolă)
- [ ] `app/cont/page.tsx` — istoric comenzi, statusuri
- [ ] `app/cont/adrese/page.tsx` — gestionare adrese livrare/facturare
- [ ] Login/register/reset

### Fază 4 — Admin (2-3 zile)
- [ ] `app/admin/*` — auth gated, doar pentru rolul admin
- [ ] Dashboard: comenzi azi, vânzări lună, stoc redus, comenzi în așteptare
- [ ] CRUD produse + upload imagini
- [ ] Listă comenzi + detalii + acțiuni (refund, regenerare AWB, refacere factură)
- [ ] Listă clienți
- [ ] Cupoane (creare, validare, expirare)
- [ ] Setări (transport gratuit threshold, taxe)

### Fază 5 — Integrări RO (3-4 zile)
- [ ] **Smartbill API** → factură automat la `payment_succeeded` + e-Factura ANAF
- [ ] **Sameday API** → AWB automat + status sync zilnic
- [ ] **Resend** templates: confirmare comandă (client), notificare comandă nouă (admin), expediere (cu tracking), livrare, recuperare coș abandonat
- [ ] Reconciliere statusuri ANAF (cron zilnic — verifică ce facturi sunt acceptate/respinse)

### Fază 6 — Legal & compliance (1-2 zile)
- [ ] **Verificare 18+** la prima vizită (modal blocant, salvat în cookie 30 zile)
- [ ] **Cookie banner GDPR** (Pandectes-style: necesare/analitice/marketing)
- [ ] Pagini: `/termeni`, `/confidentialitate`, `/cookies`, `/retur` (drept retragere 14 zile OUG 34/2014)
- [ ] Footer: linkuri ANPC + SOL
- [ ] Avertisment "Consumul excesiv de alcool dăunează sănătății" pe footer + checkout

### Fază 7 — SEO & performanță (1 zi)
- [ ] `meta description`, `og:image` per pagină dinamic
- [ ] `schema.org/Product` + `Offer` JSON-LD pentru Google Shopping
- [ ] `sitemap.xml`, `robots.txt`
- [ ] Imagini WebP via Next.js `<Image>`, lazy load
- [ ] Lighthouse > 95 pe toate paginile

### Fază 8 — Analytics & monitoring (0.5 zi)
- [ ] GA4 + Meta Pixel + Conversions API + Tag Manager (cu cookie consent)
- [ ] Sentry (front + server)
- [ ] Better Stack uptime monitor

### Fază 9 — Testing & launch (1-2 zile)
- [ ] Test plăți reale cu carduri test Stripe (success, failure, 3DS, dispute)
- [ ] Test e-Factura sandbox ANAF cu factură reală
- [ ] Test Sameday sandbox AWB
- [ ] Test email-uri Resend (deliverability, SPF/DKIM/DMARC)
- [ ] Test golden path: vinuri → coș → checkout → plată → confirmare → email → factură → AWB
- [ ] Test mobile + tablet
- [ ] Test accesibilitate (axe, screen reader)
- [ ] Domeniu `.ro` (RoTLD ~50 lei/an) → DNS pe Vercel
- [ ] Backup DB Supabase configurat
- [ ] Go live 🚀

**TOTAL EFORT COD:** ~16–22 zile de muncă concentrată

### Paralel (non-cod, blocante reale!)
- [ ] **Cont Stripe + KYC**: 1–5 zile (verificare business)
- [ ] **Cont Smartbill / Oblio + cuplare ANAF SPV** (cu certificat calificat eToken): 2–5 zile
- [ ] **Contract Sameday**: ⚠️ **1–2 săptămâni** (cel mai lent — depozit + semnături)
- [ ] **Domeniu** `.ro`: câteva ore
- [ ] **Aviz ANSVSA + accize alcool**: săptămâni–luni (dacă încă nu sunt obținute)
- [ ] **Conținut real**: photoshoot studio sticle, descrieri produs, fișe tehnice, pairing — câteva săptămâni
- [ ] **Etichetă digitală UE 2024** — QR pe sticlă cu ingrediente + nutriționale (obligatoriu)

---

## 6. Întrebări de decis înainte de Day 1

- [ ] Domeniul: `domeniullocus.ro` ? `locusvin.ro` ? altceva?
- [ ] Procesatorul de plăți preferat: Stripe (recomandat) sau Netopia?
- [ ] Curier preferat: Sameday, FAN, Cargus?
- [ ] Furnizor facturare: Smartbill sau Oblio?
- [ ] Există deja certificat calificat ANAF (eToken) sau trebuie obținut?
- [ ] Bilanț stoc inițial — câte sticle din fiecare cod la lansare?
- [ ] Există photoshoot brand pentru toate cele 6 vinuri?
- [ ] Newsletter — colectăm de pe landing încă pre-launch sau după launch?
- [ ] Multi-limbă (EN) — în MVP sau fază 2?
- [ ] Avem aviz ANSVSA + cont ANAF accize?

---

## 7. Pagini necesare în app (lista completă)

**Public:**
- `/` — landing (port din `Landing_V1.html`)
- `/vinuri` — catalog cu filtre
- `/vinuri/[slug]` — PDP (port din `wine.html`)
- `/cuvinte`, `/semne`, `/pauze` — pagini gamă cu storytelling
- `/checkout` — port din `checkout.html`
- `/checkout/success` — confirmare cu nr. comandă
- `/cont` — istoric comenzi, adrese, profil
- `/cont/login`, `/cont/register`, `/cont/reset`
- `/livrare` — info costuri + durate
- `/cum-cumperi` / `/faq`
- `/despre`, `/contact`, `/parteneri` (B2B)
- `/termeni`, `/confidentialitate`, `/cookies`, `/retur`
- `/sitemap.xml`, `/robots.txt`

**Admin (`/admin`, auth gated):**
- Dashboard, Produse, Comenzi, Clienți, Cupoane, Setări

**Email-uri (Resend templates):**
- Confirmare comandă (client + admin)
- Comandă expediată (cu link tracking)
- Comandă livrată
- Recuperare coș abandonat (după 24h)
- Welcome / register
- Newsletter

---

## 8. Schema DB propusă (Supabase / Postgres)

```sql
-- catalog
products            (id uuid pk, code varchar unique, slug varchar unique, name varchar, gama enum, type enum,
                     abv numeric, sweetness enum, price_cents int, stock int, color varchar, hero_image varchar,
                     description text, pairing text, active bool, created_at timestamptz)
product_images      (id uuid, product_id uuid fk, url varchar, alt varchar, sort_order int)
variants            (id uuid, product_id uuid fk, size_ml int, price_cents int)

-- customers
customers           (id uuid pk, supabase_user_id uuid fk, email varchar, name varchar, phone varchar, created_at)
addresses           (id uuid, customer_id uuid fk, kind enum, line1, line2, city, county, zip, country, default bool)
billing_profiles    (id uuid, customer_id uuid fk, type enum, company, cui, reg_no, iban, hq_address)

-- orders
orders              (id uuid pk, order_number varchar unique, customer_id uuid fk nullable,
                     status enum, subtotal_cents, shipping_cents, discount_cents, total_cents,
                     shipping_method, payment_method, payment_status,
                     stripe_session_id, awb_number, smartbill_invoice_id,
                     guest_email, created_at, paid_at, shipped_at, delivered_at)
order_items         (id uuid, order_id uuid fk, product_id uuid fk, name_snapshot, qty, unit_price_cents)
order_events        (id uuid, order_id uuid fk, type, payload_json, created_at)  -- audit trail

-- discounts
coupons             (id uuid, code varchar unique, percent_off, fixed_off_cents, min_amount_cents,
                     expires_at, max_uses int, used_count int)

-- ops
processed_events    (event_id varchar pk, source varchar, processed_at timestamptz)  -- webhook idempotency
audit_log           (id uuid, actor varchar, action, entity, entity_id, before_json, after_json, at)
newsletter_subs     (id uuid, email varchar unique, consent_at, unsubscribed_at)
age_verifications   (id uuid, ip varchar, user_agent, verified_at)  -- audit GDPR + 18+
```

RLS pe toate tabelele cu user data. `service_role` pentru backend (webhook-uri, cron).

---

## 9. Fluxul comandă end-to-end

```
1. Client adaugă în coș (cookie/localStorage pt guest, DB pt logat)
2. Click "Comandă" → /checkout
3. Pas 1 livrare → save în session sau DB ca draft
4. Pas 2 facturare → save billing_profile dacă cere "salvează"
5. Pas 3 plată → click "Plasează comanda"
   ├─ creează `orders` cu status=pending_payment + idempotency key
   ├─ creează Stripe Checkout Session cu metadata { order_id }
   └─ redirect la Stripe URL
6. User plătește pe Stripe (PCI gestionat de ei)
7. Stripe webhook → checkout.session.completed
   ├─ verifică signature
   ├─ insert în processed_events (unique → idempotent)
   ├─ update orders.status = paid
   ├─ Resend → email confirmare client + intern
   ├─ Smartbill API → factură + e-Factura ANAF
   └─ Sameday API → AWB
8. Client redirectat pe /checkout/success?session=...
9. Cron job zilnic: reconciliere statusuri ANAF (acceptat / respins) + Sameday tracking
```

**Edge cases obligatoriu de gestionat:**
- F5 după plată → idempotent prin Stripe session ID (verifică în DB)
- Webhook pierdut → cron retry care interoghează Stripe API zilnic
- Stoc race: `BEGIN; SELECT stock FROM products WHERE id=X FOR UPDATE; UPDATE; COMMIT`
- AWB Sameday eșuat → fallback la generare manuală + alertă admin (Sentry)
- e-Factura respinsă → email admin + retry automat după corectare
- Refund parțial / total → flow complet în admin

---

## 10. Decizii deja luate (NU mai discutăm)

1. ✅ Stack: Next.js 15 + Supabase + Stripe + Resend + Smartbill + Sameday
2. ✅ Hosting: Vercel
3. ✅ Plăți: **Stripe Checkout** (NU Elements) — minimizează responsabilitatea PCI la SAQ-A
4. ✅ Designul existent (`Landing_V1.html`, `wine.html`, `checkout.html`) e baseline-ul — se portează 1:1
5. ✅ Auth: Supabase **magic link** (NU parolă) pentru clienți; admin separat
6. ✅ DB: Postgres prin Supabase, RLS activat
7. ✅ NU Shopify, NU Lovable, NU WooCommerce
8. ✅ Font default: Italiana (Lora doar dacă brandbook spec-ul devine strict)
9. ✅ Construim într-un workspace VSCode separat (`locus-shop/`)

---

## 11. Note tehnice pentru noul agent (preluare proiect)

**Limba de comunicare cu user-ul:** română (mix cu engleză tehnică acceptabil).

**Stil cod preferat:**
- TypeScript strict
- Tailwind cu tokens custom mapate pe variabilele design (`pamant`, `vie`, etc.)
- Server Actions Next.js > API routes când se poate
- Supabase RLS în loc de logică de autorizare în code
- Server components default; client components doar pentru interactivitate
- Zod pentru validare la boundaries (form, API)
- Stripe SDK + signature verification pentru webhook-uri
- Resend SDK pentru email

**Convenții:**
- Cod și commit messages în engleză
- Comentarii minime (numele să spună)
- Testează doar logica de business critică (pricing, idempotency, e-Factura XML, age gate)
- Nu adăuga teste decorative

**Comportamentul preferat al agentului:**
- Direct, nu sycophantic
- Nu over-engineer
- Întreabă când e ambiguu, **nu** ghici la decizii business
- Recomandă varianta simplă, nu cea mai "modernă"
- Foarte important: **Nu lansează nimic în prod fără confirmarea lui Mihai**

---

## 12. Cum migrezi în noul workspace VSCode

### Ce să copiezi în noul proiect (`locus-shop/`)

**Obligatoriu:**
```bash
mkdir ~/0_Dev/locus-shop && cd ~/0_Dev/locus-shop

# 1. Acest fișier ca CLAUDE.md (auto-loaded de Claude Code)
cp /Users/mihairoscaneanu/0_Dev/1_Locus_agentic_team/MEMORY.md ./CLAUDE.md

# 2. Mockup-urile HTML ca referință (NU le edita, doar le citești pentru port)
mkdir _reference
cp /Users/mihairoscaneanu/0_Dev/1_Locus_agentic_team/Locus_landing/Landing_V1.html ./_reference/
cp /Users/mihairoscaneanu/0_Dev/1_Locus_agentic_team/Locus_landing/wine.html ./_reference/
cp /Users/mihairoscaneanu/0_Dev/1_Locus_agentic_team/Locus_landing/checkout.html ./_reference/

# 3. Logo + asset-uri brand
mkdir -p public/brand
cp /Users/mihairoscaneanu/0_Dev/1_Locus_agentic_team/Locus_landing/logo-locus.png public/brand/
cp /Users/mihairoscaneanu/0_Dev/1_Locus_agentic_team/Locus_landing/logo-locus@2x.png public/brand/
cp /Users/mihairoscaneanu/0_Dev/1_Locus_agentic_team/Locus_landing/hero-amfora.png public/brand/

# 4. Photo-urile brand (pentru hero, secțiuni)
mkdir -p public/photos
cp -r /Users/mihairoscaneanu/0_Dev/1_Locus_agentic_team/brand-assets/Imagini/* public/photos/
```

**Util (pentru context vizual când Claude trebuie să verifice cu brandbook-ul):**
```bash
mkdir context
cp /Users/mihairoscaneanu/0_Dev/1_Locus_agentic_team/context/LOCUS_BRANDBOOK_260904.pdf.pdf ./context/brandbook.pdf
cp /Users/mihairoscaneanu/0_Dev/1_Locus_agentic_team/context/LOCUS_Landing.jpeg ./context/landing-reference.jpeg
cp /Users/mihairoscaneanu/0_Dev/1_Locus_agentic_team/context/LOCUS_LOGO_BOW_260311.pdf ./context/logo-source.pdf
```

> **Recomandare:** **Da, copiază și `brand-assets` și `context`** în noul proiect.
> Motivul: când agentul AI nou are nevoie să verifice un detaliu de brand (culoare, font, layout reference), poate citi direct fișierele locale fără să-i explici. Cost minim (~40 MB), beneficiu mare în coerență.
>
> Doar HTML-urile fără asset-uri = agentul ar avea referințe rupte (`hero-amfora.png` nu există), iar fără brandbook ar trebui să-i transmiți tu specs-urile manual de fiecare dată.

### Structura propusă a noului proiect

```
locus-shop/
├── CLAUDE.md                  # acest fișier — auto-loaded
├── _reference/                # mockup-urile HTML (NU edit, doar citit pentru port)
│   ├── Landing_V1.html
│   ├── wine.html
│   └── checkout.html
├── context/                   # surse brand pentru verificare
│   ├── brandbook.pdf
│   ├── landing-reference.jpeg
│   └── logo-source.pdf
├── public/
│   ├── brand/                 # logo, hero photo
│   └── photos/                # photo-uri brand pentru secțiuni
├── app/                       # Next.js App Router
│   ├── page.tsx               # landing (port din Landing_V1.html)
│   ├── vinuri/
│   ├── checkout/
│   ├── cont/
│   ├── admin/
│   └── api/
├── components/
├── lib/
│   ├── supabase/
│   ├── stripe/
│   ├── smartbill/
│   ├── sameday/
│   └── resend/
├── tailwind.config.ts         # tokens brand (pamant, vie, pivnita, etc.)
└── package.json
```

### Primul prompt pentru noul agent

Când deschizi proiectul nou în Claude Code, primul mesaj poate fi:

> "Citește CLAUDE.md integral. Apoi confirmă-mi că ai înțeles stadiul și roadmap-ul. După aceea, vreau să începem cu **Fază 0 — Setup inițial**: inițializează Next.js 15 cu TypeScript și Tailwind, configurează tokens-urile brand din CLAUDE.md și conectează Supabase. Înainte să rulezi orice comandă, listează exact ce vei face."

Așa îți asiguri că agentul are context complet și nu pleacă pe direcții greșite.

---

## 13. Glosar rapid

- **PDP** — Product Detail Page (`/vinuri/[slug]`)
- **PLP** — Product Listing Page (`/vinuri`)
- **D2C** — Direct-to-Consumer
- **HoReCa** — Hotel/Restaurant/Café (B2B)
- **AWB** — Air Waybill (document curierat)
- **SPV** — Spațiul Privat Virtual ANAF
- **UBL** — Universal Business Language (XML standard pentru e-Factura)
- **SAQ-A** — Self-Assessment Questionnaire A (cel mai ușor formular PCI-DSS, valid când nu atingi cardul)
- **RLS** — Row-Level Security (Postgres / Supabase)
- **3DS** — 3-D Secure (autentificare card 2-pași)
- **OSS** — One-Stop Shop (TVA UE pentru export)

---

*Ultima actualizare: 2026-05-09*
*Autor brief: agentul AI care a construit prototipurile (Claude Code Opus 4.7).*
*Repo curent: `/Users/mihairoscaneanu/0_Dev/1_Locus_agentic_team/`*
