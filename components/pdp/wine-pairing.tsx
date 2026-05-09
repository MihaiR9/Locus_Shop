import type { Wine } from "@/lib/wines";

/** Cards 01–02: degustation note + food pairing recommendation. */
export function WinePairing({ wine }: { wine: Wine }) {
  return (
    <>
      <article className="info-card">
        <span className="num">01</span>
        <h3>Notă de degustare</h3>
        <p>{wine.taste}</p>
      </article>
      <article className="info-card">
        <span className="num">02</span>
        <h3>Asociere culinară</h3>
        <p>{wine.pair}</p>
      </article>
    </>
  );
}
