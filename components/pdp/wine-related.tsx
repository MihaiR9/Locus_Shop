import Link from "next/link";
import { BottleSvg } from "@/components/landing/bottle-svg";
import { relatedWines, type Wine } from "@/lib/wines";

export function WineRelated({ wine }: { wine: Wine }) {
  const others = relatedWines(wine, 3);

  return (
    <section className="related" aria-label="Vinuri apropiate">
      <div className="related-head">
        <div className="eyebrow" style={{ justifyContent: "center" }}>
          Continuă explorarea
        </div>
        <h2 className="h2">Vinuri apropiate.</h2>
      </div>
      <div className="related-grid">
        {others.map((r) => (
          <Link key={r.code} href={`/vinuri/${r.slug}`} className="related-card">
            <div className="img">
              <BottleSvg color={r.bottleColor} gama={r.gama} code={r.code} />
            </div>
            <div className="head">
              <span>
                {r.gama} · {r.code}
              </span>
              <span>{r.year}</span>
            </div>
            <div className="name">{r.name}</div>
            <div className="price">
              {r.priceRon}
              <span className="currency">lei</span>
            </div>
            <span className="arrow-link">
              Vezi fișa
              <svg width="14" height="6" viewBox="0 0 24 12" aria-hidden="true">
                <use href="#arrow-right" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
