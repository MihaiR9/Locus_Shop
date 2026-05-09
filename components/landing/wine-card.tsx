import Link from "next/link";
import { BottleSvg } from "@/components/landing/bottle-svg";
import { metaLine, type Wine } from "@/lib/wines";

const TYPE_TAG: Record<string, string> = { alb: "alb", rosu: "rosu", rose: "rose" };

export function WineCard({ wine }: { wine: Wine }) {
  const tags = [TYPE_TAG[wine.type], wine.sweetness, wine.gama]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className="wine"
      data-id={wine.code}
      data-price={wine.priceRon}
      data-tags={tags}
    >
      <div className="wine-header">
        <span>
          {wine.gama} · {wine.code}
        </span>
        <span>{wine.year}</span>
      </div>
      <div className="wine-bottle">
        <BottleSvg color={wine.bottleColor} gama={wine.gama} code={wine.code} />
      </div>
      <h3 className="wine-name">{wine.name}</h3>
      <div className="wine-meta">
        <strong>{metaLine(wine)}</strong>
        <span>
          {wine.abv.toString().replace(".", ",")}% VOL
        </span>
      </div>
      <p className="wine-notes">{wine.notes}</p>
      <div className="wine-foot">
        <span className="wine-temp">Servire {wine.servingTemp}</span>
        <Link className="wine-link" href={`/vinuri/${wine.slug}`}>
          Vezi fișa
          <svg className="arrow-svg" width="14" height="6" viewBox="0 0 24 12" aria-hidden="true">
            <use href="#arrow-right" />
          </svg>
        </Link>
      </div>
      <div className="wine-buy">
        <span className="wine-price">
          {wine.priceRon.toLocaleString("ro-RO")}
          <span className="currency">lei</span>
        </span>
        <button
          type="button"
          className="wine-add"
          data-add={wine.code}
          aria-label={`Adaugă ${wine.name} în coș`}
          // Cart wiring lands in Phase 2; for now this is a visual no-op.
          disabled
          title="Coșul devine activ în următoarea fază"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path
              d="M3 4 L4 14 H12 L13 4 Z M5 4 V2.5 A3 3 0 0 1 11 2.5 V4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
          Adaugă
        </button>
      </div>
    </article>
  );
}
