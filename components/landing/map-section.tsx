import Link from "next/link";
import { Reveal } from "@/components/reveal";

/*
 * Hartă schematică, dar la scară: pozițiile vin din coordonate reale,
 * proiectate pe viewBox 500×400 (nord în sus). Cadrul acoperă
 * 27.02–27.42°E și 45.835–46.058°N, ~31 × 25 km, cu proporțiile păstrate.
 */
const LON = [27.02, 27.42] as const;
const LAT = [46.058, 45.835] as const;

function project(lon: number, lat: number) {
  return {
    x: ((lon - LON[0]) / (LON[1] - LON[0])) * 500,
    y: ((LAT[0] - lat) / (LAT[0] - LAT[1])) * 400,
  };
}

const CRAMA = project(27.3, 45.98);
const PANCIU = project(27.089, 45.906);
const NICORESTI = project(27.313, 45.929);

/** Siretul, de la nord la sud (granița Vrancea / Galați pe porțiunea asta). */
const SIRET_POINTS: [number, number][] = [
  [27.247, 46.075],
  [27.244, 46.034],
  [27.241, 46.002],
  [27.247, 45.961],
  [27.252, 45.945],
  [27.264, 45.921],
  [27.274, 45.903],
  [27.284, 45.885],
  [27.298, 45.867],
  [27.308, 45.844],
  [27.32, 45.82],
];

