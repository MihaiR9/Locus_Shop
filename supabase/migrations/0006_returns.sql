-- Returns table — tickets initiated by customers under OUG 34/2014.
-- Each ticket belongs to one order and carries one product reason +
-- resolution. Multi-item returns within the same ticket use return_items.

create type return_status as enum (
  'pending', 'approved', 'in_transit', 'completed', 'rejected'
);
create type return_product_state as enum (
  'sigilat', 'deteriorat', 'neconform'
);
create type return_resolution as enum (
  'rambursare', 'inlocuire', 'voucher'
);

create table returns (
  id              uuid primary key default gen_random_uuid(),
  return_number   varchar(40) not null unique,
  customer_id     uuid not null references customers(id) on delete cascade,
  order_id        uuid not null references orders(id) on delete restrict,
  status          return_status not null default 'pending',
  product_state   return_product_state not null,
  resolution      return_resolution not null,
  reason          text,
  iban            varchar(40),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index returns_customer_idx on returns (customer_id, created_at desc);
create index returns_order_idx on returns (order_id);

create table return_items (
  id              uuid primary key default gen_random_uuid(),
  return_id       uuid not null references returns(id) on delete cascade,
  order_item_id   uuid not null references order_items(id) on delete restrict,
  product_code    varchar(20) not null,
  product_name    varchar(120) not null,
  qty             integer not null check (qty > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0)
);
create index return_items_return_idx on return_items (return_id);

create trigger returns_updated_at
  before update on returns
  for each row execute function set_updated_at();

alter table returns enable row level security;
alter table return_items enable row level security;

create policy returns_self_select on returns
  for select using (
    exists (
      select 1 from customers c
      where c.id = customer_id and c.supabase_user_id = auth.uid()
    )
  );

create policy returns_self_insert on returns
  for insert with check (
    exists (
      select 1 from customers c
      where c.id = customer_id and c.supabase_user_id = auth.uid()
    )
  );

create policy return_items_self_select on return_items
  for select using (
    exists (
      select 1 from returns r
      join customers c on c.id = r.customer_id
      where r.id = return_id and c.supabase_user_id = auth.uid()
    )
  );

create policy return_items_self_insert on return_items
  for insert with check (
    exists (
      select 1 from returns r
      join customers c on c.id = r.customer_id
      where r.id = return_id and c.supabase_user_id = auth.uid()
    )
  );

-- Per-year sequential numbering: RET-YYYY-NNN
create table return_counters (
  year      integer primary key,
  seq       integer not null default 0
);

create or replace function next_return_number(p_year integer)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seq integer;
begin
  insert into return_counters (year, seq)
    values (p_year, 1)
    on conflict (year) do update
      set seq = return_counters.seq + 1
    returning seq into v_seq;
  return 'RET-' || p_year::text || '-' || lpad(v_seq::text, 3, '0');
end;
$$;

revoke all on function next_return_number(integer) from public, anon, authenticated;
grant execute on function next_return_number(integer) to service_role;
