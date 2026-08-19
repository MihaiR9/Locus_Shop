-- 0021 — Localitate și județ separat pe profilul de facturare juridic
--
-- Până acum sediul social se strângea într-un singur câmp liber
-- (`hq_address`), iar `lib/fgo/build-invoice.ts` completa `Judet` și
-- `Localitate` cu "Bucuresti" hardcodat, fiindcă FGO le cere separat și
-- nu aveam de unde le lua. Orice firmă din altă parte primea factură cu
-- adresa greșită — și, cu e-Factura activă, greșeala pleacă la ANAF.
--
-- Persoana fizică avea deja câmpurile separate în snapshot-ul comenzii;
-- doar ramura juridică era în urmă.
--
-- `hq_address` rămâne strada + numărul. Profilurile existente nu se
-- migrează automat: adresa veche e text liber, iar ghicitul localității
-- din el ar produce facturi la fel de greșite, doar mai greu de observat.
-- Rămân null și se completează la prima editare.

alter table billing_profiles
  add column if not exists hq_city   varchar(80),
  add column if not exists hq_county varchar(80);

comment on column billing_profiles.hq_address is
  'Sediu social — stradă și număr. Localitatea și județul stau separat, FGO le cere pe câmpuri distincte.';
