import type { Metadata } from "next";
import { Italiana, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/theme-script";
import { SvgSprite } from "@/components/svg-sprite";

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

/**
 * Root layout — minimal. Conține doar shell HTML, fonturi globale și
 * ThemeScript (rulează înainte de paint pentru a evita flash-ul de temă).
 *
 * UI-ul concret (header, drawer, banner, age gate) trăiește în layout-urile
 * de route group:
 *   - app/(storefront)/layout.tsx → public site
 *   - app/(admin)/admin/layout.tsx → admin dashboard (sidebar, fără chrome public)
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      data-theme="light"
      className={`${italiana.variable} ${ibmPlexMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="bg-bg text-ink font-mono" suppressHydrationWarning>
        <SvgSprite />
        {children}
      </body>
    </html>
  );
}
