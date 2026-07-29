-- 0014 — Date de atribuire pentru Meta Conversions API
--
-- CAPI trimite conversiile din server, nu din browser, ca să nu le pierdem
-- pe ad-blockere și pe iOS. Ca Meta să poată lega conversia de persoana
-- care a văzut reclama, evenimentul are nevoie de semnale de potrivire:
-- cookie-urile `_fbp` / `_fbc` puse de pixel, plus IP-ul și user-agent-ul.
--
-- Cookie-urile sunt disponibile în browser la checkout, dar evenimentul se
-- trimite din webhook-ul Stripe, care rulează mai târziu și fără browser.
-- De aceea le salvăm pe comandă în momentul creării ei.
--
-- GDPR: câmpurile astea se populează DOAR dacă utilizatorul a acceptat
-- categoria „marketing" în cookie banner. Fără consimțământ rămân null și
-- nu se trimite niciun eveniment CAPI. `marketing_consent` păstrează
-- decizia luată în momentul comenzii, ca să fie auditabilă ulterior.

alter table orders
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists fbp varchar,
  add column if not exists fbc varchar,
  add column if not exists client_ip varchar,
  add column if not exists client_user_agent text;

comment on column orders.marketing_consent is
  'Consimțământ marketing la momentul comenzii. Poartă pentru trimiterea evenimentului Meta CAPI.';
comment on column orders.fbp is
  'Cookie _fbp (Facebook browser id). Null fără consimțământ marketing.';
comment on column orders.fbc is
  'Cookie _fbc (Facebook click id, derivat din fbclid). Null fără consimțământ marketing.';
comment on column orders.client_ip is
  'IP-ul clientului la plasarea comenzii. Doar pentru potrivirea CAPI. Null fără consimțământ.';
comment on column orders.client_user_agent is
  'User-agent la plasarea comenzii. Doar pentru potrivirea CAPI. Null fără consimțământ.';

-- Nu adăugăm politici RLS: `orders` are deja `orders_admin_all` și
-- `orders_self_select`. Coloanele noi sunt vizibile clientului doar pe
-- propria comandă, iar storefront-ul nu le selectează niciodată.
