-- 0020 — Emitere factură prin FGO API
--
-- FGO returnează la emitere: Serie + Numar + Link (URL public PDF).
-- Le salvăm pe order ca să nu reemitem pentru aceeași comandă și ca să
-- putem trimite email cu link-ul.
--
-- `smartbill_invoice_id` din 0001 rămâne neatins — legacy, nu-l folosim.
-- FGO e sursă separată.

alter table orders
  add column if not exists fgo_invoice_number   varchar(50),
  add column if not exists fgo_invoice_series   varchar(50),
  add column if not exists fgo_invoice_link     text,
  add column if not exists fgo_invoice_created_at timestamptz,
  add column if not exists fgo_invoice_status   varchar(20);

comment on column orders.fgo_invoice_number is
  'Numărul facturii FGO (ex: 1, 42, 145). Unic per serie.';
comment on column orders.fgo_invoice_series is
  'Seria FGO (ex: LOC, BV). Configurată în FGO -> Setări -> Serii Documente.';
comment on column orders.fgo_invoice_link is
  'URL public PDF factură. Se poate trimite direct clientului prin email.';
comment on column orders.fgo_invoice_created_at is
  'Timestamp emitere factură prin API-ul FGO.';
comment on column orders.fgo_invoice_status is
  'Status intern: null = nu s-a emis, ''issued'' = emisă, ''cancelled'' = anulată, ''deleted'' = ștearsă din FGO.';
