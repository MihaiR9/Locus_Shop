# Locus Shop — Production app

Workspace dedicat aplicației reale de e-commerce (Next.js + Supabase + Stripe).

## Pentru noul agent AI (Claude Code)

**Citește prima dată `CLAUDE.md`.** Conține brief-ul complet, stadiul curent, stack-ul agreat, schema DB, roadmap-ul în 9 faze, și toate deciziile deja luate.

## Folder layout

- `CLAUDE.md` — single source of truth (auto-loaded de Claude Code)
- `reference/` — mockup-urile HTML originale (NU edit, doar citit pentru port)
  - `Landing_V1.html`, `wine.html`, `checkout.html`, `logo-locus.png`, `hero-amfora.png`
- `context/` — surse brand pentru verificări vizuale
  - `brandbook.pdf` — brandbook oficial 18 pagini
  - `landing-reference.jpeg` — referință vizuală layout dorit
- `assets-staging/` — assets pregătite pentru `public/` (după ce inițializezi Next.js)
  - `brand/` — logo (transparent), hero photo amforă
  - `photos/` — photo-uri brand pentru secțiuni

## Pașii pentru pornire

1. **Init Next.js:**
   ```bash
   pnpm create next-app . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
   ```
   Când întreabă dacă să suprascrie fișierele existente: răspunde **NU** (sau mută temporar `assets-staging/`, `reference/`, `context/`, `CLAUDE.md`, `README.md`).

2. **Mută staging-ul în `public/`:**
   ```bash
   mv assets-staging/* public/ && rmdir assets-staging
   ```

3. **Primul prompt pentru Claude Code:**
   > "Citește CLAUDE.md integral. Confirmă că ai înțeles roadmap-ul. Începem cu Faza 0 — setup tokens Tailwind și conectare Supabase."

## Sursa originală a designului

Prototipurile HTML sunt construite în `~/0_Dev/1_Locus_agentic_team/Locus_landing/`.
Modificări noi de design system se fac DOAR aici, în acest workspace.
