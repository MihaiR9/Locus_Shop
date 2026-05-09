import { abvLabel, type Wine } from "@/lib/wines";

/** Cards 03–04: serving guidelines + technical fact sheet. */
export function WineSpecs({ wine }: { wine: Wine }) {
  return (
    <>
      <article className="info-card">
        <span className="num">03</span>
        <h3>Servire</h3>
        <ul>
          <li>
            <strong>Temperatura</strong>
            <span>{wine.servingTemp}</span>
          </li>
          <li>
            <strong>Pahar</strong>
            <span>{wine.glass}</span>
          </li>
          <li>
            <strong>Decantare</strong>
            <span>{wine.decant}</span>
          </li>
          <li>
            <strong>Maturare</strong>
            <span>{wine.age}</span>
          </li>
        </ul>
      </article>
      <article className="info-card">
        <span className="num">04</span>
        <h3>Fișă tehnică</h3>
        <ul>
          <li>
            <strong>Soi</strong>
            <span>{wine.grape}</span>
          </li>
          <li>
            <strong>An recoltă</strong>
            <span>{wine.year}</span>
          </li>
          <li>
            <strong>Apelațiune</strong>
            <span>DOC-CMD Panciu</span>
          </li>
          <li>
            <strong>Volum</strong>
            <span>750 ml</span>
          </li>
          <li>
            <strong>Alcool</strong>
            <span>{abvLabel(wine)}</span>
          </li>
        </ul>
      </article>
    </>
  );
}
