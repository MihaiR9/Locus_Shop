# Analytics — Google Tag Manager

> **Container GTM:** `GTM-5TNDPL7Z`
> **Instalat prin:** `@next/third-parties` în `app/layout.tsx`
> **Toate tag-urile** (GA4, Meta Pixel, Google Ads) se configurează în UI-ul
> GTM de către marketing. În cod trimit doar evenimente pe `window.dataLayer`
> prin `lib/analytics/gtm.ts` — GTM le rutează unde trebuie.

---

## Harta evenimentelor — unde e legat fiecare

| Eveniment | Când se trimite | Fișierul care apelează | Funcția |
|---|---|---|---|
| `add_to_cart` | Click „Adaugă" pe card (shop, up-sell) | [components/cart/add-to-cart-button.tsx](../components/cart/add-to-cart-button.tsx) | `trackAddToCart` |
| `add_to_cart` | Click „Adaugă în coș" pe PDP | [components/pdp/wine-buy-box.tsx](../components/pdp/wine-buy-box.tsx) | `trackAddToCart` |
| `view_cart` | Deschidere cart drawer | [components/cart/cart-drawer.tsx](../components/cart/cart-drawer.tsx) | `trackViewCart` |
| `begin_checkout` | Aterizare pe `/checkout` | [components/checkout/checkout-tracker.tsx](../components/checkout/checkout-tracker.tsx) | `trackBeginCheckout` |
| `purchase` | `/checkout/success` cu comanda plătită | [components/checkout/purchase-tracker.tsx](../components/checkout/purchase-tracker.tsx) | `trackPurchase` |

**Evenimente adiționale disponibile în lib** (nu sunt legate încă):
- `view_item` — deschidere PDP
- `remove_from_cart` — ștergere din drawer
- `add_shipping_info` — completat pasul livrare
- `add_payment_info` — ales metoda de plată

---

## Când trebuie intervenit

### 🔧 Dacă schimbi cart-store-ul (`lib/cart-store.ts`)

**Ce se poate strica:** structura `CartLine` — dacă renunți la `code`, `name`, `priceRon`, `gama` sau `bottleColor`, evenimentele nu vor mai trimite datele complete.

**Ce trebuie făcut:**
1. Actualizează cast-ul din:
   - `components/cart/add-to-cart-button.tsx` — `handleClick`
   - `components/pdp/wine-buy-box.tsx` — `addToCart`
   - `components/cart/cart-drawer.tsx` — `useEffect` pentru `view_cart`
   - `components/checkout/checkout-tracker.tsx` — `useEffect`
2. Verifică `GtmItem` din `lib/analytics/gtm.ts` — reflectă noua structură.

---

### 🔧 Dacă adaugi o nouă componentă de „adaugă în coș"

Orice buton nou care apelează `useCartStore((s) => s.addItem)` **trebuie** să apeleze și `trackAddToCart` cu produsul respectiv, altfel GA4/Meta vor rata evenimentele.

**Copy-paste snippet:**
```tsx
import { trackAddToCart } from "@/lib/analytics/gtm";

trackAddToCart([{
  item_id: wine.code,
  item_name: wine.name,
  item_category: wine.gama,
  item_variant: wine.bottleColor,
  price: wine.priceRon,
  quantity: 1,
}]);
```

---

### 🔧 Dacă adaugi o pagină `/cos` separată (nu drawer)

Momentan `view_cart` se trimite doar la deschiderea drawer-ului. Dacă implementezi și o pagină `/cos`:

**Adăugare în `app/(storefront)/cos/page.tsx`:**
```tsx
"use client";
import { useEffect } from "react";
import { useCartStore, selectLines } from "@/lib/cart-store";
import { trackViewCart } from "@/lib/analytics/gtm";

// La mount:
useEffect(() => {
  if (lines.length > 0) trackViewCart(lines.map(l => ({...})));
}, []);
```

---

### 🔧 Dacă schimbi flow-ul de checkout (`app/(storefront)/checkout/`)

**Ce se poate strica:** dacă muți `page.tsx` sau schimbi structura pașilor, `CheckoutTracker` s-ar putea să dispară.

**Verifică după refactor:**
- `<CheckoutTracker />` e încă montat pe `page.tsx`
- Se trimite `begin_checkout` la primul mount

**Bonus recomandat** — trimite `add_shipping_info` și `add_payment_info` când user completează pașii 1 și 2:
- `components/checkout/step-shipping.tsx` — la submit success
- `components/checkout/step-payment.tsx` — la selectare metodă

---

### 🔧 Dacă schimbi succes page-ul (`app/(storefront)/checkout/success/page.tsx`)

**Ce se poate strica:**
- `<PurchaseTracker>` are nevoie de `order_number`, `total`, `items`. Dacă schimbi query-ul care aduce comanda → verifică toate câmpurile.
- Coloana `orders.shipping_cents` sau `orders.discount_cents` — dacă se redenumesc, actualizează în `page.tsx` fetch-ul.

**TODO conștient:** Când adaugi coloana `orders.coupon_code` (când wire-uim cupoanele la checkout), scoate `TODO` din `page.tsx` și populeaz-o.

---

### 🔧 Dacă adaugi refund / return

Când clientul primește refund, GA4 acceptă un eveniment `refund` cu aceeași structură ca `purchase` (dar valoare negativă sau parțială).

**Locul recomandat:** `app/api/stripe/webhook/route.ts` — la `charge.refunded` sau la `updateReturnStatus('completed')` în admin.

