import { SHIPPING_ZONES } from "@/lib/shipping";

export function ZonesTable() {
  return (
    <section className="livrare-zones" aria-label="Zone de livrare și durate">
      <div className="livrare-section-head">
        <div className="eyebrow">02 — zone și durate</div>
        <h2 className="h2">Cât așteaptă vinul.</h2>
        <p className="lead">
          Estimările sunt zile lucrătoare, calculate de la momentul în care
          comanda este preluată de curier (de regulă, în aceeași zi sau a doua
          zi după plată).
        </p>
      </div>

      <div className="livrare-zones-table">
        <div className="livrare-zone-row livrare-zone-head" aria-hidden="true">
          <span>Zonă</span>
          <span>Județe</span>
          <span>Durată</span>
        </div>
        {SHIPPING_ZONES.map((z) => (
          <div key={z.label} className="livrare-zone-row">
            <span className="livrare-zone-label">{z.label}</span>
            <span className="livrare-zone-counties">{z.counties.join(" · ")}</span>
            <span className="livrare-zone-duration">
              {z.durationDays[0]}–{z.durationDays[1]} zile
            </span>
          </div>
        ))}
      </div>

      <p className="livrare-zones-note">
        Sărbătorile legale și weekendurile nu se numără ca zile lucrătoare.
        În perioade de vârf (Crăciun, Paște), durata poate crește cu 1–2 zile.
      </p>
    </section>
  );
}
