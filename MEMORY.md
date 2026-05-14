# MEMORY — Stadiu deployment Locus Shop

> Snapshot la **2026-05-13 ~22:00 EEST** după două sesiuni mari de deployment
> + redesign tipografic.
>
> Citește înainte să reiei. Dacă starea reală diferă, actualizează fișierul.

---

## ✅ Ce funcționează în PROD

| Componentă | Status | Note |
|---|---|---|
| Domeniu `domeniul-locus.ro` | Live | Cloudflare DNS, A apex → `76.76.21.21`, CNAME www → `cname.vercel-dns.com`, SSL Vercel |
| Redirect apex → www | OK | Vercel 307 `domeniul-locus.ro` → `www.domeniul-locus.ro` |
| Vercel deploy | OK | Project: `locus-shop`, branch `main`, deploy auto la fiecare push pe main |
| Supabase URL config | OK | Site URL: `https://www.domeniul-locus.ro`. Redirect URLs include atât `domeniul-locus.ro/**` cât și `www.domeniul-locus.ro/**` + `localhost:3000/**` pentru dev |
| Resend DNS (SPF/MX/DKIM) | Verified | Records adăugate via Auto configure în Cloudflare. Subdomeniu `send.` pentru envelope, DKIM aliniat pe root |
| Resend SMTP în Supabase | **OK** | Custom SMTP enabled. Host `smtp.resend.com`, port `587`, user **`resend`** (literal!), parola = API key Resend „Supabase SMTP" cu Full Access. Rate limit bumped la 100/h |
| Stripe webhook prod | Configurat | Endpoint pe `https://www.domeniul-locus.ro/api/stripe/webhook`, event `checkout.session.completed`, secret în Vercel ca `STRIPE_WEBHOOK_SECRET` |
| Magic link signup/login | **OK end-to-end** | Email pleacă de la `office@domeniul-locus.ro`, click pe link → callback → sesiune setată → redirect la `/cont`. Testat 2026-05-13 cu cont real |
| Email-uri tranzacționale (Resend HTTP API) | OK | Notificarea admin la comandă nouă funcționează |

---

## 🔧 Mediu dev local — configurat 2026-05-13

Pe Windows PC-ul lui Mihai (`f:\v0_dev\2_Locus_Landing`):

- Node 24.15.0 + pnpm 11.1.1 instalate (via winget + corepack)
- Vercel CLI instalat și logat (`vercel link` la `locus-projects1/locus-shop`)
- `.env.local` populat cu valori pull-uite din Production via `vercel env pull --environment=production`
- 3 chei pulled au valori `""` (Sensitive în Vercel) — completate manual din chat:
  - `STRIPE_SECRET_KEY` ✓ (sk_test_…)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓ (din MCP)
  - `RESEND_API_KEY` ✓
- Încă goale (de completat când e nevoie de testare auth admin / Stripe browser / webhook local):
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- Override-uri dev:
  - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
  - `RESEND_DEV_REDIRECT=roscaneanumihai@gmail.com` (toate email-urile din dev merg la Mihai)

`pnpm dev` rulează la `http://localhost:3000`. Folosește **același Supabase + Stripe + Resend ca prod-ul**, deci writes din dev = writes reale în DB prod.

---

## 🔧 MCP Servers configurați

`.mcp.json` (gitignored) conține 4 servere — toate 4 Connected în Claude Code:

| Server | Comandă | Token |
|---|---|---|
| supabase | `@supabase/mcp-server-supabase` (read-only) | PAT `sbp_…` (claude-code-windows) + project-ref `lmwdzkfjebranjxfjcge` |
| stripe | `@stripe/mcp` (tools=all) | `sk_test_…` |
| filesystem | `@modelcontextprotocol/server-filesystem` | n/a |
| git | `@cyanheads/git-mcp-server` | n/a |

Notă: pe Windows, comanda invocă `C:\Program Files\nodejs\npx.cmd` cu path absolut (PATH-ul Claude Code-ului nu se reîncarcă după instalări).

---

## 🐛 Bug-uri rezolvate în sesiunea 2026-05-13

### 1. Magic link nu loga user-ul (callback ducea pe `/` cu `otp_expired`)
- **Cauză**: Supabase Site URL era `https://domeniul-locus.ro` (fără www) și Redirect URLs aveau doar variantele apex. Codul nostru pasează `emailRedirectTo` cu `www.` (din `host` header), Supabase nu găsea match în allowlist → fallback la Site URL → magic link redirecționa la `domeniul-locus.ro/` (apex) → Vercel 307 spre `www.` și pierdea fragment-ul cu tokens.
- **Fix**: Adăugat în Supabase URL Configuration:
  - Site URL → `https://www.domeniul-locus.ro`
  - Redirect URLs → `https://www.domeniul-locus.ro/auth/callback` + `https://www.domeniul-locus.ro/**` + `http://localhost:3000/**`

