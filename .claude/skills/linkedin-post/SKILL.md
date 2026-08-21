---
name: linkedin-post
description: |
  Generate brand-aligned LinkedIn post images for Finbot's pre-MVP teaser
  campaign — text overlays on Finbot brand-colored backgrounds, with logo,
  brand fonts (Archivo, Inter, JetBrains Mono), and a CTA driving traffic to
  the wishlist (finbot.ro). Outputs both an HTML preview and a PNG ready to
  upload. ALWAYS use this skill when the user asks for a LinkedIn post,
  social media card, teaser image, "postare", "card de social", "imagine
  pentru LinkedIn", "post de teasing" — even when they don't say the exact
  word "image" or "PNG". Also use it when the user wants to draft copy for a
  Finbot post, since this skill bundles brand-aligned copy guidance.
---

# Finbot LinkedIn Post Generator

Produce LinkedIn post images for Finbot's teaser campaign. Each image
follows the brandbook (60% neutral / 30% primary / 10% lime accent), uses
Archivo + Inter + JetBrains Mono, places the logo top-left, and ends with
a CTA bar driving traffic to the wishlist.

The campaign goal is **wishlist signups before MVP launch**. Every post
must end with a CTA — the default is *"Înscrie-te pe lista de așteptare → finbot.ro"*.

---

## When to use this skill

Trigger on any of these:

- "fă o postare LinkedIn pentru Finbot"
- "vreau un teaser pentru..." / "un post de teasing"
- "card pentru social cu mesajul X"
- "vreau să anunț cifra X"
- "imagine cu textul Y"
- The user has a one-liner statement, a question, or a stat and wants it
  packaged as a brandable image.

When the user describes a vibe but no copy yet, **first** offer 2-3 copy
options aligned with the brand pillars (see `references/copy-formulas.md`),
then generate when they pick one.

---

## How it works

A Python generator reads HTML templates from `assets/templates/`, injects
the user's content + a theme + a format, and writes both an HTML file
(self-contained, openable in any browser) and a PNG (rendered by Chrome
headless at Retina 2x).

```
scripts/generate_post.py        ← entrypoint
assets/templates/_base.css      ← shared styles (header, CTA, dot grid)
assets/templates/statement.html ← variant: central message
assets/templates/number.html    ← variant: hero number/stat
assets/templates/question.html  ← variant: provocation/question
assets/logos/mark.svg           ← brand mark, fill=currentColor
references/post-archetypes.md   ← which variant for which message
references/copy-formulas.md     ← copy patterns aligned with brand pillars
examples/                       ← previously rendered samples
```

---

## Brand rules (apply without asking)

These come from `CLAUDE.md` and the brandbook. Apply them silently — the
user shouldn't need to re-state them.

- **Romanian only.** No "boost", "actionable", "insights". OK: "dashboard",
  "cashflow".
- **Tone of voice:** precise, clear, confident, short. No hedging
  ("poate", "ar fi util"). No multi-exclamation. No emoji in product copy.
- **Numbers in RO format:** `12.340,50 lei`. **Dates:** "25 aprilie".
- **TVA, ANAF, PFA, SRL** — exactly that casing.
- **One pillar per post.** Each post must clearly map to ONE of:
  1. *Cashflow — Banii tăi, live.*
  2. *Taxe — ANAF fără stres.*
  3. *Facturi — Automat, nu manual.*
  4. *AI Assistant — Întreabă. Răspunde.*
  Never two pillars in one card.
- **Lime is for accent only.** Never on the logo mark itself.
- **If the cifra is not real**, say so: use eyebrow `EXEMPLU` or `ESTIMARE`.

---

## Variants

Three layouts, picked by the message shape:

### `statement` — central message (default)
For taglines, promises, declarative one-liners. Use `*word*` to wrap a
word or phrase in a lime highlight bar (becomes a black "tag" on lime
theme).
- Required: `--headline`
- Optional: `--eyebrow`, `--subtext`
- Best for pillars 1, 2, 4

### `number` — hero stat / cifra eroică
For one big number that does the work. Number is JetBrains Mono in the
accent color; caption sits below.
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
| `lime` | Lime | Ink | Ink (CTA inverted) | Loud. CTA-heavy. Use sparingly — max 1-in-5 in a feed. |
| `moss` | Moss (deep green) | Bone | Lime | Premium, calm-but-distinct. |

