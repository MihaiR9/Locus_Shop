/**
 * Google Tag Manager — dataLayer helpers.
 *
 * Container: GTM-5TNDPL7Z (instalat în app/layout.tsx).
 *
 * TOATE evenimentele trec pe aici. Marketing-ul configurează în GTM UI ce
 * face cu ele (GA4 tag, Meta Pixel tag, Google Ads Conversion, etc.).
 *
 * Convenția e schema GA4 Ecommerce Recommended Events:
 *   https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
 *
 * Structura standard:
 *   dataLayer.push({
 *     event: 'add_to_cart',      // numele evenimentului
 *     ecommerce: {
 *       currency: 'RON',
 *       value: 79,               // totalul RON al evenimentului
 *       items: [{ item_id, item_name, ... }]
 *     }
 *   });
 *
 * Un `dataLayer.push({ ecommerce: null })` înainte de fiecare eveniment nou
 * e recomandat de Google ca să resetezi obiectul (altfel valorile vechi
 * persistă între evenimente).
 */

export type GtmItem = {
  item_id: string; // codul produsului (ex: LC01)
  item_name: string; // numele afișat
  item_category?: string; // gama: cuvinte / semne / pauze
  item_variant?: string; // culoarea / anul, dacă e cazul
  price: number; // preț unitar RON
  quantity: number; // câte bucăți
};

type DataLayerPayload = Record<string, unknown>;

/**
 * Push brut în dataLayer. NU apela direct — folosește helper-ele de mai jos.
 * Exportat pentru cazuri edge (ex: custom events pe care marketing-ul le adaugă
 * pe termen scurt fără să treci prin release).
 */
export function pushDataLayer(payload: DataLayerPayload): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: DataLayerPayload[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push(payload);
}

/**
 * Reset `ecommerce` înainte de push (recomandat Google).
 * Toate helper-ele de mai jos îl fac automat.
 */
function resetEcommerce(): void {
  pushDataLayer({ ecommerce: null });
}

// ─── E-commerce events ───────────────────────────────────────────────

/**
 * add_to_cart — utilizatorul a adăugat unul sau mai multe produse în coș.
 *
 * Locul apelării în cod:
 *   - components/cart/add-to-cart-button.tsx (card produs)
 *   - components/pdp/wine-buy-box.tsx (PDP)
 *   - orice buton de tip „Adaugă în coș" pe viitor
 */
export function trackAddToCart(items: GtmItem[]): void {
  resetEcommerce();
  pushDataLayer({
    event: "add_to_cart",
    ecommerce: {
      currency: "RON",
      value: totalValue(items),
      items,
    },
  });
}

/**
 * view_cart — utilizatorul a deschis coșul (drawer sau pagina /cos).
 *
 * Locul apelării în cod:
 *   - components/cart/cart-drawer.tsx (când isOpen devine true)
 *   - app/(storefront)/cos/page.tsx dacă există
 */
export function trackViewCart(items: GtmItem[]): void {
  resetEcommerce();
  pushDataLayer({
    event: "view_cart",
    ecommerce: {
      currency: "RON",
      value: totalValue(items),
      items,
    },
  });
}

/**
 * begin_checkout — utilizatorul a ajuns pe /checkout.
 *
 * Locul apelării în cod:
 *   - app/(storefront)/checkout/page.tsx la mount (useEffect)
 */
export function trackBeginCheckout(items: GtmItem[]): void {
  resetEcommerce();
  pushDataLayer({
    event: "begin_checkout",
    ecommerce: {
      currency: "RON",
      value: totalValue(items),
      items,
    },
  });
}

/**
 * add_shipping_info — utilizatorul a completat livrarea.
 * Opțional dar recomandat de GA4.
 */
export function trackAddShippingInfo(
  items: GtmItem[],
  shippingTier: string,
): void {
  resetEcommerce();
  pushDataLayer({
    event: "add_shipping_info",
    ecommerce: {
      currency: "RON",
      value: totalValue(items),
      shipping_tier: shippingTier,
      items,
    },
  });
}

/**
 * add_payment_info — utilizatorul a ales metoda de plată.
 * Opțional dar recomandat.
 */
export function trackAddPaymentInfo(
  items: GtmItem[],
  paymentType: string,
): void {
  resetEcommerce();
  pushDataLayer({
    event: "add_payment_info",
    ecommerce: {
      currency: "RON",
      value: totalValue(items),
      payment_type: paymentType,
      items,
    },
  });
}

/**
 * purchase — plata a fost confirmată. **Evenimentul cel mai important.**
 *
 * Locul apelării în cod:
 *   - app/(storefront)/checkout/success/page.tsx după ce comanda e
 *     verificată în DB (payment_status = paid).
 *
 * DEDUP: pagina de succes poate fi accesată de mai multe ori (F5, back).
 * Evită să trimiți duplicate — folosește sessionStorage cu order_number
 * ca guard (helper `hasPurchaseBeenTracked` mai jos).
 */
export function trackPurchase(params: {
  transactionId: string; // order_number (ex: LC26071500001)
  value: number; // total în RON (subtotal + shipping - discount)
  shipping?: number;
  discount?: number;
  couponCode?: string;
  items: GtmItem[];
}): void {
  resetEcommerce();
  pushDataLayer({
    event: "purchase",
    ecommerce: {
      transaction_id: params.transactionId,
      currency: "RON",
      value: params.value,
      shipping: params.shipping ?? 0,
      ...(params.discount ? { discount: params.discount } : {}),
      ...(params.couponCode ? { coupon: params.couponCode } : {}),
      items: params.items,
    },
  });
}

/**
 * remove_from_cart — opțional. Când user șterge un produs din drawer.
 */
export function trackRemoveFromCart(items: GtmItem[]): void {
  resetEcommerce();
  pushDataLayer({
    event: "remove_from_cart",
    ecommerce: {
      currency: "RON",
      value: totalValue(items),
      items,
    },
  });
}

/**
 * view_item — utilizatorul a deschis PDP-ul unui produs.
 * Opțional dar recomandat.
 */
export function trackViewItem(item: GtmItem): void {
  resetEcommerce();
  pushDataLayer({
    event: "view_item",
    ecommerce: {
      currency: "RON",
      value: item.price * item.quantity,
      items: [item],
    },
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────

function totalValue(items: GtmItem[]): number {
  return items.reduce((s, it) => s + it.price * it.quantity, 0);
}

/**
 * Guard purchase-uri duplicate. Salvează order_number în sessionStorage;
 * la revenirea pe pagina de succes, `trackPurchase` nu se mai trimite.
 */
export function hasPurchaseBeenTracked(orderNumber: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const key = `gtm_purchase_${orderNumber}`;
    if (window.sessionStorage.getItem(key)) return true;
    window.sessionStorage.setItem(key, "1");
    return false;
  } catch {
    // sessionStorage e blocat (private mode) → trimite oricum, fără dedup
    return false;
  }
}