### 2. Supabase Custom SMTP cu Resend → `535 Invalid username`
- **Cauză**: Username field din Supabase SMTP era setat pe `office@domeniul-locus.ro` în loc de `resend`. Pentru Resend SMTP, Username TREBUIE să fie literal string-ul `resend`, nu adresa de email.
- **Fix**: Setat Username = `resend` (tastat manual ca să evităm invisible chars din copy/paste). Password = noua cheie Resend „Supabase SMTP" cu Full Access. Port 587 (STARTTLS).
- **Verificat**: scris script `_scripts/test-resend-smtp.mjs` care testează SMTP direct pe ambele porturi 465 + 587 — ambele returnează `235 Authentication successful`.

### 3. Login cu email neînregistrat creează cont silențios
- **Cauză**: `loginWithEmail` avea `shouldCreateUser: true`. Orice email tastat pe pagina de login → Supabase creează utilizator nou și trimite magic link, în loc să spună „cont inexistent".
- **Fix** ([app/(auth)/cont/auth-actions.ts](app/(auth)/cont/auth-actions.ts)): setat `shouldCreateUser: false`. Detectează erorile Supabase pentru „user not found / signups not allowed" și returnează `code: "no_account"`. Frontend ([login-form.tsx](app/(auth)/cont/login/login-form.tsx)) afișează acum un card „Nu există cont cu adresa X" + buton spre `/cont/signup?email=<prefilled>`. Signup form preia parametrul `?email=` din URL.

### 4. Pagina `/cont` nu umplea viewport-ul pe ecrane înalte (footer la mijloc)
- **Cauză**: `.cont-page` avea doar `padding-top`, fără `min-height`.
- **Fix**: adăugat `min-height: calc(100vh - 72px)` în [globals.css](app/globals.css).

### 5. Rate limit Supabase Auth la 2/h pe Free plan (când custom SMTP era OFF)
- Bumped manual la 100/h în Supabase → Auth → Rate Limits → „Rate limit for sending emails".

---

## 🎨 Redesign tipografic — sesiunea 2026-05-13

Adăugat al treilea font: **Bellefair** (Google Font, weight 400 doar). Adăugat și weight **700 (Bold)** pe IBM Plex Mono. Cele 3 fonturi acum:

| Font | Variabilă | Weights | Uz |
|---|---|---|---|
| Italiana | `--font-serif` | 400 | Default global pentru .h1/.h2/.h3 — păstrat pe paginile pe care nu le-am atins |
| IBM Plex Mono | `--font-mono` | 400, 500, 700 | UI, body, labels, eyebrows, butoane, **wine names**, **game tags**, **manifesto landing** |
| **Bellefair** | `--font-bellefair` | 400 | Titluri principale pe paginile redesign-uite |

**Setting de bază pentru titluri „Bellefair":** `font-weight: 400`, `letter-spacing: -0.06em` (= tracking -60 din brandbook).

