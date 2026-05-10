import { Reveal } from "@/components/reveal";
import { WineCard } from "@/components/landing/wine-card";
import type { Wine } from "@/lib/wines";

type Props = {
  gama: Wine["gama"];
  wines: Wine[];
};

export function GamaWines({ gama, wines }: Props) {
  if (wines.length === 0) {
    return (
      <section className="gama-empty" aria-label="Gama în pregătire">
        <Reveal as="div" className="gama-empty-inner">
          <span className="gama-soon-badge" aria-live="polite">
            în curând
          </span>
          <p className="gama-empty-lead">Gama în pregătire.</p>
          <p className="gama-empty-note">
            Sticle puse deoparte, păstrate dincolo de recolta lor. Le anunțăm
            când ajung la momentul lor.
          </p>
        </Reveal>
      </section>
    );
  }

  return (
    <section
      className="gama-wines-section colectia"
      aria-label={`Vinurile gamei ${gama}`}
    >
      <div className="colectia-head">
        <div>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Colecția 2025
          </div>
          <h2 className="h2">
            {wines.length} {wines.length === 1 ? "sticlă" : "sticle"}.
            <br />
            Aceeași mână de om.
          </h2>
        </div>
      </div>

      <Reveal as="div" stagger className="wines">
        {wines.map((w) => (
          <WineCard key={w.code} wine={w} />
        ))}
      </Reveal>
    </section>
  );
}
