import { FilmGrain } from "@/components/film-grain";
import { SiteHeader } from "@/components/site-header";
import { HeaderScrollEffect } from "@/components/header-scroll";
import { StorefrontOverlays } from "@/components/storefront-overlays";
import { JsonLd } from "@/components/seo/json-ld";
import { getCurrentUser } from "@/lib/auth/current-user";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";

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
export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <>
      {/* Identitatea brandului, o singură dată pentru tot storefront-ul.
          Paginile adaugă peste: Product pe PDP, ItemList pe colecții. */}
      <JsonLd data={[organizationSchema(), websiteSchema()]} />
      <FilmGrain />
      <SiteHeader
        sessionUser={
          user ? { firstName: user.firstName, fullName: user.fullName } : null
        }
      />
      <HeaderScrollEffect />
      {children}
      <StorefrontOverlays />
    </>
  );
}
