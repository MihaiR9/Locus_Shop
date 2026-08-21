---
name: instagram-post
description: |
  Generate brand-aligned Instagram content for Finbot's pre-MVP teaser
  campaign — feed posts (4:5), carousels (multi-slide), and story / reel
  covers (9:16). Outputs HTML preview + ready-to-upload PNGs at the right
  Instagram dimensions, plus a sibling caption file with hook, body, CTA
  and a hashtag block. ALWAYS use this skill when the user asks for an
  Instagram post, IG card, carousel, story, reel cover, "postare instagram",
  "carusel", "story pentru ig", "reel cover", "card pentru insta" — even
  when they don't say the exact word "image" or "PNG". Also use it when the
  user wants to draft copy specifically for an Instagram post, since this
  skill bundles IG-aligned caption guidance and a Romanian fintech hashtag
  bank. Prefer this skill over `linkedin-post` whenever Instagram is the
  target platform — different aspect ratios, different CTA mechanics, and
  carousels need page indicators.
---

# Finbot Instagram Post Generator

Produce Instagram content for Finbot's teaser campaign — feed posts,
carousels, and story / reel covers. Each piece follows the brandbook (60%
neutral / 30% primary / 10% lime accent), uses Archivo + Inter +
JetBrains Mono, places the logo top-left, and ends with a CTA bar
pointing the user to the bio link.

The campaign goal is **wishlist signups before MVP launch**. On Instagram,
captions don't carry clickable links — so every visual ends with a small
"Link în bio" CTA, and the caption tells the full story:
*"Înscrie-te pe lista de așteptare. Link în bio → finbot.ro."*

---

## When to use this skill

Trigger on any of these:

- "fă o postare Instagram pentru Finbot"
- "vreau un carusel despre [pillar]"
- "fă-mi un story / reel cover cu mesajul X"
- "card pentru insta cu cifra Y"
- The user has copy or a brief and wants it packaged as IG-ready images.
- The user wants to draft a caption + hashtags for an Instagram post.

When the user describes a vibe but no copy yet, **first** offer 2-3 copy
options aligned with the brand pillars (see `references/copy-formulas.md`
and `references/post-archetypes.md`), then generate when they pick one.

---

## How it works

Two Python scripts read HTML templates from `assets/templates/`, inject
content + theme + format, and write self-contained HTML + Retina-2x PNG.

```
scripts/generate_post.py        ← single post (4:5 / 1:1 / 9:16)
scripts/generate_carousel.py    ← orchestrates a multi-slide carousel
assets/templates/_base.css      ← shared styles (header, CTA, dot grid,
                                  story safe areas, swipe cue)
assets/templates/statement.html ← variant: central message
assets/templates/number.html    ← variant: hero number/stat
assets/templates/question.html  ← variant: provocation/question
assets/logos/mark.svg           ← brand mark, fill=currentColor
references/post-archetypes.md   ← single-post archetypes
references/carousel-patterns.md ← carousel structures (how-to, problem→
                                  solution, listicle, story arc)
references/copy-formulas.md     ← pillar-aligned headline patterns
references/caption-template.md  ← caption structure for IG (hook, body,
                                  CTA, hashtag block)
references/hashtag-bank.md      ← curated RO fintech / antreprenor tags
examples/                       ← skill-development samples (do not put
                                  campaign output here)
```

---

## Brand rules (apply without asking)

These come from `CLAUDE.md` and the brandbook. Apply them silently — the
user shouldn't need to re-state them.

- **Romanian only.** No "boost", "actionable", "insights". OK: "dashboard",
  "cashflow".
- **Tone of voice:** precise, clear, confident, short. No hedging
  ("poate", "ar fi util"). No multi-exclamation. No emoji in product copy
  (caption can use one emoji per post if it really earns its place — the
  default is zero).
- **Numbers in RO format:** `12.340,50 lei`. **Dates:** "25 aprilie".
- **TVA, ANAF, PFA, SRL** — exactly that casing.
- **One pillar per post.** Each post must clearly map to ONE of:
  1. *Cashflow — Banii tăi, live.*
  2. *Taxe — ANAF fără stres.*
  3. *Facturi — Automat, nu manual.*
  4. *AI Assistant — Întreabă. Răspunde.*
  Never two pillars in one post (a carousel can travel through more, but
  each slide still has one pillar).
- **Lime is for accent only.** Never on the logo mark itself.
- **If the cifra is not real**, say so: use eyebrow `EXEMPLU` or `ESTIMARE`.

---

## Variants

The same three variants as the LinkedIn skill — message shape decides:

### `statement` — central message (default)
For taglines, promises, declarative one-liners. Use `*word*` to wrap a
word or phrase in a lime highlight bar.
- Required: `--headline`
- Optional: `--eyebrow`, `--subtext`
- Best for pillars 1, 2, 4

### `number` — hero stat / cifra eroică
Number is JetBrains Mono in the accent color; caption sits below.
- Required: `--number`, `--headline` (the caption under the number)
- Optional: `--unit` (e.g. `h`, `lei`, `%`), `--eyebrow`, `--source`
- Best for problem-framing posts (cost of the status quo)

