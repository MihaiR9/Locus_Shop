# Caption Template — Finbot Instagram

Every Instagram upload needs a caption. The image carries the punch; the
caption carries the URL (because IG won't let it be clickable on the
image). The caption file lives next to the PNG as a sibling `.md`.

The structure below is consistent across single posts, carousels, and
stories. Story captions are usually shorter (often just hashtags or a
sticker) but the pattern still holds.

---

## The four-part caption

```markdown
# NN — Slug

## Caption

<HOOK — first line, ≤125 characters>

<BODY — 1-3 short paragraphs in brand voice>

<CTA — always includes "Link în bio → finbot.ro">

## Hashtags

<10-15 tags from references/hashtag-bank.md>
```

### Why these four parts

- **Hook**: Instagram truncates the caption to ~125 characters before
  showing "more". Whatever fits in that window is the only thing many
  people will read. The hook usually restates the image headline so a
  caption-only reader gets the same message.
- **Body**: Where the hook gets unpacked. Same brand voice as the
  brandbook — precise, short, no hedging. 1-3 short paragraphs.
- **CTA**: Always close with the wishlist ask + "Link în bio →
  finbot.ro". Without this, the post is a brand impression but not a
  conversion.
- **Hashtags**: 10-15 tags from the curated bank. Don't invent. Don't
  spam past 20.

### Spacing
Leave a blank line between body and CTA, and between CTA and hashtags.
Some templates put hashtags in the first comment instead of the caption
— for Finbot we keep them in the caption (one less moving piece).

---

## Examples

### Single post — Cashflow promise

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
#waitlist #lansaresoon #finantepentruantreprenori
```

### Single post — Number / cost of status quo

```markdown
# 02 — 41h pierdute lunar.

## Caption

41 de ore pe lună. Atât pierde un antreprenor mediu cu contabilitatea
manuală — verificat conturi, calculat TVA, urmărit facturi.

Estimare Finbot, 2026.

Înscrie-te pe lista de așteptare. Link în bio → finbot.ro.

## Hashtags

#finbot #antreprenoriroman #cashflow #facturi #tva #anaf
#contabilitate #afaceriromania #srl #pfa #fintech #imm
#firmaroma #lansaresoon #productivitate
```

### Carousel

```markdown
# 05 — Cum funcționează Finbot

## Caption

Finbot face contabilitatea în 3 pași. Aici sunt. (Swipe →)

Conectezi conturile. Finbot preia tot. Tu vezi cifra în timp real.

Înscrie-te pe lista de așteptare. Link în bio → finbot.ro.

## Hashtags

#finbot #antreprenoriroman #cashflow #facturi #tva #anaf
#contabilitate #afaceriromania #fintech #financialops
#smallbusinessromania #imm #pfa #srl #lansaresoon
```

### Story / Reel cover

Story captions are minimal — often just a sticker overlay or a single
line. If you write a caption (e.g. for a Reel), keep it to 1-2 lines:

```markdown
# 03 — Story · ANAF fără stres

## Caption

ANAF. Calculat.

Înscrie-te pe lista de așteptare. Link în bio → finbot.ro.

## Hashtags

#finbot #anaf #tva #antreprenoriroman #fintech
```

---

## Voice rules (recap)

These all come from `CLAUDE.md`. Captions are not exempt.

- Romanian only. No "boost", "actionable", "insights".
- Numbers in RO format: `12.340,50 lei`. Dates: "25 aprilie".
- TVA, ANAF, PFA, SRL — exactly that casing.
- No multi-exclamation. No hedging.
- Default to zero emoji. If you use one, it earns its place — and never
  more than one per caption.
- Don't break voice for "engagement bait". "Tag a friend who...!!" is
  not Finbot. Lăsăm cifra să facă treaba.

---

## How to choose hashtags

Pick from `references/hashtag-bank.md`. Aim for a balanced mix:

- **Brand & wishlist** (1-2): `#finbot`, `#waitlist`, `#lansaresoon`
- **Audience** (3-5): `#antreprenoriroman`, `#afaceriromania`, `#srl`,
  `#pfa`, `#imm`, `#firmaroma`
- **Topic** (3-5): pick from `#cashflow`, `#facturi`, `#tva`, `#anaf`,
  `#contabilitate`, `#financialops` based on the pillar
- **Category** (1-2): `#fintech`, `#romania`, `#startupromania`

Total: ~10-15. Tags repeat across posts (that's fine — that's how the
audience finds you), but rotate the topic tags to match the post pillar.
