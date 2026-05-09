import { Reveal } from "@/components/reveal";
import { GAMA_META } from "@/lib/gama-meta";
import type { Gama } from "@/lib/wines";

export function GamaHero({ gama }: { gama: Gama }) {
  const meta = GAMA_META[gama];

  return (
    <section className="gama-hero" aria-label={`Gama ${gama}`}>
      <Reveal as="div" className="gama-hero-inner">
        <div className="eyebrow">trei game · același loc</div>
        <h1 className="gama-title">{meta.title}</h1>
        <p className="gama-manifesto">{meta.manifesto}</p>
      </Reveal>
    </section>
  );
}
