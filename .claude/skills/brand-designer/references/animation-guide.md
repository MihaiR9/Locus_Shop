# Animation Guide: Brand Motion Design

## Principles of Brand Animation

Brand animations must feel consistent with the brand personality:
- **Bold / Modern brands**: fast, decisive, confident motion (200–350ms, ease-out)
- **Premium / Luxury brands**: slow, deliberate, elegant motion (600–1200ms, ease-in-out)
- **Friendly / Playful brands**: bouncy, springy, warm motion (400–600ms, spring easing)
- **Tech / Precise brands**: linear, clean, functional motion (250–400ms, ease-out or linear)

Core rule: motion should reinforce the brand story, not just decorate.

---

## CSS Animations

### Logo Reveal — Fade + Scale
Use for: website header, splash screen, email signature animation

```css
/* Logo reveal — elegant fade-in with subtle scale */
@keyframes logoReveal {
  0% {
    opacity: 0;
    transform: scale(0.92) translateY(8px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.brand-logo {
  animation: logoReveal 600ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
  animation-delay: 100ms;
  opacity: 0; /* start hidden */
}
```

### Logo Reveal — Draw Path (SVG stroke animation)
Use for: animated logo on landing page, presentation intro

```css
/* Applied to SVG paths in the logo mark */
@keyframes drawPath {
  0% { stroke-dashoffset: var(--path-length); }
  100% { stroke-dashoffset: 0; }
}

/* In SVG: set stroke="var(--brand-primary)" fill="none" on paths */
/* Calculate path length via JS: path.getTotalLength() */
.logo-path {
  stroke-dasharray: var(--path-length, 300);
  stroke-dashoffset: var(--path-length, 300);
  animation: drawPath 1200ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* Then fade in fill after draw completes */
@keyframes fillIn {
  0% { fill-opacity: 0; }
  100% { fill-opacity: 1; }
}

.logo-path-fill {
  animation: fillIn 400ms ease 1200ms forwards;
  fill-opacity: 0;
}
```

### Entrance Animation — Stagger
Use for: social post templates, presentation slides, banner ads

```css
/* Parent enables stagger via CSS custom properties */
.animate-stagger > * {
  opacity: 0;
  animation: slideUp 500ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}

.animate-stagger > *:nth-child(1) { animation-delay: 0ms; }
.animate-stagger > *:nth-child(2) { animation-delay: 100ms; }
.animate-stagger > *:nth-child(3) { animation-delay: 200ms; }
.animate-stagger > *:nth-child(4) { animation-delay: 300ms; }

@keyframes slideUp {
  0% { opacity: 0; transform: translateY(24px); }
  100% { opacity: 1; transform: translateY(0); }
}
```

### Animated Banner — Loop
Use for: website header banner, digital signage

```css
@keyframes bannerSlide {
  0%   { transform: translateX(0); opacity: 1; }
  40%  { transform: translateX(0); opacity: 1; }
  50%  { transform: translateX(-20px); opacity: 0; }
  51%  { transform: translateX(20px); opacity: 0; }
  60%  { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(0); opacity: 1; }
}

.banner-text {
  animation: bannerSlide 5s ease-in-out infinite;
}

/* Accent bar pulse */
@keyframes accentPulse {
  0%, 100% { transform: scaleX(1); opacity: 1; }
  50%       { transform: scaleX(0.3); opacity: 0.5; }
}

.accent-bar {
  transform-origin: left center;
  animation: accentPulse 5s ease-in-out infinite;
}
```

### Color Gradient Shift
Use for: brand backgrounds, hero sections, animated posters

```css
@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animated-bg {
  background: linear-gradient(135deg, var(--primary), var(--secondary), var(--primary-dark));
  background-size: 300% 300%;
  animation: gradientShift 8s ease infinite;
}
```

### Reduced Motion Support (always include)
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Lottie JSON Spec Format

When the user needs a Lottie animation (for apps, web with lottie-web, or CapCut export), produce a structured spec that a developer or motion designer can implement. Don't produce raw Lottie JSON from scratch — it's 500+ lines and error-prone. Instead, produce this structured brief:

