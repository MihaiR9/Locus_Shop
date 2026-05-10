"use client";

import dynamic from "next/dynamic";

/**
 * Wrapper that loads the four non-critical client islands LAZILY.
 *
 * They all render `null` on first paint (each is gated on hydration,
 * cart-open, age-verified, or consent state), so deferring their JS
 * out of the initial bundle shaves ~20-30 KB off the home route's
 * critical path without any visible behavior change.
 *
 * Because dynamic({ ssr: false }) only works inside a client component,
 * this thin wrapper exists to provide that "use client" boundary —
 * the storefront layout itself stays a server component.
 */
const CartDrawer = dynamic(
  () => import("@/components/cart/cart-drawer").then((m) => m.CartDrawer),
  { ssr: false },
);
const AgeGate = dynamic(
  () => import("@/components/legal/age-gate").then((m) => m.AgeGate),
  { ssr: false },
);
const CookieBanner = dynamic(
  () => import("@/components/legal/cookie-banner").then((m) => m.CookieBanner),
  { ssr: false },
);
const ConsentScripts = dynamic(
  () => import("@/components/legal/consent-scripts").then((m) => m.ConsentScripts),
  { ssr: false },
);

export function StorefrontOverlays() {
  return (
    <>
      <CartDrawer />
      <AgeGate />
      <CookieBanner />
      <ConsentScripts />
    </>
  );
}
