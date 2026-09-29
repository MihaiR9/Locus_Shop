"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * Celula care umple golul de la capătul ultimului rând din grila de vinuri.
 *
 * Grila are 3 coloane (2 pe tabletă, 1 pe mobil) și un număr de sticle care
 * se schimbă odată cu filtrele, deci golul apare și dispare. Celula se
 * întinde până la capătul rândului (`grid-column-end: -1`) și se ascunde
 * singură când ar începe un rând nou — adică exact când rândul e plin.
 *
 * Desenul: curbe de nivel ca pe eticheta semne, un traseu punctat care
 * urcă spre deal și punctul auriu al locului.
 */

const CX = 236;
const CY = 232;
const RINGS = 7;

function contour(i: number): string {
  const r = 26 + i * 27;
  const steps = 72;
  const pts: string[] = [];
  for (let s = 0; s <= steps; s++) {
    const a = (s / steps) * Math.PI * 2;
    const wobble =
      1 +
      0.09 * Math.sin(3 * a + i * 0.7) +
      0.05 * Math.sin(5 * a - i * 1.3) +
      0.03 * Math.cos(7 * a + i);
    const x = CX + Math.cos(a) * r * wobble * 1.12;
    const y = CY + Math.sin(a) * r * wobble * 0.86 + i * i * 0.9;
    pts.push(`${s === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ") + " Z";
}

const CONTOURS = Array.from({ length: RINGS }, (_, i) => contour(i));

const ROUTE =
  "M28 540 C 70 500, 60 452, 104 430 S 170 420, 176 372 S 150 300, 196 280 S 230 250, 236 232";

export function WinesFiller() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const grid = el?.parentElement;
    if (!el || !grid) return;

    // Arată celula, măsoară unde cade, ascunde-o dacă deschide un rând nou.
    const place = () => {
      el.hidden = false;
      const startsRow = el.offsetLeft - grid.clientLeft <= 1;
      el.hidden = startsRow;
    };
    place();

    const ro = new ResizeObserver(place);
    ro.observe(grid);
    // Filtrele comută `is-hidden` pe carduri — de aici se schimbă golul.
    const mo = new MutationObserver(place);
    mo.observe(grid, { attributes: true, attributeFilter: ["class"], subtree: true });

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);

    return () => {
      ro.disconnect();
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="wine-filler" hidden>
      <svg
        className="wf-art"
        viewBox="0 0 400 560"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g className="wf-contours" fill="none">
          {CONTOURS.map((d, i) => (
            <path
              key={i}
              d={d}
              pathLength={1}
              className={`wf-contour${i === 2 ? " wf-contour--gold" : ""}`}
              style={{ ["--i" as string]: RINGS - 1 - i }}
            />
          ))}
        </g>

        <path d={ROUTE} className="wf-route" fill="none" />

        <circle cx={CX} cy={CY} r="5" className="wf-pulse" />
        <circle cx={CX} cy={CY} r="4" className="wf-point" />
        <use href="#star8" x={CX + 14} y={CY - 34} width="14" height="14" className="wf-star" />
        <text x={CX + 34} y={CY - 22} className="wf-label">
          Buciumeni
        </text>
      </svg>

      <div className="wf-body">
        <div className="eyebrow">Locul</div>
        <p className="wf-title">
          Un loc. Un timp.
          <br />
          Un vin.
        </p>
        <p className="wf-text">
          Fiecare sticlă pornește de pe același deal, de la Buciumeni.
        </p>
        <Link href="/despre" className="wf-link">
          Despre noi
          <svg viewBox="0 0 24 12" aria-hidden="true">
            <use href="#arrow-right" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