### Landing (`/`)
- ✅ Manifesto **origine / timp / măsură** — **IBM Plex Mono 500**, lowercase (text din JSX), letter-spacing -0.06em
- ✅ „Un punct precis, între Panciu și Nicorești." — **Bellefair**, 56–112px (cu `&nbsp;` între „și" și „Nicorești.")
- ✅ „Vinul vorbește." — **Bellefair**, 56–112px (capitalize V)
- ✅ „Șase sticle. Un singur loc." — **Bellefair**, 56–112px
- ✅ „Rădăcini adânci, privire înainte." — **Bellefair**, 56–112px
- ✅ „Locul, în cuvinte." (newsletter) — **Bellefair**, 28–40px
- ✅ Game tags `cuvinte / semne / pauze` — **IBM Plex Mono Bold 700**, letter-spacing -0.03em
- ✅ Wine names în carduri („Fetească Regală" etc.) — **IBM Plex Mono Bold 700**, letter-spacing -0.03em (match game tags)

### /shop
- ✅ Hero „Colecția în pahar." — **Bellefair**, tracking -0.06em

### /vinuri/[slug] (PDP)
- Neatins în această sesiune. Folosește pattern global (Italiana). De evaluat la următorul pas.

### /cuvinte, /semne, /pauze (gama pages)
- ✅ Hero (`.gama-hero-title`) — **IBM Plex Mono Bold 700**, lowercase, tracking -0.06em
- ✅ Watermark italic din fundal (`gama-hero-watermark`) — **ascuns** (`display: none`)

### /contact
- ✅ Hero „Scrie-ne." — **Bellefair**, tracking -0.06em
- ✅ `.contact-info-value` (Centrul de Vinificație Buciumeni, telefon, email) — **Bellefair**

### /parteneri
- ✅ Hero „Lucrăm direct cu tine." — **Bellefair**
- ✅ Toate `.h2` din pagina parteneri („Ce primești ca partener.", „Patru pași până la primul lot.", „Tipuri de parteneri.", „Spune-ne despre tine.") — **Bellefair** (override doar pe `.parteneri-page .livrare-section-head .h2`)
- ✅ Numerele mari `01 / 02 / 03 / 04` din cele 4 valori — **IBM Plex Mono Regular 400**, redimensionate la 20–26px (erau 32–48px serif)
- ✅ Titluri 4 valori („Producător direct…", „Loturi mici…", „Suport…", „Livrare flexibilă…") — **Bellefair** 20–26px
- ✅ Flow steps („Cerere ofertă", „Catalog + prețuri", „Degustare", „Contract + livrare") — **Bellefair** 20–24px
- ✅ Segmente („Restaurante & bistro-uri" etc.) — **Bellefair**
- ✅ Catalog section (fundal verde) — `width: 100vw` cu trick `left/right: 50%; margin: -50vw` ca să spargă container-ul. Titlul „Lista completă, în format PDF." — **Bellefair**
- ✅ Layout `parteneri-flow-list` — `border: 1px solid var(--line)` (închis pe toate părțile)
- ✅ Layout `parteneri-segments-grid` — același pattern (1 chenar + separatori verticali), gap eliminat, fundalul colorat `bg-alt` păstrat

### /despre
- ✅ Hero „O linie pe pământ, urmată cu răbdare." — **Bellefair**
- ✅ Cele 4 cards (`.despre-card .word` = „Locul", „Timpul", „Mâna", „Mărturia") — **IBM Plex Mono 500**, letter-spacing -0.06em
- ✅ „Restul îl face locul." (CTA final) — **Bellefair**

---

## 📦 Stare cod (commits ultimele azi)

```
8013d5d style(landing): switch manifesto words to IBM Plex Mono 500
cbe026e fix(auth): reject login for unregistered emails + sticky footer on /cont
4001cfd chore(deps): approve sharp + unrs-resolver native builds for pnpm 11
1e5c09e docs: MEMORY.md cu stadiul deployment-ului pe prod
f7b3525 feat(supabase): wire all account pages — setări, adrese, facturare, comenzi, retururi
```

Branch: `main` — sincronizat cu `origin/main` după push-ul curent.

---

## 🔜 Următorii pași — propuneri pentru sesiunea următoare

1. **Smoke test full checkout** end-to-end pe prod (card test Stripe → confirmare → comandă în `/cont/comenzi` → emails)
2. **Revizitare pagini neatinse**: PDP (`/vinuri/[slug]`), livrare, cum-cumperi, faq, termeni/confidentialitate/cookies/retur — vezi dacă mai sunt titluri Italiana de mutat pe Bellefair
3. **Account pages** (`/cont/comenzi`, `/cont/adrese`, etc.) — verificat layout pe ecrane mari, posibil de iterat pe tipografie
4. **OAuth Google + Phone SMS** — provider-ele Supabase sunt deja configurate în UI dar nu wire-uite cu Google Cloud / Twilio. Codul în [auth-actions.ts](app/(auth)/cont/auth-actions.ts) e gata.
5. **Email templates Supabase** — Customizare HTML la magic link + confirmation (acum sunt template-uri default Supabase)
6. **Cleanup `_scripts/`** — folder local cu utilitare debug (test SMTP, parser loguri). Gitignored deja. La un moment dat le ștergem dacă nu mai sunt utile.
7. **Securitate**: rotește Supabase PAT + Resend API key + Stripe secret care au trecut prin chat în sesiunea de azi (Mihai a aprobat această practică pentru viteză).

---

## 🔑 Variabile env în Vercel (Production)

| Variabilă | Notă |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.domeniul-locus.ro` |
| `NEXT_PUBLIC_SUPABASE_URL` | Set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Set (Sensitive) |
| `SUPABASE_SERVICE_ROLE_KEY` | Set, encrypted (Sensitive) |
| `STRIPE_SECRET_KEY` | `sk_test_…` (Sensitive) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Test mode (Sensitive) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` (Sensitive) |
| `RESEND_API_KEY` | `re_…` (Sensitive) |
| `RESEND_FROM_EMAIL` | `Domeniul Locus <office@domeniul-locus.ro>` |
| `RESEND_ADMIN_EMAIL` | `office@domeniul-locus.ro` |

Toate marcate ca Sensitive în Vercel — valorile NU sunt vizibile prin `vercel env pull`. Pentru reveal manual: Vercel Dashboard → Settings → Environment Variables → … → Edit → Reveal.

---

## 🗂️ DNS în Cloudflare (referință rapidă)

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | `76.76.21.21` | DNS only |
| CNAME | `www` | `cname.vercel-dns.com` | DNS only |
| MX | `@` | `aspmx.l.google.com` + alt1-4 | DNS only (Google Workspace email) |
| TXT | `@` | `v=spf1 include:_spf.goo...` | Google SPF |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine...` | Google DMARC |
| TXT | `google._domainkey` | `v=DKIM1;k=rsa;p=MIIBIj...` | Google DKIM |
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqG...` | Resend DKIM |
| MX | `send` | `feedback-smtp.eu-west-1.amazonses.com` | Resend bounce |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | Resend SPF (pe subdomeniu) |

Nameservers RoTLD → Cloudflare: `addilyn.ns.cloudflare.com` + `sri.ns.cloudflare.com`.

---

*Update final 2026-05-13 după sesiune lungă redesign + bugfix auth. Continuă de aici.*
