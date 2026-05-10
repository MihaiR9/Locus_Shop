import { Hero } from "@/components/landing/hero";
import { Manifesto } from "@/components/landing/manifesto";
import { MapSection } from "@/components/landing/map-section";
import { GameSection } from "@/components/landing/game-section";
import { WinesGrid } from "@/components/landing/wines-grid";
import { About } from "@/components/landing/about";
import { Newsletter } from "@/components/landing/newsletter";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <>
      <main id="top">
        <Hero />
        <Manifesto />
        <MapSection />
        <GameSection />
        <WinesGrid />
        <About />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
