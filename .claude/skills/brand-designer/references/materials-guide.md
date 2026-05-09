# Materials Guide: Print & Document

## Business Card

### Specs
- Standard size: 85×55mm (3.35×2.17in)
- Safe zone: 3mm from edge (no text or critical elements beyond this)
- Bleed: 3mm beyond trim edge (for print production)
- Resolution: 300dpi for print (SVG is resolution-independent)
- Common finishes: matte, soft-touch, spot UV (document this in instructions)

### SVG Layout — Business Card Front
```svg
<!-- [BrandName] Business Card — Front
     Print size: 85×55mm
     SVG unit: 1 unit = 1mm
     Safe zone: 3mm from all edges (content should stay within 79×49mm)
     Bleed: extend background 3mm beyond viewBox if exporting for print -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85 55">
  <!-- Background -->
  <rect width="85" height="55" fill="#XXXXXX"/>

  <!-- Logo (top-left, within safe zone) -->
  <!-- Paste logo mark here, scaled to ~15mm height, positioned at 6,6 -->

  <!-- Name -->
  <text x="6" y="34" font-family="'[HeadingFont]', sans-serif"
        font-size="5.5" font-weight="700" fill="#XXXXXX">
    [Full Name]
  </text>

  <!-- Title -->
  <text x="6" y="40" font-family="'[BodyFont]', sans-serif"
        font-size="3.5" font-weight="400" fill="#XXXXXX" opacity="0.7">
    [Job Title]
  </text>

  <!-- Contact info — bottom left -->
  <text x="6" y="48" font-family="'[BodyFont]', sans-serif"
        font-size="3" fill="#XXXXXX" opacity="0.8">
    [email@domain.com]
  </text>
  <text x="6" y="52" font-family="'[BodyFont]', sans-serif"
        font-size="3" fill="#XXXXXX" opacity="0.8">
    [+40 7XX XXX XXX]
  </text>

  <!-- Website — bottom right -->
  <text x="79" y="52" font-family="'[BodyFont]', sans-serif"
        font-size="3" fill="#XXXXXX" opacity="0.8" text-anchor="end">
    [www.domain.com]
  </text>
</svg>
```

### SVG Layout — Business Card Back
```svg
<!-- [BrandName] Business Card — Back
     Full brand color fill + logo centered or tagline -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85 55">
  <!-- Full background with brand primary -->
  <rect width="85" height="55" fill="#XXXXXX"/>

  <!-- Optional subtle texture or pattern (geometric shapes at low opacity) -->
  <!-- Centered logo in white -->
  <!-- Or: centered tagline in white -->
  <text x="42.5" y="30" font-family="'[HeadingFont]', sans-serif"
        font-size="5" font-weight="700" fill="white"
        text-anchor="middle">[TAGLINE]</text>
</svg>
```

### Instructions for Client
1. Export SVG to PDF at 300dpi using Inkscape (File → Export PDF) or Illustrator
2. Add 3mm bleed if the printer requires it — extend the background rectangle to 91×61mm
3. Embed fonts or convert text to outlines before sending to print
4. Specify finish: matte laminate is standard; soft-touch for premium feel

---

## Offer / Proposal Document

### Structure
A brand-consistent offer document has these sections:
1. Cover page (full brand, client name, date)
2. About us / Introduction (optional)
3. Problem / Context (what the client needs)
4. Solution / Services offered
5. Pricing table
6. Timeline (optional)
7. Terms & Conditions (brief)
8. Call to action / Next step
9. Footer with contact info on every page

### HTML Template (A4, printable)