```json
{
  "animation_name": "logo-reveal",
  "duration_frames": 60,
  "frame_rate": 30,
  "dimensions": { "width": 400, "height": 200 },
  "background": "transparent",
  "brand_colors": {
    "primary": "#XXXXXX",
    "secondary": "#XXXXXX",
    "white": "#FFFFFF"
  },
  "layers": [
    {
      "id": "mark-circle",
      "type": "shape",
      "shape": "circle",
      "color": "#PRIMARY",
      "keyframes": [
        { "frame": 0, "scale": [0, 0], "opacity": 0 },
        { "frame": 12, "scale": [1.08, 1.08], "opacity": 1, "easing": "ease-out" },
        { "frame": 18, "scale": [1, 1], "opacity": 1, "easing": "ease-in-out" }
      ]
    },
    {
      "id": "mark-icon",
      "type": "shape",
      "path": "[describe the path shape]",
      "color": "#WHITE",
      "keyframes": [
        { "frame": 10, "opacity": 0, "scale": [0.8, 0.8] },
        { "frame": 22, "opacity": 1, "scale": [1, 1], "easing": "ease-out" }
      ]
    },
    {
      "id": "wordmark",
      "type": "text",
      "text": "[BrandName]",
      "font": "[HeadingFont]",
      "font_weight": 700,
      "color": "#DARK",
      "keyframes": [
        { "frame": 20, "opacity": 0, "position_x_offset": 12 },
        { "frame": 35, "opacity": 1, "position_x_offset": 0, "easing": "ease-out" }
      ]
    }
  ],
  "export_notes": "Loop: no. Hold last frame: yes. Export for: web (lottie-web), iOS (Airbnb Lottie), Android (Airbnb Lottie)"
}
```

---

## Motion Brief for After Effects / CapCut / Premiere

Use this format when the user wants to produce the animation themselves in a video tool:

```
ANIMATION BRIEF: [Animation Name]
Duration: [X] seconds
Canvas: [W]×[H]px
Frame rate: 25fps (for social) or 30fps (for web)

LAYER STRUCTURE (bottom to top):
1. Background — solid color [#XXXXXX] or gradient [from #XXX to #XXX, 135°]
2. Decorative element (optional) — [describe: e.g., geometric shape at 10% opacity]
3. Logo mark — centered or top-left corner
4. Headline text
5. Subtext / tagline
6. CTA label or button shape

ANIMATION SEQUENCE:
0:00–0:15  Background fades in (opacity 0→100%, ease-out)
0:10–0:25  Logo mark scales from 80%→100%, opacity 0→100% (ease-out spring)
0:22–0:35  Headline slides up from +20px, opacity 0→100% (ease-out, cubic)
0:30–0:45  Subtext fades in, opacity 0→100% (ease-in-out)
0:40–0:55  CTA element appears with scale pop (90%→105%→100%)
0:55–3:00  Hold frame (static)
3:00–3:15  All elements fade out together (ease-in)

EASING PRESETS (After Effects equivalents):
- ease-out: Velocity 100, Influence 33 (or use "Easy Ease Out" preset)
- ease-in-out: Classic Easy Ease
- spring: Bounce expression or use Motion Bro spring preset

BRAND NOTES:
- Primary color [#XXXXXX] used for mark and CTA
- All text: [HeadingFont] Bold for headlines, [BodyFont] Regular for body
- No rotation animations — brand is grounded, not playful
- Consistent timing rhythm: each element enters 12–15 frames after the previous
```

---

## Choosing the Right Animation Format

| Use case | Format | Why |
|----------|--------|-----|
| Website logo reveal | CSS animation | Zero dependencies, tiny file size |
| App icon / splash screen | Lottie JSON | Works natively on iOS/Android |
| Social media story / reel | Motion brief → CapCut/Premiere | Tool-based production |
| Animated banner ad | CSS animation or HTML5 Canvas | Widely supported in ad platforms |
| Digital signage | CSS animation | Browser-based display |
| Email signature animation | GIF (export from CSS or AE) | Email clients don't run JS/CSS |
| Presentation / keynote | Motion brief → Keynote/PowerPoint | Native slide animation tools |
