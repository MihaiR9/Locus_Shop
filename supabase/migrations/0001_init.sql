-- ─────────────────────────────────────────────────────────────────
-- Locus Shop — initial schema
-- Source: CLAUDE.md §8 + lib/wines.ts types.
-- Run via Supabase SQL editor or `supabase db push`.
-- All currency stored as integer `_cents` to avoid float drift.
-- ─────────────────────────────────────────────────────────────────

-- ─── Extensions ──────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Enums ───────────────────────────────────────────────────────
create type gama_t      as enum ('cuvinte', 'semne', 'pauze');
create type wine_type_t as enum ('alb', 'rosu', 'rose');
create type sweetness_t as enum ('sec', 'demisec', 'dulce');
create type bottle_color_t as enum ('white', 'red', 'rose');

create type address_kind_t as enum ('shipping', 'billing');
create type bill_type_t    as enum ('fizica', 'juridica');

create type ship_method_t   as enum ('curier', 'ridicare');
create type pay_method_t    as enum ('card-online', 'card-livrare', 'ramburs');
create type order_status_t  as enum (
  'pending_payment', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'
);
create type pay_status_t    as enum (
  'pending', 'succeeded', 'failed', 'refunded', 'partial_refund'
);

-- ─── Catalog ─────────────────────────────────────────────────────
create table products (
  id            uuid primary key default uuid_generate_v4(),
  code          varchar(8)  not null unique,             -- LC01, LS04, ...
  slug          varchar(80) not null unique,             -- feteasca-regala-cuvinte
  name          varchar(120) not null,
  gama          gama_t not null,
  type          wine_type_t not null,
  sweetness     sweetness_t not null,
  abv           numeric(4,1) not null check (abv >= 0 and abv <= 30),
  price_cents   integer not null check (price_cents >= 0),
  bottle_color  bottle_color_t not null,
  serving_temp  varchar(40),
  notes         text,
  short         text,
  taste         text,
  pair          text,
  glass         varchar(80),
  decant        varchar(80),
  age_note      varchar(80),
  grape         varchar(120),
  year          smallint,
  stock         integer not null default 0 check (stock >= 0),
  active        boolean not null default true,
  hero_image    varchar(255),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index products_active_gama_idx on products (active, gama);
create index products_slug_idx on products (slug);

create table product_images (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references products(id) on delete cascade,
  url         varchar(255) not null,
  alt         varchar(255),
  sort_order  smallint not null default 0
);

create table variants (
  id           uuid primary key default uuid_generate_v4(),
  product_id   uuid not null references products(id) on delete cascade,
  size_ml      integer not null check (size_ml > 0),
  price_cents  integer not null check (price_cents >= 0)
);

-- ─── Customers + addresses ──────────────────────────────────────
create table customers (
  id                uuid primary key default uuid_generate_v4(),
  supabase_user_id  uuid unique,                         -- null for guest checkouts
  email             varchar(255) not null,
  name              varchar(255),
  phone             varchar(40),
  marketing_opt_in  boolean not null default false,
  created_at        timestamptz not null default now()
);
create index customers_email_idx on customers (lower(email));

create table addresses (
  id           uuid primary key default uuid_generate_v4(),
  customer_id  uuid not null references customers(id) on delete cascade,
  kind         address_kind_t not null,
  line1        varchar(255) not null,
  line2        varchar(255),
  city         varchar(120) not null,
  county       varchar(120) not null,
  zip          varchar(20),
  country      varchar(40) not null default 'România',
  is_default   boolean not null default false
);

create table billing_profiles (
  id           uuid primary key default uuid_generate_v4(),
  customer_id  uuid not null references customers(id) on delete cascade,
  type         bill_type_t not null,
  -- juridica fields
  company      varchar(255),
  cui          varchar(40),
  reg_no       varchar(40),
  iban         varchar(40),
  hq_address   varchar(500),
  -- fizica fields
  cnp          varchar(40)                                -- only stored if user explicitly requests
);

-- ─── Orders ──────────────────────────────────────────────────────
create table orders (
  id                    uuid primary key default uuid_generate_v4(),
  order_number          varchar(20) not null unique,
  customer_id           uuid references customers(id) on delete set null,
  guest_email           varchar(255),
  status                order_status_t not null default 'pending_payment',
  shipping_method       ship_method_t not null,
  shipping_address      jsonb,                              -- snapshot at order time
  billing               jsonb,                              -- snapshot at order time
  subtotal_cents        integer not null check (subtotal_cents >= 0),
  shipping_cents        integer not null default 0 check (shipping_cents >= 0),
  discount_cents        integer not null default 0 check (discount_cents >= 0),
  total_cents           integer not null check (total_cents >= 0),
  payment_method        pay_method_t not null,
  payment_status        pay_status_t not null default 'pending',
  stripe_session_id     varchar(255) unique,
  stripe_payment_intent varchar(255) unique,
  awb_number            varchar(40),
  smartbill_invoice_id  varchar(60),
  notes                 text,
  created_at            timestamptz not null default now(),
  paid_at               timestamptz,
  shipped_at            timestamptz,
  delivered_at          timestamptz
);
create index orders_status_idx on orders (status, created_at desc);
create index orders_customer_idx on orders (customer_id, created_at desc);

create table order_items (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid not null references orders(id) on delete cascade,
  product_id      uuid not null references products(id) on delete restrict,
  name_snapshot   varchar(255) not null,
  code_snapshot   varchar(8) not null,
  qty             integer not null check (qty > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0)
);

create table order_events (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references orders(id) on delete cascade,
  type        varchar(60) not null,
  payload     jsonb,
  created_at  timestamptz not null default now()
);

-- ─── Discounts ──────────────────────────────────────────────────
create table coupons (
  id                uuid primary key default uuid_generate_v4(),
  code              varchar(40) not null unique,
  percent_off       smallint check (percent_off > 0 and percent_off <= 100),
  fixed_off_cents   integer check (fixed_off_cents > 0),
  min_amount_cents  integer not null default 0,
  expires_at        timestamptz,
  max_uses          integer,
  used_count        integer not null default 0,
  active            boolean not null default true,
  created_at        timestamptz not null default now(),
  check (percent_off is not null or fixed_off_cents is not null)
);

-- ─── Ops ────────────────────────────────────────────────────────
-- Webhook idempotency: insert event_id on first delivery; future
-- duplicates fail unique violation and we noop gracefully.
create table processed_events (
  event_id      varchar(255) primary key,
  source        varchar(40) not null,                  -- 'stripe', 'sameday', etc
  processed_at  timestamptz not null default now()
);

create table audit_log (
  id          uuid primary key default uuid_generate_v4(),
  actor       varchar(255),                            -- user id or 'system'
  action      varchar(80) not null,
  entity      varchar(60) not null,
  entity_id   uuid,
  before      jsonb,
  after       jsonb,
  at          timestamptz not null default now()
);

create table newsletter_subs (
  id              uuid primary key default uuid_generate_v4(),
  email           varchar(255) not null unique,
  consent_at      timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create table age_verifications (
  id           uuid primary key default uuid_generate_v4(),
  ip           inet,
  user_agent   varchar(500),
  verified_at  timestamptz not null default now()
);

-- ─── Triggers ────────────────────────────────────────────────────
-- Keep products.updated_at fresh on every UPDATE.
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger products_updated_at
  before update on products
  for each row execute function set_updated_at();

-- ─── Row Level Security ──────────────────────────────────────────
-- Strategy: catalog (products, product_images, variants) is publicly
-- readable when active. Everything customer-related is locked to the
-- owning customer. Orders use the supabase_user_id link.
-- Backend code that needs to bypass these uses the SERVICE_ROLE key
-- (lib/supabase/admin.ts) — webhooks, cron, admin actions.

alter table products       enable row level security;
alter table product_images enable row level security;
alter table variants       enable row level security;
alter table customers      enable row level security;
alter table addresses      enable row level security;
alter table billing_profiles enable row level security;
alter table orders         enable row level security;
alter table order_items    enable row level security;
alter table order_events   enable row level security;
alter table coupons        enable row level security;
alter table newsletter_subs enable row level security;
alter table age_verifications enable row level security;
alter table audit_log      enable row level security;
alter table processed_events enable row level security;

-- Public read for active catalog
create policy products_public_read on products
  for select using (active = true);
create policy product_images_public_read on product_images
  for select using (
    exists (select 1 from products p where p.id = product_id and p.active = true)
  );
create policy variants_public_read on variants
  for select using (
    exists (select 1 from products p where p.id = product_id and p.active = true)
  );

-- Customer self-service
create policy customers_self_select on customers
  for select using (supabase_user_id = auth.uid());
create policy customers_self_update on customers
  for update using (supabase_user_id = auth.uid());

create policy addresses_self_all on addresses
  for all using (
    exists (
      select 1 from customers c
      where c.id = customer_id and c.supabase_user_id = auth.uid()
    )
  );

create policy billing_profiles_self_all on billing_profiles
  for all using (
    exists (
      select 1 from customers c
      where c.id = customer_id and c.supabase_user_id = auth.uid()
    )
  );

create policy orders_self_select on orders
  for select using (
    customer_id is not null and exists (
      select 1 from customers c
      where c.id = customer_id and c.supabase_user_id = auth.uid()
    )
  );

create policy order_items_self_select on order_items
  for select using (
    exists (
      select 1 from orders o
      join customers c on c.id = o.customer_id
      where o.id = order_id and c.supabase_user_id = auth.uid()
    )
  );

-- Newsletter: anyone authenticated can insert their own email; reads
-- are admin-only (via service role).
create policy newsletter_anyone_insert on newsletter_subs
  for insert with check (true);

-- All other tables (audit_log, processed_events, age_verifications,
-- order_events, coupons) have RLS enabled with NO public policies →
-- only the SERVICE_ROLE can touch them. That's by design.