A healthy campaign mix is roughly **bone 40% / ink 30% / moss 20% / lime 10%**.
Lime saturates fast — don't post two lime cards in a row.

---

## Formats

- `4x5` (1080×1350) — **default.** LinkedIn portrait, max screen real estate.
- `1x1` (1080×1080) — Square, classic.
- `16x9` (1200×675) — Banner / link preview.

---

## CLI usage

```bash
python3 scripts/generate_post.py \
    --variant statement --theme bone \
    --headline "Banii tăi. *Live.*" \
    --eyebrow "TEASER · 01" \
    --subtext "Cashflow, taxe, facturi — într-un singur loc." \
    --meta "01 / TEASER" \
    --out examples/01-banii-live --render-png
```

Outputs:
- `examples/01-banii-live.html` — self-contained, open in any browser
- `examples/01-banii-live.png` — Retina 2x PNG ready to upload (2160×2700)

### Default workflow when invoked

1. Confirm or draft the message. If the user gave a vague brief
   ("ceva despre TVA"), propose 2-3 copy variants from
   `references/copy-formulas.md`. Pick one with the user.
2. Pick the variant: `statement` for promises, `number` for stats,
   `question` for provocations.
3. Pick the theme. Default `bone`. Vary across a campaign — see mix above.
4. Run the generator with `--render-png`.
5. Show the user the PNG. If they want changes, regenerate.

### Output location and naming

**All production posts live at `social/design/linkedin-posts/`** (relative
to the project root). Inside, organize by campaign — e.g.
`social/design/linkedin-posts/teaser-mvp-2026/`.

Naming pattern per post: `NN-slug` (zero-padded number, kebab-case slug,
no diacritics). The generator writes both `.html` and `.png`; if the user
also asks for a caption, write a sibling `NN-slug.md` with the LinkedIn
caption text.

Examples:
- `social/design/linkedin-posts/teaser-mvp-2026/01-banii-tai-live.png`
- `social/design/linkedin-posts/teaser-mvp-2026/02-41h-pierdute.png`

The skill's own `examples/` folder is for skill-development samples only
— do NOT save real campaign output there. See
`social/design/linkedin-posts/README.md` for the convention.

---

## Common pitfalls and how to avoid them

- **Headline too long → bus the canvas.** The script auto-sizes by char
  count, but copy beats engineering. Keep headlines under ~30 characters
  for `statement`. If you must go longer, accept the smaller font.
- **Two pillars in one card.** Re-read your headline + subtext. If they
  cover both "facturi" and "TVA", split into two posts.
- **Lime fatigue.** Don't post two lime cards in a row. Don't put lime
  accent on every line — pick one phrase per card.
- **`*highlight*` on a multi-word phrase that wraps lines.** Looks fine —
  the CSS uses `box-decoration-break: clone`, so the bar repeats per line.
  But if you wrap 3 lines, it gets visually heavy. Highlight 1-3 words max.
- **CTA URL doesn't match production.** The default is `finbot.ro`. If the
  wishlist URL ends up as `finbot.ro/lista`, update the default in
  `scripts/generate_post.py` (constant `cta_url`).
- **Posting raw filename to LinkedIn.** Always export the PNG, not the
  HTML. LinkedIn does not render HTML uploads.

---

## Extending the skill

- **New variant?** Add `assets/templates/<name>.html` mirroring the structure
  of an existing one (same `${...}` placeholders), then add `<name>` to
  the `VARIANTS` tuple in `generate_post.py`.
- **New theme?** Add an entry to the `THEMES` dict in `generate_post.py`
  with bg, text, muted, accent, accent_text, grid_dot, use_grid.
- **New format?** Add to the `FORMATS` dict.
- **Tweaking design?** The HTML templates are kept lean — most styling
  lives in `_base.css`. Open the generated HTML in a browser to iterate
  visually before re-rendering PNG.

---

## Reference reading

- `references/post-archetypes.md` — when to pick each variant; sample
  archetypes for a teaser series of 12-20 posts.
- `references/copy-formulas.md` — copy patterns aligned with each of the
  4 pillars; bank of headlines to start from.
