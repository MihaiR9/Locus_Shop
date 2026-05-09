import { Reveal } from "@/components/reveal";
import { GAMA_META } from "@/lib/gama-meta";
import type { Gama } from "@/lib/wines";

export function GamaPillars({ gama }: { gama: Gama }) {
  const { pillars } = GAMA_META[gama];

  return (
    <section className="gama-pillars" aria-label={`Sub-teme ${gama}`}>
      <div className="gama-pillars-head">
        <div className="eyebrow">trei sub-teme · un singur fir</div>
        <h2 className="h2">Cum se citește.</h2>
      </div>
      <Reveal as="div" stagger className="gama-pillars-grid">
        {pillars.map((p, i) => (
          <article key={p.word} className="gama-pillar">
            <div className="num">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="word">{p.word}</div>
            <p>{p.body}</p>
          </article>
        ))}
      </Reveal>
    </section>
  );
}
