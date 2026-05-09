import type { Metadata } from "next";
import { Italiana, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/theme-script";
import { FilmGrain } from "@/components/film-grain";
import { SvgSprite } from "@/components/svg-sprite";
import { SiteHeader } from "@/components/site-header";
import { HeaderScrollEffect } from "@/components/header-scroll";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { AgeGate } from "@/components/legal/age-gate";
import { CookieBanner } from "@/components/legal/cookie-banner";
import { ConsentScripts } from "@/components/legal/consent-scripts";

const italiana = Italiana({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Domeniul Locus — un loc. un timp. un vin.",
    template: "%s · Domeniul Locus",
  },
  description:
    "Vinuri din Buciumeni, între Panciu și Nicorești. Origine, timp, măsură.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className={`${italiana.variable} ${ibmPlexMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="bg-bg text-ink font-mono" suppressHydrationWarning>
        <SvgSprite />
        <FilmGrain />
        <SiteHeader />
        <HeaderScrollEffect />
        {children}
        <CartDrawer />
        <AgeGate />
        <CookieBanner />
        <ConsentScripts />
      </body>
    </html>
  );
}
