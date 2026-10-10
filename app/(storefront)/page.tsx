import type { Metadata } from "next";
import { Italiana } from "next/font/google";
import { Hero } from "@/components/landing/hero";
import { BottlesBanner } from "@/components/landing/bottles-banner";
import { Manifesto } from "@/components/landing/manifesto";
import { MapSection } from "@/components/landing/map-section";
import { GameSection } from "@/components/landing/game-section";
import { SetsSection } from "@/components/landing/sets-section";
// import { SocialCarousel } from "@/components/landing/social-carousel";
import { Newsletter } from "@/components/landing/newsletter";
import { Footer } from "@/components/landing/footer";

/**
 * Home.
 *
 * Grila completă a colecției a fost mutată exclusiv pe /shop — se dubla,
 * iar home-ul cerea vizitatorului să aleagă dintre șase sticle înainte
 * să înțeleagă brandul. În locul ei, `SetsSection` propune o singură
 * decizie: iei gama întreagă.
 *
 * Secțiunea „Despre noi" a fost scoasă: povestea trăiește acum într-un
 * singur loc, pe /despre, unde duce și butonul din `MapSection`.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/* Italiana trăiește doar aici, nu în layout: așa se preîncarcă doar pe home,
   nu pe fiecare pagină a site-ului. */

/** Fontul din logo. N-are diacritice complete (ș/ț cu virgulă sub), deci
 *  îl folosim doar unde textul e fix și fără ele — titlul hero (`.hero-title`). */
const italiana = Italiana({
  variable: "--font-italiana",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export default function HomePage() {
  return (
    <>
      <main id="top" className={italiana.variable}>
        <Hero />
        <BottlesBanner />
        <Manifesto />
        <MapSection />
        <GameSection />
        <SetsSection />
        {/* Ascuns temporar la cererea lui Mihai (29 sep 2026) — revine când
            avem poze reale trimise de clienți. Dovada socială vine după
            produs: întâi vezi ce cumperi, apoi vezi că există și în afara
            studioului. */}
        {/* <SocialCarousel /> */}
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
