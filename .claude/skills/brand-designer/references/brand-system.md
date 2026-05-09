# Brand System Reference

## Color Palette Construction

### Palette Roles
Every brand needs exactly these 5 color roles. Never more to start, never fewer.

| Role | Purpose | Count |
|------|---------|-------|
| Primary | Main identity color, CTAs, logo mark | 1 |
| Secondary | Accents, hover states, highlights | 1 |
| Neutral Light | Backgrounds, cards | 1–2 |
| Neutral Dark | Body text, borders | 1 |
| Semantic | Success/error (only needed for UI) | optional |

### Contrast Requirements
- Text on background: minimum 4.5:1 (WCAG AA)
- Large text / headings: minimum 3:1
- Logo mark on white and on dark: must both pass 3:1

### Palette Archetypes by Industry

**Tech / SaaS / Fintech**
- Dominant: deep navy, electric blue, or slate
- Accent: vibrant cyan, lime, or orange
- Neutral: off-white (#F8F9FA), near-black (#111827)
- Feel: precise, trustworthy, scalable

**Creative / Agency / Media**
- Dominant: black or near-black
- Accent: bold single color (red, electric yellow, vivid purple)
- Neutral: warm white (#FAFAF8) or cool gray
- Feel: confident, editorial, striking

**Health / Wellness / Coaching**
- Dominant: warm green, sage, or soft teal
- Accent: warm gold or terracotta
- Neutral: linen (#FAF7F2), warm gray
- Feel: grounded, nurturing, credible

**Luxury / Premium / Professional Services**
- Dominant: deep navy, charcoal, or forest green
- Accent: gold (#C9A84C), champagne, or copper
- Neutral: cream (#FDF8F0), dark slate
- Feel: elevated, authoritative, timeless

**Lifestyle / Consumer / Retail**
- Dominant: brand-expressive (any strong hue)
- Accent: complementary or split-complementary
- Neutral: white + warm mid-tone
- Feel: energetic, approachable, desirable

### Color Harmony Rules
- **Analogous**: colors 30° apart on the wheel — harmonious, calm
- **Complementary**: colors 180° apart — high contrast, energetic
- **Split-complementary**: one base + two adjacent to its complement — balanced tension
- **Triadic**: three colors 120° apart — vibrant, complex (use sparingly)
- For most brands: 1 dominant + 1 accent + 2 neutrals is enough

---

## Typography System

### Pairing Logic
Every brand needs two typefaces maximum (three only if justified):
1. **Display / Heading font** — makes the brand recognizable at a glance
2. **Body font** — legible at small sizes, comfortable for long reads

Rules for pairing:
- Don't pair two serifs or two grotesque sans-serifs — they compete
- Pair a geometric sans with a humanist sans, or a serif with a clean sans
- The heading font carries personality; the body font must not distract

### Font Stack by Brand Archetype

**Bold / Techy / Modern**
- Heading: Space Grotesk, Satoshi, Plus Jakarta Sans (Bold)
- Body: Inter, DM Sans, Geist

**Premium / Authoritative**
- Heading: Playfair Display, Cormorant Garamond, Editorial New
- Body: Libre Baskerville, Source Serif 4, or clean sans like Lato

**Friendly / Approachable**
- Heading: Nunito, Poppins, Outfit
- Body: Nunito, Open Sans, Manrope

**Minimal / Editorial**
- Heading: Neue Haas Grotesk, Be Vietnam Pro, Unbounded
- Body: Inter, IBM Plex Sans

**Handcrafted / Organic**
- Heading: Instrument Serif, Fraunces, Raleway (Thin/Light)
- Body: Lato, Questrial

### Type Scale (base 16px)
```
xs:  12px / 0.75rem
sm:  14px / 0.875rem
base: 16px / 1rem
md:  18px / 1.125rem
lg:  20px / 1.25rem
xl:  24px / 1.5rem
2xl: 30px / 1.875rem
3xl: 36px / 2.25rem
4xl: 48px / 3rem
5xl: 60px / 3.75rem
6xl: 72px / 4.5rem
```

Line heights:
- Heading: 1.1–1.2 (tight)
- Subheadings: 1.3–1.4
- Body: 1.5–1.6 (comfortable)
- Captions: 1.4

Letter spacing:
- Headings (large): -0.02em to -0.04em (tighten)
- All-caps labels: 0.05em to 0.1em (widen)
- Body: 0 (default)

---

## Spacing Scale

Base unit: 4px (0.25rem). All spacing is a multiple of 4.

```
space-1:  4px
space-2:  8px
space-3:  12px
space-4:  16px
space-5:  20px
space-6:  24px
space-8:  32px
space-10: 40px
space-12: 48px
space-16: 64px
space-20: 80px
space-24: 96px
```

### Layout Zones
- **Micro spacing** (between related elements): 4–8px
- **Component spacing** (between sections within a card): 12–24px
- **Layout spacing** (between major sections): 48–96px
- **Safe zone on print** (from edge of card/document): 5–8mm

---

## Logo Mark Styles

### Geometric Marks
Best for: tech, finance, architecture, engineering
- Constructed from basic shapes: circles, triangles, squares, polygons
- Use grid-aligned construction (8px or 10px grid)
- Negative space as a design element

### Lettermark / Monogram
Best for: professional services, agencies, personal brands
- 1–3 letters from brand name
- Custom letterform or ligature
- Works well at small sizes (favicon-friendly)

### Wordmark
Best for: consumer brands, media, straightforward names
- Logo is the brand name in a custom or distinct typeface
- Tracking and weight adjustments are essential
- Add a subtle custom touch (custom letter, modified ascender)

### Abstract / Symbolic
Best for: brands that will scale globally, apps, platforms
- Abstract shape with meaning (conveys motion, growth, connection, etc.)
- Explain the symbolism — clients and customers respond to story
- Must work in 1 color

### Emblem / Badge
Best for: heritage brands, food & beverage, sports, local business
- Contained shape (circle, shield, hexagon)
- All elements inside the boundary
- Rich at large size, may need simplified version for small use

---

## Logo Construction Guidelines

### Grid and Geometry
- Always design on a grid (8px or 16px)
- Use consistent stroke weights (e.g., all strokes 2px or all 3px, not mixed)
- Round corners uniformly if rounding — don't mix sharp and rounded
- Optical adjustments are valid (triangles appear smaller than equal-area squares — adjust)

### Clearspace Rule
- Minimum clearspace = height of the cap-height of the wordmark
- Enforce with a box in the SVG or a comment: `<!-- clearspace: Xpx -->`

### Minimum Size
- For print: 25mm wide minimum
- For digital: 32px wide minimum (icon variant should work at 16px)

### Color Variants Required
1. Full color (primary)
2. Reversed (white on dark)
3. Monochrome black
4. Monochrome white
