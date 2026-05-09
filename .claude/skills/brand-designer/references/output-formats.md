# Output Formats Reference

## Logo: SVG Structure

### Base SVG Template
```svg
<!-- [BrandName] Logo — Primary
     Clearspace: [X]px minimum on all sides
     Minimum size: 120px width digital / 30mm print
     Colors: Primary #XXXXXX | Dark #XXXXXX -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 [W] [H]" role="img" aria-label="[BrandName] logo">
  <title>[BrandName]</title>
  <defs>
    <style>
      :root {
        --brand-primary: #XXXXXX;
        --brand-dark: #XXXXXX;
      }
    </style>
  </defs>

  <!-- Mark / Icon -->
  <g id="mark" aria-hidden="true">
    <!-- paths here -->
  </g>

  <!-- Wordmark -->
  <g id="wordmark" aria-hidden="true">
    <!-- text as paths or <text> element -->
  </g>
</svg>
```

### Icon-Only Variant
```svg
<!-- [BrandName] Logo — Icon only
     Use for: favicon, app icon, profile picture, avatar, small lockups -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 [S] [S]" role="img" aria-label="[BrandName] icon">
  <title>[BrandName]</title>
  <g id="mark">
    <!-- mark paths only, no wordmark -->
  </g>
</svg>
```

### Monochrome Variant Pattern
When producing monochrome, use `currentColor` so the SVG inherits text color:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 [W] [H]" fill="currentColor">
  <!-- all paths use fill="currentColor" or inherit -->
</svg>
```

---

## Social Media Post Templates: React Components

### Base Architecture
Each social template is a self-contained React component:
- Props carry all editable content (text, image URL, logo, colors)
- Brand colors and fonts are either injected via props or defined as constants at top
- No external CSS framework dependencies — use inline styles or CSS-in-JS
- Dimensions are defined in the component as pixel values matching platform specs

### Instagram Square (1:1)
```jsx
// InstagramPost.jsx
// Dimensions: 1080×1080px (scale to 100% for export)

const BRAND = {
  primary: '#XXXXXX',
  secondary: '#XXXXXX',
  neutral: '#XXXXXX',
  dark: '#XXXXXX',
  headingFont: "'[HeadingFont]', sans-serif",
  bodyFont: "'[BodyFont]', sans-serif",
};

export default function InstagramPost({
  headline = 'Your headline here',
  subtext = 'Supporting message or call to action',
  imageUrl = null,
  logoSrc = null,
  accentColor = BRAND.primary,
}) {
  return (
    <div style={{
      width: 1080,
      height: 1080,
      background: BRAND.neutral,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: BRAND.bodyFont,
      padding: 80,
      boxSizing: 'border-box',
    }}>
      {/* Background image (optional) */}
      {imageUrl && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3,
        }} />
      )}

      {/* Content layer */}
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {/* Accent bar */}
        <div style={{ width: 60, height: 4, background: accentColor, marginBottom: 24 }} />

        {/* Headline */}
        <h1 style={{
          fontFamily: BRAND.headingFont,
          fontSize: 72,
          fontWeight: 700,
          color: BRAND.dark,
          lineHeight: 1.1,
          margin: '0 0 16px 0',
          letterSpacing: '-0.02em',
        }}>
          {headline}
        </h1>

        {/* Subtext */}
        <p style={{
          fontFamily: BRAND.bodyFont,
          fontSize: 28,
          fontWeight: 400,
          color: BRAND.dark,
          opacity: 0.7,
          lineHeight: 1.5,
          margin: '0 0 48px 0',
        }}>
          {subtext}
        </p>

        {/* Logo */}
        {logoSrc && (
          <img src={logoSrc} alt="Brand logo" style={{ height: 48, objectFit: 'contain', alignSelf: 'flex-start' }} />
        )}
      </div>
    </div>
  );
}
```

### Instagram Story (9:16)
```jsx
// InstagramStory.jsx
// Dimensions: 1080×1920px