**Snippet:**
```ts
// Server-side push nu merge — GTM e client-only.
// Alternative:
// 1. Redirect user la o pagină /cont/retururi/[id]/refund-confirmat cu tracker client
// 2. Setup GTM Server-Side Container (cost separat, mai fiabil)
```

---

### 🔧 Dacă modifici PDP-ul (`app/(storefront)/vinuri/[slug]/page.tsx`)

**Adăugare `view_item`** (nu e obligatoriu dar GA4 îl recomandă):

```tsx
// Component nou ViewItemTracker în components/pdp/
"use client";
import { useEffect } from "react";
import { trackViewItem } from "@/lib/analytics/gtm";

export function ViewItemTracker({ wine }) {
  useEffect(() => {
    trackViewItem({
      item_id: wine.code,
      item_name: wine.name,
      item_category: wine.gama,
      price: wine.priceRon,
      quantity: 1,
    });
  }, [wine.code]);
  return null;
}
```

---

## Testare / debug

### 1. Verifică că GTM se încarcă

Deschide DevTools → Network → filtru „gtm.js". Ar trebui să vezi request către `googletagmanager.com/gtm.js?id=GTM-5TNDPL7Z` pe orice pagină.

### 2. Verifică dataLayer

În consolă:
```js
window.dataLayer
```
Ar trebui să vezi un array cu evenimente (`gtm.js`, `gtm.dom`, `gtm.load`, apoi custom-urile tale).

### 3. Verifică fiecare eveniment

- **`add_to_cart`**: click pe „Adaugă" pe orice card sau PDP → `window.dataLayer.at(-1)` = `{event: "add_to_cart", ecommerce: {...}}`
- **`view_cart`**: deschide drawer → același test
- **`begin_checkout`**: mergi pe `/checkout` cu coșul plin → același test
- **`purchase`**: complet flow test cu Stripe test card → pe `/checkout/success` cu comanda plătită

### 4. GTM Preview mode

În GTM UI, click „Preview" → introdu URL-ul site-ului → GTM se deschide într-un tab de debug care afișează fiecare eveniment în timp real cu payload-ul complet.

---

## Compliance — Consent Mode v2 ✅

**Consent Mode v2 e activ** (implementat 2026-07-15). GTM încarcă pe toate
paginile, dar toate tag-urile de tracking rămân **denied by default**
până când user-ul acceptă explicit în cookie banner.

### Configurare defaults

Injectat inline în `<head>` din [app/layout.tsx](../app/layout.tsx),
înainte de `<GoogleTagManager>`:

```js
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',  // cart, sesiune, temă
  security_storage: 'granted',       // CSRF, anti-fraud
  wait_for_update: 500               // 500ms grace pt banner
});
gtag('set', 'ads_data_redaction', true);   // scoate PII din reclame
gtag('set', 'url_passthrough', true);      // păstrează GCLID între pagini
```

### Sincronizare consent → GTM

Când user acceptă în banner ([components/legal/cookie-banner.tsx](../components/legal/cookie-banner.tsx)):
1. `saveConsent` scrie cookie-ul `locus-cookie-consent` (6 luni)
2. `pushConsentUpdate` face `gtag('consent', 'update', {...})` cu noua stare
3. GTM detectează update-ul și pornește tag-urile care așteptau consent

Când user revine în sesiuni ulterioare, `hydrate()` (apelat de
[ConsentScripts](../components/legal/consent-scripts.tsx) la mount) reafirmă
starea salvată — Consent Mode nu persistă între page loads.

### Categorii banner → categorii Consent Mode

| Banner categorie | Consent Mode categorii impactate |
|---|---|
| **Necesare** (always on) | `functionality_storage`, `security_storage` (deja granted) |
| **Analitice** | `analytics_storage` |
| **Marketing** | `ad_storage`, `ad_user_data`, `ad_personalization` |

### Revocare consent

Butonul „Modifică preferințele" din [/cookies](../app/(storefront)/(legal)/cookies/page.tsx)
apelează `resetConsent()` — șterge cookie-ul, banner-ul reapare, toate
categoriile revin la denied. Obligatoriu GDPR Art. 7(3): user trebuie să
poată revoca la fel de ușor cum a dat consent.

### Verificare compliance în browser

```js
// În Console după accept „Analytics" în banner:
window.dataLayer.filter(x => Array.isArray(x) && x[0] === 'consent')
// → [['consent','default',{...}], ['consent','update',{...}]]
```

### Compliance legal — checklist ✅

- ✅ **GDPR** (Regulamentul UE 2016/679) — consent explicit, granular, revocabil
- ✅ **Legea RO 506/2004** (art. 4) — cookies non-esențiale doar cu consent
- ✅ **Google Consent Mode v2** (obligatoriu din martie 2024 pentru UE)
- ✅ **ePrivacy Directive 2002/58/CE** (art. 5(3)) — cookies strict necesare exceptate
- ⚠️ **Notă:** Sesiunile pre-lansare (site-ul e după coming-soon gate) — practic 0 trafic public, deci risc minim. La lansare, cookie banner-ul e obligatoriu în toate paginile publice — deja activ prin `StorefrontOverlays`.

---

## Contact marketing

Când marketing adaugă tag-uri noi în GTM (GA4, Meta Pixel, Ads Conversion) și au nevoie de evenimente custom pe care le nu am — să scrie în GitHub Issues ce vor, adăugăm în `lib/analytics/gtm.ts` și legăm în componente.

**Container GTM:** [GTM-5TNDPL7Z](https://tagmanager.google.com/#/container/accounts/0/containers/GTM-5TNDPL7Z)
