-- 0019 — Inversare ierarhie prețuri gama Cuvinte vs Semne
--
-- Corecție confirmată 2026-08-08: CUVINTE e gama mai scumpă, SEMNE e
-- cea mai ieftină. Prețurile inițiale din 0001_init.sql erau inversate
-- (cuvinte 79-89, semne 109-119) — le mutăm pe cele corecte:
--   CUVINTE (LC01/LC02/LC04) → 109/119/109 lei
--   SEMNE   (LS01/LS02/LS04) → 79/89/79 lei
--
-- Comenzile deja plasate rămân neschimbate — au preț snapshot pe
-- `order_items.unit_price_cents`, nu referință live la `products.price_cents`.

update products set price_cents = 10900 where code = 'LC01';
update products set price_cents = 11900 where code = 'LC02';
update products set price_cents = 10900 where code = 'LC04';
update products set price_cents = 7900  where code = 'LS01';
update products set price_cents = 8900  where code = 'LS02';
update products set price_cents = 7900  where code = 'LS04';
