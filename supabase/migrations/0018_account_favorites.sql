-- 0018 — Preferințe cont utilizator
--
-- Când clientul plasează prima comandă (sau modifică date la checkout),
-- salvăm automat pe contul lui:
--   • Adresa de livrare → `addresses` (marchez is_default pe cea nouă)
--   • Datele facturare → `billing_profiles` (adaug flag is_default aici)
--   • Punctul FANbox favorit → 3 coloane pe `customers` (id + snapshot)
--
-- La următoarele comenzi, /checkout pre-completează formularele cu
-- defaults + oferă modal pentru selecție/adăugare adrese noi.
--
-- Snapshot-uri: pentru pickup point salvăm și numele + adresa, ca să nu
-- interogăm FanCourier la fiecare vizită de checkout.

-- Adaug flag default pe billing_profiles (addresses îl are deja).
alter table billing_profiles
  add column if not exists is_default   boolean not null default false,
  add column if not exists label        varchar(80),
  add column if not exists created_at   timestamptz not null default now();

-- Preferințe FANbox favorit pe customer (opțional).
alter table customers
  add column if not exists favorite_pickup_point_id      varchar(40),
  add column if not exists favorite_pickup_point_name    varchar(255),
  add column if not exists favorite_pickup_point_address text;

-- Un singur default per (customer, kind) pentru addresses. Un singur
-- default global per customer pentru billing_profiles.
create unique index if not exists addresses_customer_kind_default_uq
  on addresses (customer_id, kind)
  where is_default = true;

create unique index if not exists billing_profiles_customer_default_uq
  on billing_profiles (customer_id)
  where is_default = true;

comment on column customers.favorite_pickup_point_id is
  'ID FanCourier al lockerului favorit al clientului — pre-selectat la checkout.';
comment on column billing_profiles.is_default is
  'Setat true pe profilul folosit implicit la checkout.';
comment on column billing_profiles.label is
  'Nume prietenos (ex: „Casa", „Firmă") pentru selector.';
