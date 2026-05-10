import { FilmGrain } from "@/components/film-grain";
import { SiteHeader } from "@/components/site-header";
import { HeaderScrollEffect } from "@/components/header-scroll";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { AgeGate } from "@/components/legal/age-gate";
import { CookieBanner } from "@/components/legal/cookie-banner";
import { ConsentScripts } from "@/components/legal/consent-scripts";

/**
 * Storefront layout — wraps all PUBLIC pages (landing, shop, vinuri, despre,
 * contact, parteneri, livrare, cum-cumperi, checkout, legal, etc).
 *
 * Includes: site header with cart icon, cart drawer, age gate, cookie banner,
 * film grain, SVG sprite, and consent script bootstrap.
 *
 * Admin pages live in app/(admin)/admin/* and DO NOT inherit this layout —
 * they have their own minimal admin shell.
 */
export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <FilmGrain />
      <SiteHeader />
      <HeaderScrollEffect />
      {children}
      <CartDrawer />
      <AgeGate />
      <CookieBanner />
      <ConsentScripts />
    </>
  );
}
