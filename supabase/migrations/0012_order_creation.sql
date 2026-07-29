-- 0012 — Recuperare: crearea comenzii (numerotare + idempotență)
--
-- CONTEXT: aceste obiecte existau în baza de date de producție, dar nu au
-- ajuns niciodată într-o migrare — au fost create direct în SQL Editor.
-- Consecința: repo-ul nu putea reconstrui baza, iar un proiect refăcut de la
-- zero ar fi avut checkout-ul rupt (`create_order` lipsă).
-- Extrase din DB pe 29 iul 2026 cu `pg_get_functiondef`.
--
-- Migrarea e scrisă idempotent (`if not exists` / `create or replace`), deci
-- rularea pe baza existentă nu schimbă nimic — doar aliniază repo-ul.

-- ─── Contor de comenzi, pe an fiscal ─────────────────────────────────
-- Un rând per an. `create_order` îl incrementează atomic cu
-- `on conflict (year) do update`, ceea ce ține un lock pe rând pe durata
-- statement-ului → două tranzacții concurente primesc secvențe distincte.
create table if not exists order_counters (
  year      smallint primary key,
  last_seq  integer not null default 0
);

alter table order_counters enable row level security;

-- Fără politici: se accesează exclusiv din `create_order`, care e
-- SECURITY DEFINER. Nicio cheie publică nu trebuie să-l atingă.

-- ─── Cheia de idempotență pe comandă ─────────────────────────────────
-- Trimisă de client la checkout. Dacă utilizatorul dă F5 sau rețeaua
-- reîncearcă request-ul, `create_order` găsește comanda existentă și o
-- returnează în loc să creeze un duplicat.
alter table orders
  add column if not exists idempotency_key varchar;

-- Indexul unic e ce face verificarea sigură la concurență. Fără el, două
-- request-uri simultane cu aceeași cheie ar trece amândouă de `select`
-- și ar crea două comenzi.
create unique index if not exists orders_idempotency_key_uniq
  on orders (idempotency_key)
  where idempotency_key is not null;

-- ─── create_order ────────────────────────────────────────────────────
-- Creează comanda și liniile ei într-o singură tranzacție atomică.
-- Prețurile vin din tabela `products`, NU din coșul trimis de client —
-- altfel oricine ar putea cumpăra la preț ales de el.
create or replace function public.create_order(
  p_idempotency_key character varying,
  p_items jsonb,
  p_shipping jsonb,
  p_billing jsonb,
  p_payment_method pay_method_t,
  p_shipping_method ship_method_t,
  p_subtotal_cents integer,
  p_shipping_cents integer,
  p_discount_cents integer,
  p_total_cents integer,
  p_guest_email character varying,
  p_customer_id uuid
)
returns table(id uuid, order_number character varying)
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_existing      orders%rowtype;
  v_new_id        uuid;
  v_order_number  varchar;
  v_year          smallint;
  v_seq           integer;
begin
  -- Idempotency short-circuit
  select * into v_existing from orders where idempotency_key = p_idempotency_key;
  if found then
    return query select v_existing.id, v_existing.order_number;
    return;
  end if;

  -- Atomic counter increment for the current fiscal year. The single
  -- statement holds a row-level lock on the counters row for the
  -- duration, so two concurrent transactions get distinct sequences.
  v_year := extract(year from now())::smallint;
  insert into order_counters (year, last_seq)
    values (v_year, 1)
    on conflict (year) do update
      set last_seq = order_counters.last_seq + 1
    returning last_seq into v_seq;

  v_order_number := 'LOC-' || v_year::text || '-' || lpad(v_seq::text, 5, '0');

  -- Insert orders row
  insert into orders (
    order_number, customer_id, guest_email, status,
    shipping_method, shipping_address, billing,
    subtotal_cents, shipping_cents, discount_cents, total_cents,
    payment_method, payment_status, idempotency_key
  ) values (
    v_order_number, p_customer_id, p_guest_email, 'pending_payment',
    p_shipping_method, p_shipping, p_billing,
    p_subtotal_cents, p_shipping_cents, p_discount_cents, p_total_cents,
    p_payment_method, 'pending', p_idempotency_key
  )
  returning orders.id into v_new_id;

  -- Insert order_items by joining products on code (DB price is source
  -- of truth; client-supplied prices in the cart snapshot are not trusted).
  insert into order_items (order_id, product_id, name_snapshot, code_snapshot, qty, unit_price_cents)
  select v_new_id, p.id, p.name, p.code, (i->>'qty')::int, p.price_cents
  from jsonb_array_elements(p_items) as i
  join products p on p.code = i->>'code'
  where p.active = true;

  -- Audit trail
  insert into order_events (order_id, type, payload)
  values (
    v_new_id,
    'order_created',
    jsonb_build_object('idempotency_key', p_idempotency_key)
  );

  return query select v_new_id, v_order_number;
end $function$;

-- Apelată exclusiv din server actions cu service role
-- (app/(storefront)/checkout/actions.ts). Vezi 0013 pentru revocări.
grant execute on function public.create_order(
  character varying, jsonb, jsonb, jsonb, pay_method_t, ship_method_t,
  integer, integer, integer, integer, character varying, uuid
) to service_role;