/** Curbă netedă prin puncte (Catmull-Rom → Bézier cubic). */
function smoothPath(points: { x: number; y: number }[]) {
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(points[0].x)} ${f(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return d;
}

const RIVER = smoothPath(SIRET_POINTS.map(([lon, lat]) => project(lon, lat)));

/** Lacul Călimănești, pe Siret, la vest de Buciumeni. */
const LAKE = { ...project(27.2425, 45.975), rx: 6, ry: 52 };

/**
 * Rânduri de vie: cele două podgorii între care stă crama — Panciu la vest,
 * dealurile Nicoreștiului la est. Rânduri paralele tăiate într-o elipsă,
 * cu lungimi ușor neregulate ca să nu arate desenat cu rigla.
 */
function vineRows(rx: number, ry: number, gap: number) {
  const rows: string[] = [];
  let i = 0;
  for (let y = -ry + gap / 2; y < ry; y += gap, i++) {
    const half = rx * Math.sqrt(1 - (y / ry) ** 2) * (0.82 + 0.18 * Math.abs(Math.sin(i * 2.3)));
    if (half < 4) continue;
    const shift = Math.sin(i * 1.7) * rx * 0.08;
    rows.push(`M${(shift - half).toFixed(1)} ${y.toFixed(1)} H${(shift + half).toFixed(1)}`);
  }
  return rows;
}

const VINEYARDS = [
  { x: 100, y: 192, rx: 74, ry: 50, angle: -24, rows: vineRows(74, 50, 6) },
  { x: 440, y: 184, rx: 40, ry: 44, angle: 18, rows: vineRows(40, 44, 6) },
];

const TICKS = Array.from({ length: 19 }, (_, i) => (i + 1) * 25);

export function MapSection() {
  return (
    <section className="locul" id="locul" aria-label="Locul">
      <div className="locul-grid">
        <Reveal
          as="div"
          role="img"
          className="map"
          aria-label="Hartă schematică Buciumeni — Panciu — Nicorești"
        >
          <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <mask id="map-river-mask" maskUnits="userSpaceOnUse">
                <path
                  className="map-river-reveal"
                  d={RIVER}
                  pathLength={1}
                  stroke="#fff"
                  strokeWidth="10"
                  fill="none"
                />
              </mask>
            </defs>

            <g className="map-ticks" stroke="var(--ink-mute)" strokeWidth="0.6">
              {TICKS.map((t) => (
                <g key={t}>
                  <line x1={t} y1="0" x2={t} y2={t % 100 === 0 ? 8 : 4} />
                  <line x1="0" y1={t} x2={t % 100 === 0 ? 8 : 4} y2={t} />
                </g>
              ))}
            </g>

            <g className="map-vineyards" fill="none" stroke="var(--ink-mute)" strokeWidth="0.7">
              {VINEYARDS.map((v, i) => (
                <g key={i} transform={`translate(${v.x} ${v.y}) rotate(${v.angle})`}>
                  {v.rows.map((d, r) => (
                    <path
                      key={r}
                      d={d}
                      pathLength={1}
                      opacity="0.55"
                      style={{ "--i": r } as React.CSSProperties}
                    />
                  ))}
                </g>
              ))}
            </g>

            <g className="map-regions map-text" fontSize="7" fill="var(--ink-mute)" letterSpacing="2">
              <text x="248" y="56" textAnchor="end">VRANCEA</text>
              <text x="304" y="56">GALAȚI</text>
              <text x="100" y="252" textAnchor="middle" letterSpacing="1">
                PODGORIA PANCIU
              </text>
              <text x="418" y="258" textAnchor="middle" letterSpacing="1">
                PODGORIA NICOREȘTI
              </text>
            </g>

            <ellipse
              className="map-lake"
              cx={LAKE.x}
              cy={LAKE.y}
              rx={LAKE.rx}
              ry={LAKE.ry}
              transform={`rotate(4 ${LAKE.x} ${LAKE.y})`}
              fill="var(--ink-mute)"
              opacity="0.18"
            />
            <path
              className="map-river"
              d={RIVER}
              mask="url(#map-river-mask)"
              stroke="var(--ink)"
              strokeWidth="1.2"
              strokeDasharray="2 4"
              fill="none"
              opacity="0.6"
            />
            <text
              className="map-river-label map-text"
              x="0"
              y="0"
              fontSize="7"
              fill="var(--ink-mute)"
              letterSpacing="2"
              transform="translate(322 268) rotate(62)"
            >
              SIRET
            </text>

            <g className="map-crosshair" stroke="var(--ink-mute)" strokeWidth="0.6">
              <path className="to-left" d={`M0 ${CRAMA.y} H${CRAMA.x}`} />
              <path className="to-right" d={`M${CRAMA.x} ${CRAMA.y} H500`} />
              <path className="to-top" d={`M${CRAMA.x} 0 V${CRAMA.y}`} />
              <path className="to-bottom" d={`M${CRAMA.x} ${CRAMA.y} V400`} />
            </g>
            <g className="map-coord-labels map-text" fontSize="7" fill="var(--ink-mute)">
              <text x="12" y={CRAMA.y - 5}>45.98°N</text>
              <text x={CRAMA.x + 5} y="16">27.30°E</text>
            </g>

            <g transform={`translate(${PANCIU.x} ${PANCIU.y})`}>
              <g className="map-village" style={{ "--i": 0 } as React.CSSProperties}>
                <circle r="3" fill="var(--ink)" />
                <text className="map-text" x="8" y="4" fontSize="10" fill="var(--ink-soft)">
                  PANCIU
                </text>
              </g>
            </g>
            <g transform={`translate(${NICORESTI.x} ${NICORESTI.y})`}>
              <g className="map-village" style={{ "--i": 1 } as React.CSSProperties}>
                <circle r="3" fill="var(--ink)" />
                <text className="map-text" x="8" y="4" fontSize="10" fill="var(--ink-soft)">
                  NICOREȘTI
                </text>
              </g>
            </g>

            <g transform={`translate(${CRAMA.x} ${CRAMA.y})`}>
              <circle className="map-ring" r="14" style={{ "--i": 0 } as React.CSSProperties} />
              <circle className="map-ring" r="14" style={{ "--i": 1 } as React.CSSProperties} />
              <g className="map-marker">
                <use href="#star8" width="22" height="22" x="-11" y="-11" />
              </g>
            </g>
            <g className="map-crama-label map-text">
              <text x={CRAMA.x + 16} y={CRAMA.y - 14} fontSize="9" fill="var(--ink)" letterSpacing="1">
                BUCIUMENI
              </text>
              <text x={CRAMA.x + 16} y={CRAMA.y - 3} fontSize="7.5" fill="var(--ink-mute)" letterSpacing="0.5">
                CRAMĂ
              </text>
            </g>

            <g transform="translate(455, 50)" className="map-compass">
              <circle r="14" fill="none" stroke="var(--ink-mute)" strokeWidth="0.6" />
              <g className="map-needle">
                <path d="M0 -10 L3 0 L0 10 L-3 0 Z" fill="var(--ink)" />
              </g>
              <text
                className="map-text"
                y="-18"
                textAnchor="middle"
                fontSize="7"
                fill="var(--ink-mute)"
              >
                N
              </text>
            </g>
          </svg>
        </Reveal>

        <Reveal as="div" className="locul-text">
          <div className="eyebrow" style={{ marginBottom: 24 }}>
            Locul
          </div>
          <h2 className="h2">
            Un punct precis, între Panciu și&nbsp;Nicorești.
          </h2>
          <p>
            Centrul de Vinificație Buciumeni stă pe o coamă de deal, în județul
            Galați, la întâlnirea celor două areale viticole. Aici se obține
            vinul cu denumire de origine controlată — cules la maturitate
            deplină.
          </p>
          <div className="coords">
            <div className="row">
              <strong>Coordonate</strong>
              <span>45.98°N 27.30°E</span>
            </div>
            <div className="row">
              <strong>Sat</strong>
              <span>Buciumeni · Galați</span>
            </div>
            <div className="row">
              <strong>Apelațiune</strong>
              <span>DOC-CMD Panciu</span>
            </div>
          </div>
          <Link href="/despre" className="btn-ghost">
            <span>Vezi povestea locului</span>
            <svg className="arrow-svg" viewBox="0 0 24 12" aria-hidden="true">
              <use href="#arrow-right" />
            </svg>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
