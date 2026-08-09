-- 0017 — Taxe pe comandă: SGR + accize
--
-- SGR (Sistemul Garanție-Returnare, OUG 197/2020): 0.5 lei/ambalaj,
-- vizibil clientului la checkout, restituibil la returnarea sticlei.
--
-- Accize (Legea 227/2015): 11 lei/hL vin liniștit. INCLUSE în prețul
-- afișat, dar defalcate pe factura fiscală (obligatoriu). Le stocăm
-- calculate pe comandă ca să nu recalculăm din prețuri istorice când
-- generăm factura FGO/Smartbill.

alter table orders
  add column if not exists sgr_cents    integer not null default 0
    check (sgr_cents >= 0),
  add column if not exists excise_cents integer not null default 0
    check (excise_cents >= 0);

comment on column orders.sgr_cents is
  'Garanție SGR calculată la momentul comenzii (0.5 lei × număr sticle). Restituibilă.';
comment on column orders.excise_cents is
  'Accize vin liniștit (11 lei/hL) calculate la momentul comenzii. Inclusă în total, defalcată pe factura fiscală.';
