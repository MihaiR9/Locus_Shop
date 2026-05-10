-- Seed — cele 6 vinuri din lib/wines.ts.
-- Idempotent: ON CONFLICT DO NOTHING pe (code), ca să poți re-rula.
-- Prețuri stocate ca integer în bani (cents-of-RON): 79 lei → 7900.

insert into products (
  code, slug, name, gama, type, sweetness, abv, price_cents, bottle_color,
  serving_temp, notes, short, taste, pair, glass, decant, age_note, grape, year, stock, active
) values
-- ── Gama CUVINTE ────────────────────────────────────────────────
(
  'LC01', 'feteasca-regala-cuvinte', 'Fetească Regală',
  'cuvinte', 'alb', 'demisec', 13.5, 7900, 'white',
  '8–10°C',
  'Flori albe, fructe galbene coapte, citrice fine, accente discrete de miere. Final curat, delicat.',
  'Vin elegant și armonios. Flori albe, fructe galbene coapte, citrice fine, accente discrete de miere.',
  'Aromele de flori albe se împletesc cu note de fructe galbene coapte, citrice fine și accente discrete de miere. Textura este echilibrată, cu o prospețime bine definită și un final curat, delicat.',
  'Carne albă, paste, risotto sau brânzeturi cremoase. Excelent ca aperitiv lângă crudități și pește alb la grătar.',
  'pahar tip alb mediu', 'nu este nevoie', 'consumă în 2–3 ani',
  'Fetească Regală 100%', 2025, 100, true
),
(
  'LC02', 'feteasca-neagra-cuvinte', 'Fetească Neagră',
  'cuvinte', 'rosu', 'demisec', 14.9, 8900, 'red',
  '14–16°C',
  'Fructe negre coapte, prune uscate, accente fine de condimente. Structură catifelată, taninuri integrate.',
  'Vin intens și bine definit. Fructe negre coapte, prune uscate, accente fine de condimente. Final persistent.',
  'Arome de fructe negre coapte, prune uscate și accente fine de condimente. Structura este amplă și catifelată, cu taninuri bine integrate și un final persistent.',
  'Carne roșie, vânat, preparate condimentate sau brânzeturi maturate. Funcționează și cu mâncăruri tradiționale românești.',
  'pahar Burgundia', '20–30 min recomandat', 'potențial de învechire 4–6 ani',
  'Fetească Neagră 100%', 2025, 100, true
),
(
  'LC04', 'riesling-italian-cuvinte', 'Riesling Italian',
  'cuvinte', 'alb', 'sec', 13.0, 7900, 'white',
  '8–12°C',
  'Citrice, măr verde, accente florale discrete. Aciditate bine definită, final curat, răcoritor.',
  'Vin proaspăt și precis. Citrice, măr verde, accente florale. Aciditate susținută, final răcoritor.',
  'Note de citrice, măr verde și accente florale discrete. Structura este susținută de o aciditate bine definită, care îi conferă tensiune și un final curat, răcoritor.',
  'Preparate ușoare, pește, fructe de mare, salate sau brânzeturi fine. Excelent cu sushi și ceviche.',
  'pahar tip Riesling', 'nu este nevoie', 'consumă în 2–4 ani',
  'Riesling Italian 100%', 2025, 100, true
),
-- ── Gama SEMNE ──────────────────────────────────────────────────
(
  'LS01', 'feteasca-regala-semne', 'Fetească Regală',
  'semne', 'alb', 'demisec', 13.5, 10900, 'white',
  '8–10°C',
  'Flori albe, fructe coapte, miere și citrice. Textură rotundă, final delicat care invită la încă un pahar.',
  'Selecție de parcelă. Flori albe, fructe coapte, miere și citrice. Textură rotundă, final delicat care invită la încă un pahar.',
  'Aromele de flori albe și fructe coapte se împletesc cu note subtile de miere și citrice. Textura este echilibrată, cu un gust rotund și un final delicat.',
  'Carne albă, paste, risotto sau brânzeturi cremoase. Excelent cu mese de zi cu zi sau ocazii speciale.',
  'pahar tip alb mediu', 'nu este nevoie', 'consumă în 2–3 ani',
  'Fetească Regală 100%', 2025, 80, true
),
(
  'LS02', 'feteasca-neagra-semne', 'Fetească Neagră',
  'semne', 'rosu', 'demisec', 14.9, 11900, 'red',
  '14–16°C',
  'Fructe negre coapte, prune uscate, condimente fine. Structură amplă și catifelată, final persistent.',
  'Selecție de parcelă. Fructe negre coapte, prune uscate, condimente fine. Structură amplă, taninuri integrate.',
  'Vin intens și bine definit, cu arome de fructe negre coapte, prune uscate și accente fine de condimente. Structură amplă și catifelată cu un final persistent.',
  'Carne roșie, vânat, preparate condimentate sau brânzeturi maturate. Magic lângă o tocăniță românească.',
  'pahar Burgundia', '30–40 min recomandat', 'potențial de învechire 5–7 ani',
  'Fetească Neagră 100%', 2025, 80, true
),
(
  'LS04', 'riesling-italian-semne', 'Riesling Italian',
  'semne', 'alb', 'sec', 13.0, 10900, 'white',
  '8–12°C',
  'Citrice, măr verde, accente florale. Aciditate susținută, tensiune și un final răcoritor, precis.',
  'Selecție de parcelă. Citrice, măr verde, accente florale. Aciditate susținută, tensiune precisă.',
  'Note proaspete de citrice și măr verde, cu accente florale discrete. Aciditate bine definită care conferă tensiune și un final curat, răcoritor.',
  'Preparate ușoare, pește, fructe de mare, salate sau brânzeturi fine. Excelent cu mâncare orientală.',
  'pahar tip Riesling', 'nu este nevoie', 'consumă în 2–4 ani',
  'Riesling Italian 100%', 2025, 80, true
)
on conflict (code) do nothing;

-- ── Cupoane demo ────────────────────────────────────────────────
insert into coupons (code, percent_off, min_amount_cents, expires_at, max_uses, active) values
  ('LOCUS10',    10, 0,     null, null, true),
  ('PARTENER15', 15, 30000, null, 200,  true)
on conflict (code) do nothing;
