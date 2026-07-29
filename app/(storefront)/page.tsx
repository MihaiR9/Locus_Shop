import { Hero } from "@/components/landing/hero";
import { BottlesBanner } from "@/components/landing/bottles-banner";
import { Manifesto } from "@/components/landing/manifesto";
import { MapSection } from "@/components/landing/map-section";
import { GameSection } from "@/components/landing/game-section";
import { SetsSection } from "@/components/landing/sets-section";
import { SocialCarousel } from "@/components/landing/social-carousel";
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
export default function HomePage() {
  return (
    <>
      <main id="top">
        <Hero />
        <BottlesBanner />
        <Manifesto />
        <MapSection />
        <GameSection />
        <SetsSection />
        {/* Dovada socială vine după produs: întâi vezi ce cumperi,
            apoi vezi că există și în afara studioului. */}
        <SocialCarousel />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
