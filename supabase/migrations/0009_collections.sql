-- Collections (game și colecții custom) + M2M cu products + Storage bucket
-- pentru upload imagini din admin.
-- Idempotent — safe de rulat de mai multe ori.

-- ─── Tabele ──────────────────────────────────────────────────────
create table if not exists collections (
  id           uuid primary key default uuid_generate_v4(),
  slug         varchar(80) unique not null,
  name         varchar(120) not null,
  description  text,
  hero_image   varchar(500),
  active       boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists collection_products (
  collection_id  uuid not null references collections(id) on delete cascade,
  product_id     uuid not null references products(id) on delete cascade,
  sort_order     integer not null default 0,
  primary key (collection_id, product_id)
);

create index if not exists collection_products_product_idx on collection_products (product_id);

-- ─── Seed cu game existente ──────────────────────────────────────
insert into collections (slug, name, description, sort_order) values
  ('cuvinte', 'Cuvinte',
   'Gama de bază. Loturi mici, atenție la fiecare sticlă. Fetească Regală, Fetească Neagră și Riesling Italian.', 1),
  ('semne',   'Semne',
   'Gama premium. Selecție de parcelă, potențial de învechire, texturi mai ample.', 2),
  ('pauze',   'Pauze',
   'Rezerve și ediții limitate. Momentan în pregătire.', 3)
on conflict (slug) do nothing;

-- Populate M2M idempotent
insert into collection_products (collection_id, product_id, sort_order)
select c.id, p.id,
       row_number() over (partition by c.id order by p.code)
from collections c
join products p on p.gama::text = c.slug
on conflict (collection_id, product_id) do nothing;

-- ─── RLS ─────────────────────────────────────────────────────────
alter table collections enable row level security;
alter table collection_products enable row level security;

drop policy if exists collections_public_read on collections;
create policy collections_public_read on collections
  for select using (active = true);

drop policy if exists collections_admin_all on collections;
create policy collections_admin_all on collections
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists collection_products_public_read on collection_products;
create policy collection_products_public_read on collection_products
  for select using (
    exists (select 1 from collections c where c.id = collection_id and c.active = true)
  );

drop policy if exists collection_products_admin_all on collection_products;
create policy collection_products_admin_all on collection_products
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── Storage bucket pentru media (imagini colecții + produse) ────
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists media_admin_insert on storage.objects;
create policy media_admin_insert on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());

drop policy if exists media_admin_update on storage.objects;
create policy media_admin_update on storage.objects
  for update using (bucket_id = 'media' and public.is_admin());

drop policy if exists media_admin_delete on storage.objects;
create policy media_admin_delete on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());

-- ─── Trigger updated_at ──────────────────────────────────────────
create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists collections_updated_at on collections;
create trigger collections_updated_at
  before update on collections
  for each row execute function update_updated_at_column();
