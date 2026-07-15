import type { Metadata } from "next";
import { Italiana, IBM_Plex_Mono, Bellefair, Inter } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";
import { ThemeScript } from "@/components/theme-script";
import { SvgSprite } from "@/components/svg-sprite";

const GTM_ID = "GTM-5TNDPL7Z";

// Google Consent Mode v2 default state — TREBUIE injectat înainte de GTM.
// Toate categoriile de tracking sunt DENIED implicit; se activează doar
// când user acceptă în cookie banner (vezi lib/consent-store.ts saveConsent).
// Obligatoriu din martie 2024 pentru piețele UE (GA4 nu mai colectează
// nimic din UE fără Consent Mode v2 configurat corect).
//
// - functionality_storage: granted → cart, session, preferinte temă (cookies necesare)
// - security_storage: granted → CSRF, anti-fraud (cookies necesare)
// - restul denied până la accept explicit din banner
const CONSENT_DEFAULT_SCRIPT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'functionality_storage': 'granted',
  'security_storage': 'granted',
  'wait_for_update': 500
});
gtag('set', 'ads_data_redaction', true);
gtag('set', 'url_passthrough', true);
`;

const italiana = Italiana({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const bellefair = Bellefair({
  variable: "--font-bellefair",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      className={`${italiana.variable} ${ibmPlexMono.variable} ${bellefair.variable} ${inter.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        {/*
          Google Consent Mode v2 (denied by default) — TREBUIE injectat
          înainte ca GTM să încarce vreun tag. Îl pun inline direct în
          <head> ca să garantez ordinea (înainte de scriptul GTM injectat
          de <GoogleTagManager /> mai jos). Fără dangerouslySetInnerHTML
          conținutul ar fi escapat de React.
        */}
        <script
          id="consent-default"
          dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }}
        />
      </head>
      {/*
        Google Tag Manager — Container ID GTM-5TNDPL7Z.
        Instalat pe TOATE paginile (public + coming-soon + admin).
        Marketing configurează tag-urile (GA4, Meta Pixel, Ads) în GTM UI —
        eu doar trimit evenimente în dataLayer prin lib/analytics/gtm.ts.
        Consent state e sincronizat prin lib/consent-store.ts (Consent Mode v2).
        Vezi docs/ANALYTICS.md pentru harta completă a evenimentelor.
      */}
      <GoogleTagManager gtmId={GTM_ID} />
      <body className="bg-bg text-ink font-mono" suppressHydrationWarning>
        <SvgSprite />
        {children}
      </body>
    </html>
  );
}
