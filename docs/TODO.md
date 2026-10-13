# De făcut — ce urmează (actualizat 13 oct 2026)

Lista lucrurilor rămase deschise la sfârșitul sesiunii din 13 oct. Mod de lucru agreat cu Mihai: un punct pe rând, commit + push doar după confirmarea lui. Auditul SEO e în `docs/SEO_AUDIT.md`, tracking-ul în `docs/ANALYTICS.md`.

---

## 1. Meta (următorul pas, început pe 13 oct)

Starea: feed-ul `https://www.domeniul-locus.ro/api/feed/meta.xml` e live și corect (5 vinuri, imagini pe alb, preț, stoc). Pixelul Meta **nu e instalat** (nici pe site, nici în GTM). Conversions API există în cod (`lib/meta/capi.ts`, trimisă din webhook-ul Stripe) dar e **inactivă** — lipsesc cheile.

Întrebări deschise pentru Mihai:
- Are acces la un cont **Meta Business** al firmei? (în iulie nu avea — pașii pentru creare sunt mai jos)
- Omul de marketing se ocupă și de Meta? Cum vrea datele: **doar pixel prin GTM** sau **pixel + Conversions API**? La GA4 a cerut doar browser (vezi 2) — de întrebat înainte, nu de presupus.

Pașii, în ordine:
1. Dacă nu există cont: Pagină de Facebook → Business Manager (business.facebook.com) → 2FA → verificarea firmei (SC ROMVINTEC SRL) → cont de reclame cu **România / RON / Europe/Bucharest** (nu se mai pot schimba).
2. **Catalog**: Commerce Manager → Create catalog → E-commerce → Upload product info → Data sources → Data feed → URL `.../api/feed/meta.xml`, zilnic, RON. Trebuie să apară 5 produse.
3. **Pixel**: Events Manager → dataset nou → Mihai dă ID-ul (15–16 cifre). Claude pregătește un fișier de import GTM (ca `docs/gtm/ga4-import.json`) care mapează evenimentele existente din dataLayer: `view_item`→ViewContent, `add_to_cart`→AddToCart, `begin_checkout`→InitiateCheckout, `purchase`→Purchase, cu `content_ids` = codurile vinurilor (LC01…, aceleași ca în feed) și `event_id` = `{{DLV - event_id}}` (numărul comenzii) pentru deduplicare cu CAPI. Tag-urile Meta trebuie condiționate de consimțământul de marketing.
4. **Conversions API** (doar dacă marketingul vrea): `META_PIXEL_ID` + `META_CAPI_ACCESS_TOKEN` pe Vercel. Deduplicarea pixel + CAPI prin `event_id` e documentată oficial de Meta.
5. Legare pixel ↔ catalog în Commerce Manager (pentru reclame dinamice / retargeting).
6. Reclamele la alcool: țintire **18+** în Ads Manager; fără mesaje despre sănătate / succes social.
7. Opțional: în feed-ul Meta, `google_product_category` și `shipping` (ca în cel Google) — `lib/feed/products.ts`, `buildMetaFeed`.

## 2. Analiza pe server — pentru mai târziu

Decizia din 13 oct (omul de marketing Google): **tracking-ul rămâne doar în browser, prin GTM.** El zice că serverul e util, dar nu acum.

Ce există deja și cum se pornește:
- `lib/analytics/ga4-server.ts` trimite `purchase` (din webhook-ul Stripe și la plata cu cardul la livrare) și `refund` (rambursare completă / anularea unei comenzi cu plata la livrare) prin GA4 Measurement Protocol. Migrarea `0022` (ga_client_id, ga_session_id, coupon_code) e rulată.
- E **oprit** prin lipsa `GA4_API_SECRET` pe Vercel (a fost șters pe 13 oct). `GA4_MEASUREMENT_ID` a rămas.
- Pornire: se pune `GA4_API_SECRET` înapoi pe Vercel + Redeploy — **doar cu acordul marketingului**. Înainte, de verificat pe o comandă de test că GA4 păstrează un singur `purchase` per `transaction_id` (tag + server).
- Variantă intermediară sigură: doar `refund` din server (tag-ul nu-l trimite niciodată, deci nu se poate dubla). Acum rambursările și coletele refuzate **nu se scad** din GA4.
- Alternativa „mare”: **GTM Server-Side container** (Stape / Google Cloud, ~10–50 €/lună, subdomeniu gen `data.domeniul-locus.ro`) — rezistă la ad-blockere și păstrează cookie-urile mai mult. Decizie de cost + a marketingului.

## 3. De verificat la primele comenzi reale

- Prima comandă plătită după 13 oct: în GA4 apare **o singură dată**, cu `value` = vinurile fără transport și SGR; în admin, istoricul comenzii.
- **Reminderul de plată** (livrat 8 oct, netestat în producție): la prima comandă neplătită, după 3 ore, în admin trebuie „Reminder de plată trimis clientului” + mailul „Plată neefectuată” la office@.
- Cele 8 evenimente GA4 (toate legate pe 13 oct): marketingul le poate vedea în GTM → Preview sau GA4 → DebugView.

## 4. De transmis omului de marketing

- `value` din `purchase` **nu mai include transportul și SGR-ul** (din 13 oct) — veniturile / ROAS par mai mici decât înainte. Dacă vrea totalul plătit, se schimbă în `lib/analytics/purchase.ts`.
- Plata cu cardul la livrare se numără la plasarea comenzii.
- Acum se trimit toate 8 evenimentele: view_item, add_to_cart, remove_from_cart, view_cart, begin_checkout, add_shipping_info, add_payment_info, purchase. Produsele au brand, gamă (`item_category`), tip (`item_category2`), an (`item_variant`). Harta e în `docs/ANALYTICS.md`.

## 5. În conturi (Mihai)

- **Search Console**: retrimite `sitemap.xml` și „Solicită indexarea” pentru /contact, /shop și cele 5 vinuri.
- **Merchant Center** (ID 5871567489): la Products → „Provided by you” = 5 aprobate; sursa „Found by Google” oprită.
- **Bing Webmaster Tools** (opțional): import din Search Console.
- **GEO în afara site-ului**: Google Business Profile (textele sunt în `docs/GOOGLE_BUSINESS_PROFILE.md`), recenzii (Google, Vivino), mențiuni externe, nume / adresă / telefon identice peste tot.

## 6. De întrebat la jurist

- Seturile de pe home (3 sticle) n-au preț pe litru — e obligatoriu și pentru ele?
- Retur parțial (doar unele sticle): se datorează și transportul inițial?

## Mici, fără grabă

- `pauze` și `urme` sunt „în curând” pe home; `/parteneri`, `/pauze`, `/social` sunt ascunse din Google (`lib/seo/hidden-pages.ts`) până sunt gata.
- Pentru „urme” există o variantă de text păstrată: „Ce ține minte locul. O gamă în lansare — vinuri care poartă urma unui an anume, așa cum a fost, fără să-l repete.”
- Imaginea de partajare (`app/opengraph-image.tsx`) e acum poza cu dealurile; Mihai poate vrea alta.
