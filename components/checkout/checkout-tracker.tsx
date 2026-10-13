"use client";

import { useEffect, useMemo, useRef } from "react";
import { useCartStore } from "@/lib/cart-store";
import { cartLineToGtmItem, trackBeginCheckout } from "@/lib/analytics/gtm";

/**
 * Tracker invizibil pentru pagina de checkout — trimite `begin_checkout`
 * o singură dată la mount, dacă coșul are conținut.
 *
 * De ce component separat: `app/(storefront)/checkout/page.tsx` e Server
 * Component (are metadata), iar dataLayer push-ul e client-only. Îl montez
 * odată la începutul paginii ca să emite evenimentul fără să convertesc
 * întreg checkout-ul la client.
 *
 * NOTE: NU folosi selectorul `selectLines` — face `filter()` care returnează
 * ref nou la fiecare render, iar Zustand v5 + React 19 intră în loop
 * (getSnapshot infinit). Aceeași convenție ca în cart-drawer.tsx:
 * selectăm primitive stabile și derivăm cu useMemo.
 */
export function CheckoutTracker() {
  const items = useCartStore((s) => s.items);
  const lines = useMemo(() => Object.values(items), [items]);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (lines.length === 0) return;
    firedRef.current = true;
    trackBeginCheckout(lines.map((l) => cartLineToGtmItem(l)));
  }, [lines]);

  return null;
}