```html
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <title>[BrandName] — Ofertă [ClientName]</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=[HeadingFont]:wght@400;600;700&family=[BodyFont]:wght@400;500&display=swap');

    :root {
      --primary: #XXXXXX;
      --secondary: #XXXXXX;
      --neutral: #FAFAFA;
      --dark: #111111;
      --font-h: '[HeadingFont]', sans-serif;
      --font-b: '[BodyFont]', sans-serif;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: var(--font-b);
      color: var(--dark);
      background: white;
    }

    /* ---- PAGE ---- */
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm 18mm;
      position: relative;
      page-break-after: always;
    }

    /* ---- COVER ---- */
    .cover {
      background: var(--primary);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 24mm 18mm;
    }

    .cover .logo { height: 48px; filter: brightness(0) invert(1); }

    .cover h1 {
      font-family: var(--font-h);
      font-size: 56px;
      font-weight: 700;
      color: white;
      line-height: 1.1;
      letter-spacing: -0.02em;
      margin-bottom: 16px;
    }

    .cover .meta {
      font-size: 18px;
      color: rgba(255,255,255,0.7);
      line-height: 1.6;
    }

    /* ---- HEADER (non-cover pages) ---- */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 2px solid var(--primary);
      margin-bottom: 40px;
    }

    .page-header .logo-sm { height: 32px; }
    .page-header .page-title {
      font-family: var(--font-h);
      font-size: 13px;
      font-weight: 600;
      color: var(--primary);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    /* ---- TYPOGRAPHY ---- */
    h2 {
      font-family: var(--font-h);
      font-size: 32px;
      font-weight: 700;
      color: var(--dark);
      line-height: 1.2;
      margin-bottom: 16px;
      letter-spacing: -0.01em;
    }

    h3 {
      font-family: var(--font-h);
      font-size: 20px;
      font-weight: 600;
      color: var(--dark);
      margin-bottom: 12px;
    }

    p {
      font-size: 15px;
      line-height: 1.65;
      color: rgba(0,0,0,0.75);
      margin-bottom: 16px;
    }

    /* ---- CALLOUT BOX ---- */
    .callout {
      background: var(--neutral);
      border-left: 4px solid var(--primary);
      padding: 20px 24px;
      border-radius: 0 8px 8px 0;
      margin: 24px 0;
    }

    .callout p { margin-bottom: 0; }

    /* ---- PRICING TABLE ---- */
    .price-table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      font-size: 15px;
    }

    .price-table thead tr {
      background: var(--primary);
      color: white;
    }

    .price-table thead th {
      padding: 14px 16px;
      text-align: left;
      font-family: var(--font-h);
      font-weight: 600;
      font-size: 13px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .price-table tbody tr:nth-child(even) {
      background: var(--neutral);
    }

    .price-table tbody td {
      padding: 14px 16px;
      border-bottom: 1px solid #eee;
    }

    .price-table .total-row {
      font-weight: 700;
      background: var(--dark) !important;
      color: white;
    }

    .price-table .price-col {
      text-align: right;
      font-weight: 500;
    }

    /* ---- SERVICE ITEM ---- */
    .service-item {
      display: flex;
      gap: 20px;
      align-items: flex-start;
      margin-bottom: 28px;
      padding-bottom: 28px;
      border-bottom: 1px solid #eee;
    }

    .service-number {
      min-width: 40px;
      height: 40px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-h);
      font-weight: 700;
      font-size: 16px;
    }

    /* ---- FOOTER ---- */
    .page-footer {
      position: absolute;
      bottom: 16mm;
      left: 18mm;
      right: 18mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: rgba(0,0,0,0.4);
      border-top: 1px solid #eee;
      padding-top: 12px;
    }

    /* ---- PRINT ---- */
    @media print {
      .page { page-break-after: always; }
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="page cover">
    <img src="[logo-white.svg]" alt="[BrandName]" class="logo">

    <div>
      <h1>Ofertă Comercială</h1>
      <div class="meta">
        <p>Pregătită pentru: <strong style="color:white">[Numele Clientului]</strong></p>
        <p>Data: [DD.MM.YYYY]</p>
        <p>Valabilitate: 30 de zile</p>
      </div>
    </div>
  </div>

  <!-- CONTENT PAGES: use .page class + .page-header + .page-footer for each -->
  <!-- Example section page below -->
  <div class="page">
    <div class="page-header">
      <img src="[logo.svg]" alt="[BrandName]" class="logo-sm">
      <span class="page-title">Servicii Propuse</span>
    </div>

    <h2>Ce îți oferim</h2>
    <p>Descriere generală a serviciilor / soluției propuse.</p>

    <div class="service-item">
      <div class="service-number">1</div>
      <div>
        <h3>Titlu serviciu</h3>
        <p>Descriere detaliată a serviciului, ce include și ce beneficii aduce clientului.</p>
      </div>
    </div>

    <div class="callout">
      <p><strong>Important:</strong> Text de evidențiat — o garanție, un avantaj cheie sau o notă de care clientul trebuie să fie conștient.</p>
    </div>

    <div class="page-footer">
      <span>[BrandName] • [website]</span>
      <span>[email] • [telefon]</span>
    </div>
  </div>

  <!-- PRICING PAGE -->
  <div class="page">
    <div class="page-header">
      <img src="[logo.svg]" alt="[BrandName]" class="logo-sm">
      <span class="page-title">Investiție</span>
    </div>

    <h2>Detalii Financiare</h2>
    <p>Prețurile de mai jos sunt valabile 30 de zile de la data ofertei.</p>

    <table class="price-table">
      <thead>
        <tr>
          <th>Serviciu</th>
          <th>Descriere</th>
          <th class="price-col">Preț</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>[Serviciu 1]</td>
          <td>[Descriere scurtă]</td>
          <td class="price-col">[X.XXX €]</td>
        </tr>
        <tr>
          <td>[Serviciu 2]</td>
          <td>[Descriere scurtă]</td>
          <td class="price-col">[X.XXX €]</td>
        </tr>
        <tr class="total-row">
          <td colspan="2"><strong>TOTAL</strong></td>
          <td class="price-col"><strong>[XX.XXX €]</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="page-footer">
      <span>[BrandName] • [website]</span>
      <span>[email] • [telefon]</span>
    </div>
  </div>

</body>
</html>
```

### Offer Document Instructions
1. Replace all `[placeholder]` values with real content
2. Add/remove `.service-item` blocks as needed
3. To print: open in browser → File → Print → Save as PDF (enable "Background graphics")
4. For digital send: export as PDF, compress if > 5MB
5. Recommended: add a signature block on the last page for e-signature
