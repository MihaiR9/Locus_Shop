import { GAMA_META } from "@/lib/gama-meta";
import type { Gama } from "@/lib/wines";

export function GamaHero({ gama }: { gama: Gama }) {
  const meta = GAMA_META[gama];

  return (
    <section className={`gama-hero gama-hero--${gama}`} aria-label={`Gama ${gama}`}>
      <div className="gama-hero-stage">
        <div className="gama-hero-bg" aria-hidden="true">
          <div className="ken" />
        </div>

        <div className="gama-hero-watermark" aria-hidden="true">
          {gama}
        </div>

        <div className="gama-hero-content">
          <div className="eyebrow gama-hero-eyebrow">
            trei game · același loc
          </div>

          <h1 className="gama-hero-title">
            <span className="line">
              <span>{meta.title}.</span>
            </span>
          </h1>

          <p className="gama-hero-manifesto">{meta.manifesto}</p>
        </div>
      </div>
    </section>
  );
}
