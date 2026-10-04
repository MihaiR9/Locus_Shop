---
name: seo-locus
description: >
  SEO audit and fixes for the Domeniul Locus shop (www.domeniul-locus.ro).
  Use whenever Mihai asks for SEO, "audit SEO", "verifică SEO-ul", schema /
  JSON-LD, Google Shopping / Merchant Center, sitemap, robots, Core Web Vitals,
  Lighthouse, meta / og tags, indexare, or AI search (GEO/AEO) for this site.
  Wraps the generic `seo` skill (~/.claude/skills/seo) with site-specific
  context: routes, where each SEO concern lives in the code, and brand rules
  that constrain any copy fix.
---

# SEO — Domeniul Locus

Generic engine: `~/.claude/skills/seo` (Agentic-SEO-Skill, MIT, reviewed and
installed locally 2026-10-04). Read its `SKILL.md` for commands and scripts.
This file adds what the generic skill can't know.

## Running scripts

```bash
SEO=~/.claude/skills/seo
PY="$SEO/.venv/bin/python"          # system python3 lacks the deps
export PYTHONWARNINGS=ignore        # LibreSSL warning on macOS python 3.9
$PY $SEO/scripts/<script>.py <url-or-file> [--json]
```

Most scripts take the URL as a positional argument (not `--url`). Check
`--help` before the first call. Write reports to the scratchpad, never into
the repo.

## Site facts

- Canonical host: `https://www.domeniul-locus.ro` (the apex 307-redirects to www).
- Live, no longer behind COMING_SOON. `isComingSoon()` in `lib/site.ts` still
  exists; if robots.txt suddenly says `Disallow: /`, check that env var first.
- Language: Romanian only, no hreflang. Skip `seo hreflang`, `seo github`,
  `seo programmatic`, `seo competitors`.
- Indexable: `/`, `/shop`, `/cuvinte`, `/semne`, `/pauze`, `/vinuri/[slug]`,
  info pages (`/despre`, `/contact`, `/parteneri`, `/livrare`, `/cum-cumperi`)
  and legal pages. The live `/sitemap.xml` is the source of truth for the list.
- Private, blocked in robots: `/admin`, `/cont`, `/checkout`, `/auth/`, `/api/`
  (except `/api/feed/`).
- Overlays: age gate (`components/legal/age-gate.tsx`) and cookie banner render
  client-side after hydration, so SSR HTML stays crawlable. Any change that
  gates content server-side breaks indexing; flag it.

## Where fixes go

| Concern | File |
|---|---|
| robots.txt | `app/robots.ts` (keep the `/api/feed/` Allow — Merchant Center fetches with Googlebot) |
| sitemap | `app/sitemap.ts` |
| Canonical URL helpers | `lib/site.ts` (`absUrl`, `getSiteUrl`) |
| JSON-LD builders | `lib/seo/schema.ts`, rendered via `components/seo/json-ld.tsx` |
| PDP metadata + Product schema | `app/(storefront)/vinuri/[slug]/page.tsx` |
| Gama pages metadata | `app/(storefront)/[gama]/page.tsx` |
| Default OG image | `app/opengraph-image.tsx` |
| Shopping feeds | `app/api/feed/google.xml`, `app/api/feed/meta.xml` |

## Priority checks for this shop

1. Product JSON-LD on every PDP: `product_schema_checker.py <pdp-url>`. Price in
   RON, availability matches stock, brand "Domeniul Locus".
2. Feed and on-page consistency: price and availability in `/api/feed/google.xml`
   must match each PDP's JSON-LD, or Merchant Center disapproves the item.
3. Sitemap and DB consistency: every active product appears in the sitemap,
   inactive ones don't. Compare with Supabase `products where active`.
4. Images: product PNGs in `public/photos/products/` are heavy; check
   `image_weight_audit.py` and that `<Image>` serves WebP/AVIF.
5. Core Web Vitals: `pagespeed.py` / `lighthouse_runner.py` on `/`, `/shop`
   and one PDP. The target from CLAUDE.md is Lighthouse > 95.
6. Fonts: Italiana + IBM Plex Mono through `next/font`; check `font_audit.py`.

## Rules for any copy or meta fix

- Romanian, short, contemplative, no emoji, no marketing superlatives.
- Never "premium", "basic", "de bază", "reserve" for cuvinte / semne / pauze.
- Alcohol: no health or performance claims; keep the responsible-drinking notice.
- Propose title/description changes to Mihai before editing. Copy is a brand
  decision, not a technical one.

## Output

Reply in Romanian. Prioritise fixes (Critic / Important / Minor), each with
the evidence (script and URL), the file to change, and a confidence label.
Don't deploy anything; Mihai confirms before anything ships to prod.
