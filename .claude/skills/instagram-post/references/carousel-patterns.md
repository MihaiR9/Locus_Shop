# Carousel Patterns — Finbot Instagram

A carousel is a short essay told in 3-10 panels. Done well it's the
single best-performing IG format for explaining how something works,
because the user volunteers to swipe — they're committed.

A carousel needs three things:
1. **A cover that earns the first swipe.** Headline + visible "SWIPE →"
   cue. The cover decides whether anyone reads slide 2.
2. **Slides that pay off.** Each slide must add — never just re-state.
3. **A close that converts.** The last slide is the CTA — usually a
   `lime` theme statement, "Înscrie-te. Link în bio."

Length: Instagram allows 2-10 slides. The sweet spot for a teaser
campaign is **4-6 slides**. Long carousels (8+) are for deep how-to;
short ones (3) feel under-baked.

Aspect ratio: **4:5** (1080×1350) is the modern default. Use 1:1
(1080×1080) only if the campaign is grid-anchored and you need every post
to feel uniform in the profile preview.

---

## The four go-to structures

### C1 — How-It-Works (3 steps)

The classic. A cover, three step-slides, a CTA. Best for explaining a
product mechanic or process.

| # | Variant | Theme | Content |
|---|---|---|---|
| 1 | statement | bone  | Cover: "Cum funcționează *Finbot.*" |
| 2 | statement | ink   | "1. Conectezi conturile." |
| 3 | statement | ink   | "2. Finbot preia tot." |
| 4 | statement | ink   | "3. Vezi totul live." |
| 5 | statement | lime  | "Înscrie-te." + CTA bar |

**Theme tip:** Keep slides 2-4 on the same theme to signal "these belong
together". Switch theme only on cover and close so the eye knows where
the structure breaks.

### C2 — Problem → Solution

Lead with a painful number. Two or three slides on what's broken. A
slide on "and then..." Close with the promise.

| # | Variant | Theme | Content |
|---|---|---|---|
| 1 | number | ink | Cover: "41h pierdute lunar." |
| 2 | statement | ink | "Verifici conturi. Manual." |
| 3 | statement | ink | "Calculezi TVA. Manual." |
| 4 | statement | ink | "Reconciliezi facturi. Manual." |
| 5 | statement | bone | "Și apoi..." |
| 6 | statement | lime | "Finbot. *Automat.*" + CTA |

This pattern is high-conversion because the antreprenor recognises the
pain by slide 4 and the relief on slide 6 lands hard.

### C3 — Listicle ("3 lucruri pe care le face Finbot")

For audience-building, not direct conversion. Each slide stands alone —
the user can stop mid-carousel and still get value. Best for educational
content.

| # | Variant | Theme | Content |
|---|---|---|---|
| 1 | statement | bone | "3 lucruri pe care *Finbot* le face automat." |
| 2 | statement | moss | "1. Preia facturile. Din inbox, e-Factura, drive." |
| 3 | statement | moss | "2. Calculează TVA. La zi. Cu termen." |
| 4 | statement | moss | "3. Răspunde în română. Întreabă, primești date." |
| 5 | statement | lime | "Vrei să încerci? Link în bio." |

**Numbering pattern:** "1.", "2.", "3." in plain text — not "🟢 1.". The
brand voice is precise, no decorative emoji.

### C4 — Story Arc / Manifesto

For brand-level posts. A 4-slide essay that builds a worldview. Closes
with a manifesto line + CTA.

| # | Variant | Theme | Content |
|---|---|---|---|
| 1 | question | moss | Cover: "Câți antreprenori sunt și contabili pe deasupra?" |
| 2 | statement | bone | "Tu n-ai semnat pentru asta." |
| 3 | statement | bone | "Ai semnat pentru *firma ta.*" |
| 4 | statement | lime | "Finbot ține contabilitatea în viață. Tu ții firma." |

Less data, more belief. Use sparingly — 1-in-5 carousels at most.

---

## Slide-level rules

- **Page indicator** ("1/5", "2/5"...) is set automatically by the
  carousel script. Don't try to override it via `--meta`.
- **Swipe cue** appears only on slide 1 by default (the "SWIPE →" chip
  above the CTA). Don't put it on every slide — it would lie about the
  next swipe being needed.
- **Theme transitions** carry meaning. Same theme = same context. Theme
  change = "we're moving to a new section". Use this deliberately.
- **The closing slide** uses the lime theme + a one-line CTA. This is the
  one place lime earns its keep — the viewer who swiped to the end
  deserves a vivid finish.
- **Don't repeat the headline.** Each slide adds. If two slides could be
  swapped without losing meaning, one of them is filler — cut it.

---

## Carousel JSON spec template

```json
{
  "slug": "kebab-case-slug-no-diacritics",
  "format": "4x5",
  "default_theme": "bone",
  "theme_mix": ["bone", "ink", "ink", "ink", "lime"],
  "slides": [
    {
      "variant": "statement",
      "headline": "Cover headline. *Punchword.*",
      "eyebrow": "GHID · 01"
    },
    {
      "variant": "statement",
      "headline": "Slide 2 message.",
      "subtext": "Optional supporting line."
    },
    {
      "variant": "statement",
      "headline": "Înscrie-te.",
      "cta": "Link în bio"
    }
  ]
}
```

Save the spec next to the output, e.g.
`social/design/instagram-posts/teaser-mvp-2026/05-cum-functioneaza.json`,
so it can be re-rendered if copy changes later.

---

## Caption for a carousel

Carousel captions need one extra move: **promise the payoff in the first
line**, then tease the path. Don't give away slide 5 in the caption —
the caption should make the swipe feel worth it.

Example:

```markdown
## Caption

Finbot face contabilitatea în 3 pași. Aici sunt.

(Swipe →)

Conectezi conturile. Finbot preia tot. Tu vezi cifra în timp real.

Înscrie-te pe lista de așteptare. Link în bio → finbot.ro.
```

The "(Swipe →)" cue inside the caption is optional but reinforces the
visual cue on slide 1. Use it on the first carousel of a campaign; drop
it once the audience knows the format.
