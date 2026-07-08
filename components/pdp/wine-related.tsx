import Link from "next/link";
import { ProductBottle } from "@/components/landing/product-bottle";
import type { Wine } from "@/lib/wines";

export function WineRelated({ wines }: { wines: Wine[] }) {
  if (wines.length === 0) return null;

  return (
    <section className="related" aria-label="Vinuri apropiate">
      <div className="related-head">
        <div className="eyebrow" style={{ justifyContent: "center" }}>
          Continuă explorarea
        </div>
        <h2 className="h2">Vinuri apropiate.</h2>
      </div>
      <div className="related-grid">
        {wines.map((r) => (
          <Link key={r.code} href={`/vinuri/${r.slug}`} className="related-card">
            <div className="img">
              <ProductBottle
                code={r.code}
                name={r.name}
                gama={r.gama}
                color={r.bottleColor}
                size={200}
              />
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
