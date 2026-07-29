-- 0015 — Securitate: oprește listarea bucket-ului `media`
--
-- PROBLEMA (Security Advisor, „Public Bucket Allows Listing"): politica
-- `media_public_read` din 0009 e `for select using (bucket_id = 'media')`,
-- fără nicio restricție. Oricine cu cheia anon putea enumera toate
-- fișierele din bucket — inclusiv poze urcate dar nepublicate încă
-- (etichete în lucru, recolte neanunțate, materiale de campanie).
--
-- DE CE E SIGUR SĂ O ÎNLOCUIM: bucket-ul e creat cu `public = true`
-- (0009, linia 68). Fișierele dintr-un bucket public se servesc pe
-- `/storage/v1/object/public/media/...`, cale care NU trece prin RLS.
-- Politica de SELECT guvernează doar API-ul de listare și descărcare
-- autentificată.
--
-- Verificat în cod: singurul consumator al bucket-ului e
-- `lib/admin/storage.ts`, care face `upload` (acoperit de
-- `media_admin_insert`) și `getPublicUrl` — o simplă construcție de
-- string, fără apel la server. Nimic din aplicație nu listează bucket-ul,
-- iar pagina `/admin/fisiere` e încă un schelet fără conținut.
--
-- Deci imaginile continuă să se încarce exact ca înainte.

drop policy if exists media_public_read on storage.objects;

-- Listarea rămâne disponibilă adminului, pentru viitorul manager de
-- fișiere din panou. Fără ea, o pagină care enumeră bucket-ul ar primi
-- o listă goală, fără eroare — genul de bug greu de diagnosticat.
drop policy if exists media_admin_read on storage.objects;
create policy media_admin_read on storage.objects
  for select using (bucket_id = 'media' and public.is_admin());
