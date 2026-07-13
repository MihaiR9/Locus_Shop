-- Admin policies + decrement stoc atomic.
--
-- Efecte:
-- 1. Un user cu `raw_app_meta_data.role = 'admin'` are drept SELECT/INSERT/UPDATE/DELETE
--    pe TOATE tabelele publice (orders, customers, products etc.).
-- 2. Funcție `decrement_stock_for_order(order_id)` — apelată din webhook Stripe
--    la payment_succeeded, cu SELECT FOR UPDATE ca să evite race conditions.
-- 3. Funcție reverse `restore_stock_for_order(order_id)` — apelată la refund
--    pentru a repune stocul la loc.
--
-- Toate policies noi sunt "for all" cu `is_admin()` — nu conflictă cu policies
-- existente (user-only) care rămân active pentru non-admin.

-- ─── Helper: is_admin() ───────────────────────────────────────────
create or replace function public.is_admin() returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

comment on function public.is_admin() is
  'Returnează true dacă JWT-ul curent are app_metadata.role = "admin". Folosit în RLS policies pentru admin dashboard.';

-- ─── Policies admin: toate tabelele publice ───────────────────────
create policy products_admin_all on products
  for all using (public.is_admin()) with check (public.is_admin());

create policy product_images_admin_all on product_images
  for all using (public.is_admin()) with check (public.is_admin());

create policy variants_admin_all on variants
  for all using (public.is_admin()) with check (public.is_admin());

create policy customers_admin_all on customers
  for all using (public.is_admin()) with check (public.is_admin());

create policy addresses_admin_all on addresses
  for all using (public.is_admin()) with check (public.is_admin());

create policy billing_profiles_admin_all on billing_profiles
  for all using (public.is_admin()) with check (public.is_admin());

create policy orders_admin_all on orders
  for all using (public.is_admin()) with check (public.is_admin());

create policy order_items_admin_all on order_items
  for all using (public.is_admin()) with check (public.is_admin());

create policy order_events_admin_all on order_events
  for all using (public.is_admin()) with check (public.is_admin());

create policy coupons_admin_all on coupons
  for all using (public.is_admin()) with check (public.is_admin());

create policy newsletter_admin_read on newsletter_subs
  for select using (public.is_admin());

create policy audit_log_admin_read on audit_log
  for select using (public.is_admin());

create policy age_verifications_admin_read on age_verifications
  for select using (public.is_admin());

-- Returns (schema din 0006_returns.sql)
create policy returns_admin_all on returns
  for all using (public.is_admin()) with check (public.is_admin());

create policy return_items_admin_all on return_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── Decrement stoc atomic ────────────────────────────────────────
-- Apelat din webhook Stripe la payment_succeeded.
-- SELECT ... FOR UPDATE serializează 2 checkout-uri concurente pe același SKU.
create or replace function public.decrement_stock_for_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
begin
  -- Locks pe products lines în ordine deterministă (evită deadlock cu alți writers)
  for item in
    select oi.code_snapshot as code, oi.qty
    from order_items oi
    where oi.order_id = p_order_id
    order by oi.code_snapshot
  loop
    perform 1 from products where code = item.code for update;
    update products
      set stock = greatest(0, stock - item.qty),
          updated_at = now()
      where code = item.code;
  end loop;
end;
$$;

comment on function public.decrement_stock_for_order(uuid) is
  'Scade stocul pe cod pentru toate item-urile unei comenzi. Idempotent NU e — apelezi doar din webhook cu idempotency prin processed_events.';

-- Reverse la refund
create or replace function public.restore_stock_for_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
begin
  for item in
    select oi.code_snapshot as code, oi.qty
    from order_items oi
    where oi.order_id = p_order_id
    order by oi.code_snapshot
  loop
    perform 1 from products where code = item.code for update;
    update products
      set stock = stock + item.qty,
          updated_at = now()
      where code = item.code;
  end loop;
end;
$$;

comment on function public.restore_stock_for_order(uuid) is
  'Repune stocul la loc după refund complet. Apelat din webhook charge.refunded.';

-- Grants: doar service_role și authenticated pot apela (nu anon).
grant execute on function public.decrement_stock_for_order(uuid) to service_role;
grant execute on function public.restore_stock_for_order(uuid) to service_role;
