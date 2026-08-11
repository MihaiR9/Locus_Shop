import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { AddSetButton } from "@/components/landing/add-set-button";
import { getWinesByGama } from "@/lib/wines-queries";
import { productPhoto, type Gama, type Wine } from "@/lib/wines";
// Procentul vine din singura sursă — aceeași folosită de server la
// calculul reducerii. Dacă se schimbă, se schimbă în ambele locuri odată.
import { SET_DISCOUNT_PCT } from "@/lib/sets";

/**
 * Secțiunea de vânzare de pe home: două seturi, câte unul de gamă.
 *
 * Înlocuiește grila completă a colecției, care se dubla cu /shop.
 * Home-ul propune o singură decizie clară — „iau setul" — iar cine vrea
 * să aleagă sticlă cu sticlă merge în shop.
 */

const SETS: {
  gama: Extract<Gama, "cuvinte" | "semne">;
  eyebrow: string;
  title: string;
  body: string;
}[] = [
  {
    gama: "cuvinte",
    eyebrow: "trei sticle · cuvinte",
    title: "Setul Cuvinte",
    body: "Cele trei vinuri ale gamei, într-un singur colet. Pentru mese lungi și cadouri care nu au nevoie de explicații.",
  },
  {
    gama: "semne",
    eyebrow: "trei sticle · semne",
    title: "Setul Semne",
    body: "Aceleași trei soiuri, altă mână la sticlă. Pentru mese obișnuite care merită totuși un vin cu origine.",
  },
];

function setPrices(wines: Wine[]) {
  const full = wines.reduce((sum, w) => sum + w.priceRon, 0);
  const discounted = Math.round((full * (100 - SET_DISCOUNT_PCT)) / 100);
  return { full, discounted, saved: full - discounted };
}

async function SetCard({ config }: { config: (typeof SETS)[number] }) {
  const wines = await getWinesByGama(config.gama);
  if (wines.length === 0) return null;

  const { full, discounted } = setPrices(wines);

  return (
    <article className="set-card">
      <div className="set-visual" aria-hidden="true">
        {wines.map((w, i) => {
          const src = productPhoto(w.code);
          if (!src) return null;
          return (
            <Image
              key={w.code}
              src={src}
              alt=""
              width={941}
              height={1672}
              sizes="(max-width: 900px) 30vw, 180px"
              className={`set-bottle set-bottle--${i + 1}`}
            />
          );
        })}
      </div>

      <div className="set-body">
        <div className="eyebrow">{config.eyebrow}</div>
        <h3 className="set-title">{config.title}</h3>
        <p className="set-text">{config.body}</p>

        <ul className="set-list">
          {wines.map((w) => (
            <li key={w.code}>
              <span>{w.name}</span>
              <span className="set-list-code">{w.code}</span>
            </li>
          ))}
        </ul>

        <div className="set-pricing">
          <span className="set-price">
            {discounted.toLocaleString("ro-RO")}
            <span className="currency">lei</span>
          </span>
          <span className="set-was">{full.toLocaleString("ro-RO")} lei</span>
          <span className="set-badge">−{SET_DISCOUNT_PCT}%</span>
        </div>

        <AddSetButton wines={wines} />
        <Link href={`/${config.gama}`} className="set-link">
          Vezi sticlele separat
        </Link>
      </div>
    </article>
  );
}

export function SetsSection() {
  return (
    <section className="sets" id="seturi" aria-label="Seturi de vin">
      <Reveal as="div" className="sets-head">
        <div className="eyebrow">Cel mai bun mod de a începe</div>
        <h2 className="h2">Ia gama întreagă.</h2>
        <p className="lead">
          Trei sticle, un singur colet, {SET_DISCOUNT_PCT}% mai puțin decât
          luate separat. Dacă nu știi de unde să începi, de aici se începe.
        </p>
      </Reveal>

      <div className="sets-grid">
        {SETS.map((s) => (
          <SetCard key={s.gama} config={s} />
        ))}
      </div>
    </section>
  );
}
