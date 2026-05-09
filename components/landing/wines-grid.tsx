import { Reveal } from "@/components/reveal";
import { WineCard } from "@/components/landing/wine-card";
import { WinesFilters } from "@/components/landing/wines-filters";
import { WINES } from "@/lib/wines";

export function WinesGrid() {
  return (
    <section className="colectia" aria-label="Colecția de vinuri">
      <div className="colectia-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Colecția 2025
          </div>
          <h2 className="h2">
            Șase sticle.
            <br />
            Un singur loc.
          </h2>
        </div>
        <WinesFilters />
      </div>

      <Reveal as="div" stagger className="wines" id="winesGrid">
        {WINES.map((w) => (
          <WineCard key={w.code} wine={w} />
        ))}
      </Reveal>
    </section>
  );
}
