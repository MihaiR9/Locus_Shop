-- 0013 — Securitate: închide execuția funcțiilor SECURITY DEFINER
--
-- PROBLEMA: în Postgres, `EXECUTE` pe o funcție nouă e acordat implicit
-- rolului PUBLIC. Migrarea 0008 a făcut doar `grant ... to service_role`,
-- fără `revoke`, deci grant-ul n-a închis nimic — funcțiile au rămas
-- apelabile cu cheia anon, care e publică în bundle-ul din browser.
--
-- Verificat pe 29 iul 2026 în producție:
--   next_return_number        → postgres, service_role                    ✓ (0006 face revoke)
--   decrement_stock_for_order → PUBLIC, anon, authenticated, service_role ✗
--   restore_stock_for_order   → PUBLIC, anon, authenticated, service_role ✗
--   create_order              → anon, authenticated, service_role         ✗
--
-- IMPACT: `decrement_stock_for_order` și `restore_stock_for_order` modifică
-- stocul. Cu un id de comandă valid, oricine putea să-l scadă sau să-l umfle.
--
-- Toate trei sunt apelate exclusiv cu service role din server-side
-- (checkout/actions.ts, api/stripe/webhook/route.ts), deci revocarea nu
-- afectează nimic din aplicație. Modelul e cel din 0006: revoke, apoi grant.

-- ─── Funcții de business ─────────────────────────────────────────────
revoke all on function public.create_order(
  character varying, jsonb, jsonb, jsonb, pay_method_t, ship_method_t,
  integer, integer, integer, integer, character varying, uuid
) from public, anon, authenticated;

revoke all on function public.decrement_stock_for_order(uuid)
  from public, anon, authenticated;

revoke all on function public.restore_stock_for_order(uuid)
  from public, anon, authenticated;

grant execute on function public.create_order(
  character varying, jsonb, jsonb, jsonb, pay_method_t, ship_method_t,
  integer, integer, integer, integer, character varying, uuid
) to service_role;

grant execute on function public.decrement_stock_for_order(uuid) to service_role;
grant execute on function public.restore_stock_for_order(uuid) to service_role;

-- ─── Funcții de trigger ──────────────────────────────────────────────
-- Nu au de ce să fie apelabile direct. Triggerele existente nu sunt
-- afectate: Postgres verifică dreptul de EXECUTE la CREATE TRIGGER,
-- nu la fiecare declanșare.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.update_updated_at_column() from public, anon, authenticated;

-- ─── is_admin() rămâne INTENȚIONAT executabilă ───────────────────────
-- Advisor-ul o raportează, dar aici e fals pozitiv: funcția e folosită în
-- interiorul politicilor RLS, iar Postgres evaluează expresiile politicilor
-- cu drepturile rolului care interoghează. O revocare ar bloca accesul la
-- date pentru toți utilizatorii. Funcția doar citește rolul din propriul
-- JWT al apelantului — nu expune nimic.

-- ─── search_path fix ─────────────────────────────────────────────────
-- Fără `set search_path`, funcția rezolvă numele după search_path-ul
-- apelantului, ceea ce permite deturnarea prin obiecte cu același nume
-- într-o schemă controlată de atacator.
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

revoke all on function public.update_updated_at_column() from public, anon, authenticated;

-- ─── Newsletter: politică inutilă și abuzabilă ───────────────────────
-- `for insert with check (true)` permitea oricui cu cheia anon să insereze
-- adrese arbitrare. Nu e o scurgere de date (citirea e doar pentru admin),
-- dar e o poartă de spam pe lista de abonați.
--
-- Politica nu e folosită: înscrierea trece printr-un server action cu
-- service role (app/actions/newsletter.ts), care ocolește RLS.
drop policy if exists newsletter_anyone_insert on newsletter_subs;

-- ─── RĂMÂNE DE FĂCUT (deliberat neatins aici) ────────────────────────
-- Bucket-ul `media` permite listarea tuturor fișierelor: politica
-- `media_public_read` din 0009 e `for select using (bucket_id = 'media')`.
-- Nu o schimb acum pentru că e singura politică de SELECT pe bucket, deci
-- managerul de fișiere din admin depinde de ea — nu există `media_admin_read`.
-- Fixul corect e o politică de select doar pentru admin, plus verificarea
-- că nimic din storefront nu listează bucket-ul. De făcut separat.
