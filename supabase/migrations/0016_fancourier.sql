-- 0016 — Integrare FanCourier: câmpuri per-comandă pentru serviciu + punct PUDO
--
-- `shipping_method` (curier | ridicare) rămâne enum de nivel înalt. Pentru
-- fiecare comandă cu `curier` avem nevoie să știm CE serviciu FanCourier
-- s-a ales (Standard / FANbox / CollectPoint) pentru că se alege și la
-- checkout, și se transmite la generarea AWB-ului. Pentru serviciile care
-- cer selectarea unui punct fix (FANbox, PayPoint, sediu FAN) salvăm
-- id-ul + numele + adresa la momentul comenzii — snapshot ca să nu depindem
-- de eventuale re-map-ări la FanCourier.
--
-- awb_created_at ne ajută la reporting și la a deosebi comenzile pentru
-- care s-a emis AWB de cele doar marcate manual „shipped".

alter table orders
  add column if not exists courier_service     varchar(40),
  add column if not exists pickup_point_id     varchar(40),
  add column if not exists pickup_point_name   varchar(255),
  add column if not exists pickup_point_address text,
  add column if not exists awb_created_at      timestamptz;

comment on column orders.courier_service is
  'Serviciul FanCourier ales (Standard / FANbox / CollectPoint / Cont Colector). Null pentru ridicare la Locus.';
comment on column orders.pickup_point_id is
  'ID FanCourier al lockerului / PayPoint / sediu FAN, dacă serviciul cere selectare punct.';
comment on column orders.pickup_point_name is
  'Snapshot al numelui punctului la momentul comenzii — pentru display în admin + email.';
comment on column orders.pickup_point_address is
  'Snapshot al adresei punctului — pentru display fără reinterogare FC.';
comment on column orders.awb_created_at is
  'Când s-a emis AWB-ul prin API-ul FanCourier. Null = nu s-a emis încă (sau AWB manual pus în awb_number).';
