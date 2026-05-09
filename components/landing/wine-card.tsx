import Link from "next/link";
import { BottleSvg } from "@/components/landing/bottle-svg";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
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
        <AddToCartButton code={wine.code} wineName={wine.name} />
      </div>
    </article>
  );
}