### `question` — provocation
Big opening Romanian quote (lime), question below.
- Required: `--headline` (the question)
- Optional: `--attribution` (small mono line under it)
- Best for engagement posts that drive comments and saves

---

## Themes

| Theme | Background | Text | Accent | Use when |
|---|---|---|---|---|
| `bone` | Bone (cream) | Ink | Lime | Default. Calm, confident. |
| `ink` | Ink (black) | Bone | Lime | High-contrast. Numbers, tech. |
| `lime` | Lime | Ink | Ink (CTA inverted) | Loud. CTA-heavy. Use sparingly. |
| `moss` | Moss (deep green) | Bone | Lime | Premium, calm-but-distinct. |

A healthy IG feed mix is roughly **bone 35% / ink 30% / moss 25% / lime 10%**.
Instagram rewards consistent visual rhythm — when planning a grid, alternate
themes so the profile grid reads as a campaign, not a stack.

Lime saturates fast — don't post two lime cards back-to-back, and within a
single carousel use lime only on the closing CTA slide.

---

## Formats

| Format | Dimensions | Use |
|---|---|---|
| `4x5` | 1080×1350 | **Default.** IG feed portrait, max screen real estate. |
| `1x1` | 1080×1080 | Square — for grid-consistent carousels or legacy looks. |
| `9x16` | 1080×1920 | Story / Reel cover. Has top + bottom safe-area padding. |

**Carousels:** all slides MUST share the same aspect ratio. 4:5 is the
default. Carousel script rejects 9:16 — that format is for stories/reels,
not multi-slide feed posts.

**Story safe areas:** in 9:16, IG overlays the profile / sticker UI on the
top ~220px and bottom ~260px. The script auto-pads so logo + CTA stay
clear of those bands. Don't put load-bearing content in those zones.

---

## Default workflow when invoked

1. **Confirm or draft the message.** If the user gave a vague brief
   ("ceva despre TVA"), propose 2-3 copy variants from
   `references/copy-formulas.md`. Pick one with the user.

2. **Pick the format and shape.**
   - Single post → `generate_post.py` with `--format 4x5` (or `9x16`
     for story).
   - Carousel → write a JSON spec (see below) and run
     `generate_carousel.py`. For carousels, also read
     `references/carousel-patterns.md` to pick a structure.

3. **Pick the variant per slide.** `statement` for promises, `number` for
   stats, `question` for provocations. In a carousel, mix variants — a
   `number` cover lands harder than another `statement`.

4. **Pick themes.** Default `bone`. Vary across a campaign / carousel.

5. **Run the generator with `--render-png`.** Show the user the PNG (or
   the carousel preview HTML). Iterate if they want changes.

6. **Write the caption file.** A sibling `.md` with hook + body + CTA +
   hashtag block. See `references/caption-template.md` and pull tags from
   `references/hashtag-bank.md`. Don't invent hashtags — pick from the
   bank, ~10-15 per post.

---

## CLI usage

### Single post (feed 4:5)

```bash
python3 scripts/generate_post.py \
    --variant statement --theme bone \
    --headline "Banii tăi. *Live.*" \
    --eyebrow "TEASER · 01" \
    --subtext "Cashflow, taxe, facturi — într-un singur loc." \
    --meta "01 / TEASER" \
    --out ../examples/01-banii-live --render-png
```

### Story / Reel cover (9:16)

```bash
python3 scripts/generate_post.py \
    --variant statement --theme moss --format 9x16 \
    --headline "ANAF.\n*Fără stres.*" \
    --eyebrow "TEASER" \
    --out ../examples/story-anaf --render-png
```

### Carousel (multi-slide)

Write a JSON spec:

```json
{
  "slug": "cum-functioneaza-finbot",
  "format": "4x5",
  "default_theme": "bone",
  "theme_mix": ["bone", "ink", "ink", "moss", "lime"],
  "slides": [
    {"variant": "statement", "headline": "Cum funcționează *Finbot.*", "eyebrow": "GHID · 01"},
    {"variant": "statement", "headline": "1. Conectezi conturile.", "subtext": "Bănci, ANAF, e-Factura. O dată."},
    {"variant": "statement", "headline": "2. Finbot preia tot.", "subtext": "Facturi, plăți, cifre. Automat."},
    {"variant": "statement", "headline": "3. Vezi totul live.", "subtext": "Dashboard, rapoarte, AI."},
    {"variant": "statement", "headline": "Înscrie-te.", "subtext": "Lista de așteptare e deschisă."}
  ]
}
```

Then:

```bash
python3 scripts/generate_carousel.py \
    --spec carousel.json \
    --out ../examples/carousel-cum-functioneaza --render-png
```

Outputs:
- `carousel-cum-functioneaza-1.html` ... `carousel-cum-functioneaza-5.html`
- `carousel-cum-functioneaza-1.png` ... `carousel-cum-functioneaza-5.png`
- `carousel-cum-functioneaza-preview.html` — all 5 slides side-by-side

