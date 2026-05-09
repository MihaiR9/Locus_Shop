import type { Metadata } from "next";
import { Italiana, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

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
      className={`${italiana.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink font-mono">
        {children}
      </body>
    </html>
  );
}