export default function InstagramStory({
  headline = 'Big bold message',
  cta = 'Swipe up to learn more',
  imageUrl = null,
  logoSrc = null,
}) {
  return (
    <div style={{
      width: 1080,
      height: 1920,
      background: BRAND.primary,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: BRAND.bodyFont,
      padding: 80,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      {/* Top: Logo */}
      <div style={{ paddingTop: 40 }}>
        {logoSrc && <img src={logoSrc} alt="Logo" style={{ height: 56, filter: 'brightness(0) invert(1)' }} />}
      </div>

      {/* Center: Main content */}
      <div>
        <h1 style={{
          fontFamily: BRAND.headingFont,
          fontSize: 96,
          fontWeight: 800,
          color: '#fff',
          lineHeight: 1.0,
          margin: '0 0 32px 0',
          letterSpacing: '-0.03em',
        }}>
          {headline}
        </h1>
      </div>

      {/* Bottom: CTA */}
      <div style={{
        paddingBottom: 80,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{ width: 40, height: 2, background: 'rgba(255,255,255,0.6)' }} />
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 28, margin: 0 }}>{cta}</p>
      </div>
    </div>
  );
}
```

### LinkedIn Post (1.91:1)
```jsx
// LinkedInPost.jsx
// Dimensions: 1200×628px

export default function LinkedInPost({
  headline = 'Professional insight headline',
  subtext = 'Brief supporting statement',
  category = 'Insights',
  logoSrc = null,
}) {
  return (
    <div style={{
      width: 1200,
      height: 628,
      background: BRAND.neutral,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: BRAND.bodyFont,
      padding: 80,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
    }}>
      {/* Left accent stripe */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 8, background: BRAND.primary,
      }} />

      {/* Content */}
      <div style={{ flex: 1, paddingLeft: 40 }}>
        <span style={{
          fontFamily: BRAND.bodyFont,
          fontSize: 18,
          fontWeight: 600,
          color: BRAND.primary,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: 20,
        }}>{category}</span>

        <h1 style={{
          fontFamily: BRAND.headingFont,
          fontSize: 52,
          fontWeight: 700,
          color: BRAND.dark,
          lineHeight: 1.15,
          margin: '0 0 20px 0',
          letterSpacing: '-0.02em',
        }}>{headline}</h1>

        <p style={{
          fontSize: 22,
          color: BRAND.dark,
          opacity: 0.65,
          lineHeight: 1.5,
          margin: 0,
        }}>{subtext}</p>
      </div>

      {/* Logo — bottom right */}
      {logoSrc && (
        <div style={{ position: 'absolute', bottom: 40, right: 80 }}>
          <img src={logoSrc} alt="Logo" style={{ height: 40, objectFit: 'contain' }} />
        </div>
      )}
    </div>
  );
}
```

---

## HTML/CSS Alternative (non-React)

When React is not available or the user prefers static HTML:

```html
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[BrandName] — Post Template</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=[HeadingFont]:wght@700;800&family=[BodyFont]:wght@400;500&display=swap');

    :root {
      --brand-primary: #XXXXXX;
      --brand-secondary: #XXXXXX;
      --brand-neutral: #XXXXXX;
      --brand-dark: #XXXXXX;
      --font-heading: '[HeadingFont]', sans-serif;
      --font-body: '[BodyFont]', sans-serif;
    }

    .post {
      width: 1080px;
      height: 1080px;
      background: var(--brand-neutral);
      position: relative;
      overflow: hidden;
      padding: 80px;
      box-sizing: border-box;
      font-family: var(--font-body);
    }
    /* ... rest of styles */
  </style>
</head>
<body>
  <div class="post">
    <!-- content -->
  </div>
</body>
</html>
```

---

## Export and Usage Notes

### For social posts delivered as React components:
- Use a tool like `html-to-image`, `dom-to-image`, or `puppeteer` to export as PNG
- At 1× scale: 1080px → 1080px file
- For retina-ready export, render at 2× and export at 2160px, then resize
- Google Fonts must be loaded before export (add `<link>` in head or use next/font)

### For SVG logos:
- Use Inkscape, Illustrator, or Figma's SVG import to open and edit
- For favicon: export icon-only variant at 32×32px and 16×16px PNG
- For social profile picture: export icon-only at 400×400px PNG with slight padding
