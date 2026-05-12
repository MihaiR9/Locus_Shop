# MEMORY — Stadiu deployment Locus Shop

> Snapshot la **2026-05-12 22:00 EEST** după sesiune lungă de deployment pe domeniul de producție.
> Citește înainte să reiei mâine. Dacă starea reală diferă de ce e aici, actualizează fișierul.

---

## ✅ Ce funcționează în PROD

| Componentă | Status | Note |
|---|---|---|
| Domeniu `domeniul-locus.ro` | Live | Cloudflare DNS, A apex → `76.76.21.21`, CNAME www → `cname.vercel-dns.com`, SSL Vercel emis automat |
| Redirect apex → www | OK | Vercel configurat: 307 `domeniul-locus.ro` → `www.domeniul-locus.ro` |
| Vercel deploy | OK | Project: `locus-shop`, branch `main`, ultimul deploy = commit `4001cfd` |
| Supabase URL config | OK | Site URL: `https://www.domeniul-locus.ro`, Redirect URLs: `/auth/callback`, `/**`, ambele cu și fără `www` + `localhost:3000/**` pentru dev |
| Resend DNS (SPF/MX/DKIM) | Verified | Records adăugate via Auto configure în Cloudflare, propagate complet |
| Stripe webhook prod | Configurat | Endpoint nou pe `https://www.domeniul-locus.ro/api/stripe/webhook`, event `checkout.session.completed`, secret pus în Vercel ca `STRIPE_WEBHOOK_SECRET` |
| Email-uri tranzacționale (Resend API direct) | OK | Notificarea de comandă către admin ajunge — verificat prin Resend logs |

---

## ⚠️ Blocker activ — Supabase Custom SMTP cu Resend

**Eroarea:** `535 Invalid username` repetat în logurile Supabase Auth (verificat via MCP). Magic link-urile de signup/login eșuează cu `500: Error sending magic link email`.

**Setări curente în Supabase → Authentication → Emails → SMTP Settings:**
- Enable custom SMTP: **ON** ✓
- Sender email: `office@domeniul-locus.ro`
- Sender name: `Domeniul Locus`
- Host: `smtp.resend.com`
- Port: `465`
- Min interval: `60s`
- **Username**: prima dată era setat `office@domeniul-locus.ro` (greșit), apoi s-a schimbat la `resend` (corect per docs) — dar tot pică
- **Password**: API key Resend `re_...` (am cerut user să genereze unul nou specific „Supabase SMTP" și să-l pună din nou)

**Ce am exclus deja:**
- DNS-urile Resend sunt OK (dig confirmă SPF + MX + DKIM)
- Domeniul Resend e Verified (status verde în Resend dashboard)
- API key-ul Resend funcționează prin HTTP API (email admin pleacă cu succes)
- DKIM e propagat — nu mai e Pending

**Ipoteze rămase de testat mâine:**
1. Username field din Supabase are caracter invizibil (spațiu, newline). Soluție: șterge cu Cmd+A → Delete, tastează manual `resend`, fără paste.
2. Resend SMTP necesită domeniul Verified explicit pentru SMTP (separat de DNS). Verifică în Resend → Settings dacă există un toggle „Enable SMTP".
3. Folosim port greșit. Încearcă `587` (STARTTLS) în loc de `465` (SSL).
4. Contul Resend nu permite SMTP pe planul Free — necesită upgrade.
5. Soluție alternativă: rămânem pe Supabase default SMTP cu rate limit bumped la 30/h (vezi log: `GOTRUE_RATE_LIMIT_EMAIL_SENT changed from 2/1h to 30`) — suficient pentru lansare, schimbăm la Resend ulterior.

**Loguri relevante (din `get_logs` service=auth):**
```
2026-05-12T19:35:19Z  error: "535 Invalid username"
                      msg:   "500: Error sending magic link email"
```

---

## 🔜 Următorii pași — ORDINE pentru mâine

1. **Rezolvă SMTP custom 535** (vezi ipoteze de mai sus). Începe cu retypare manuală `resend` în Username + port 587.
2. După ce SMTP merge, **smoke test end-to-end**:
   - Signup pe `https://www.domeniul-locus.ro/cont/signup` cu un email REAL
   - Verifică inbox + sender = `office@domeniul-locus.ro`
   - Click magic link → te loghează în `/cont`
   - Adaugă o sticlă în coș → checkout → card test `4242 4242 4242 4242`
   - Verifică `/cont/comenzi` — comanda apare cu status „plătită"
   - Verifică Stripe Dashboard → noul endpoint webhook are status `200 OK`
   - Verifică Resend Emails — sunt 2 emailuri de comandă (client + admin)
3. **OAuth Google + Phone SMS** (le-am lăsat pe după): Supabase → Auth → Providers → Google (Client ID + Secret din Google Cloud Console), Phone SMS (Twilio sau MessageBird) — vezi commit `39e3e6c` pentru codul deja wired.

---

## 📦 Stare cod (commits ultimele)

```
4001cfd chore(deps): approve sharp + unrs-resolver native builds for pnpm 11
f7b3525 feat(supabase): wire all account pages — setări, adrese, facturare, comenzi, retururi
39e3e6c feat(supabase auth): wire login/signup, account menu, sidebar, route gating
b67354f refactor(auth): standalone /cont/login + /cont/signup pages, header dropdown
3a38594 feat(auth): full login + signup pages — email / Google / phone (frontend stubs)
```

Branch: `main` — sincronizat cu `origin/main`.

---

## 🔑 Variabile env în Vercel (Production)

| Variabilă | Notă |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.domeniul-locus.ro` |
| `NEXT_PUBLIC_SUPABASE_URL` | Set |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Set |
| `SUPABASE_SERVICE_ROLE_KEY` | Set, encrypted |
| `STRIPE_SECRET_KEY` | Test mode (`sk_test_…`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Test mode |
| `STRIPE_WEBHOOK_SECRET` | Endpoint prod (`whsec_…` din webhook nou) |
| `RESEND_API_KEY` | Set |
| `RESEND_FROM_EMAIL` | `office@domeniul-locus.ro` (adăugat după descoperirea că lipsea) |
| `RESEND_ADMIN_EMAIL` | `office@domeniul-locus.ro` |
| `RESEND_DEV_REDIRECT` | **NU** există în prod (intenționat) |

---

## 🗂️ DNS în Cloudflare (referință rapidă)

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | `@` | `76.76.21.21` | DNS only (gri) |
| CNAME | `www` | `cname.vercel-dns.com` | DNS only (gri) |
| MX | `@` | `aspmx.l.google.com` + alt1-4 | DNS only (Google Workspace email-uri pe `office@`) |
| TXT | `@` | `v=spf1 include:_spf.goo...` | Google SPF |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine...` | Google DMARC |
| TXT | `google._domainkey` | `v=DKIM1;k=rsa;p=MIIBIj...` | Google DKIM |
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqG...` | Resend DKIM |
| MX | `send` | `feedback-smtp.eu-west-1.amazonses.com` | Resend bounce |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | Resend SPF (pe subdomeniu) |

Nameservers RoTLD → Cloudflare: `addilyn.ns.cloudflare.com` + `sri.ns.cloudflare.com`.

---

*Generat de Claude la finalul sesiunii din 2026-05-12. Update direct în acest fișier pe măsură ce avansezi.*