Each slide auto-gets a `K/N` page indicator in the top-right meta corner.
Slide 1 auto-gets the `SWIPE →` cue above the CTA.

---

## Output location and naming

**All production posts live at `social/design/instagram-posts/`** (relative
to project root). Inside, organize by campaign — e.g.
`social/design/instagram-posts/teaser-mvp-2026/`.

Naming pattern:
- Single post: `NN-slug.png` / `.html` / `.md`
- Carousel: `NN-slug-1.png`, ..., `NN-slug-K.png`, plus `NN-slug-preview.html`
  and `NN-slug.md` (one caption file for the whole carousel).
- Story: `NN-slug-story.png` (suffix `-story` to distinguish from the
  feed equivalent at the same slug).

Examples:
- `social/design/instagram-posts/teaser-mvp-2026/01-banii-tai-live.png`
- `social/design/instagram-posts/teaser-mvp-2026/02-41h-pierdute-story.png`
- `social/design/instagram-posts/teaser-mvp-2026/05-cum-functioneaza-1.png` (carousel slide 1)

The skill's own `examples/` folder is for skill-development samples only
— do NOT save real campaign output there.

---

## Caption files (.md sibling)

Every uploaded post needs a caption. Write it as a sibling Markdown file
with this structure (see `references/caption-template.md` for full notes):

```markdown
# 01 — Banii tăi. Live.

## Caption

Banii tăi. Live.

Cashflow, taxe, facturi — într-un singur loc, în timp real. Antreprenorul
vede cifra, nu o caută.

Înscrie-te pe lista de așteptare. Link în bio → finbot.ro.

## Hashtags

#finbot #antreprenoriroman #cashflow #afaceriromania #srl #pfa
#fintech #financialops #contabilitate #romania #imm #firmaroma
#waitlist #finbotrocks #lansaresoon
```

Notes:
- **First line is the hook** — it's what shows above "more". Keep under
  ~125 chars. The hook is usually the headline of the image, restated.
- **Body** = 1-3 short paragraphs. Same voice as the brandbook.
- **CTA** = always include "Link în bio → finbot.ro" or
  "Înscrie-te pe lista de așteptare. Link în bio → finbot.ro".
- **Hashtags** = 10-15, picked from `references/hashtag-bank.md`. Don't
  invent. Don't go above 20 — IG penalises hashtag spam now.

For carousels, the caption can reference the structure ("Swipe pentru
cele 3 pași.") and tease the payoff slide.

---

## Common pitfalls and how to avoid them

- **Wrong CTA mechanics.** On Instagram the URL in the image is not
  clickable. The image CTA = "Link în bio". The full URL goes in the
  caption: "...Link în bio → finbot.ro." Don't promise a click that won't
  happen.
- **Mixed aspect ratios in a carousel.** IG forces all slides to share
  the cover's aspect ratio — anything off-ratio gets cropped. The script
  enforces this; don't try to mix.
- **Story content in the safe-area bands.** If your headline ends up
  partially under the IG profile overlay, push it lower in the canvas
  (the script's safe areas already handle this for header/CTA, but
  custom-positioned content needs awareness).
- **Carousel that ends without a CTA slide.** Audiences swipe to the end
  and need somewhere to go. The last slide should always be a clear "what
  next" — usually `statement` + `lime` theme + "Înscrie-te." headline.
- **Two lime slides next to each other in a carousel.** Lime on every
  slide kills lime as a signal. One per carousel, on the closing slide.
- **Hashtag spam.** Don't dump 30 tags. 10-15 from the bank, all
  brand-relevant. The IG algorithm now downgrades obvious tag-stuffing.
- **Posting the HTML to Instagram.** Always export the PNG. IG accepts
  PNG/JPG only.

---

## Extending the skill

- **New variant?** Add `assets/templates/<name>.html` mirroring an
  existing variant (same `${...}` placeholders, including `${swipe_block}`
  before the footer), then add `<name>` to `VARIANTS` in
  `generate_post.py`.
- **New theme?** Add an entry to `THEMES` in `generate_post.py`.
- **Adjusting story safe areas?** Tweak `STORY_TOP_SAFE` /
  `STORY_BOTTOM_SAFE` in `generate_post.py`. Re-render to verify.
- **Carousel-only template?** Most likely you don't need one — variants +
  themes + `--swipe` cover the common cases. If you do, extend the spec
  parsing in `generate_carousel.py`.

---

## Reference reading

- `references/post-archetypes.md` — single-post archetypes (recipes for
  Instagram-friendly statement / number / question posts).
- `references/carousel-patterns.md` — multi-slide structures (how-to,
  problem→solution, listicle, story arc) with sample slide outlines.
- `references/copy-formulas.md` — copy patterns aligned with each pillar.
- `references/caption-template.md` — how to structure the .md sibling.
- `references/hashtag-bank.md` — curated Romanian fintech / antreprenor
  hashtags. Pick from here; don't invent.
