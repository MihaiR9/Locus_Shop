import Link from "next/link";
import { Reveal } from "@/components/reveal";

const CRAMA = { x: 265, y: 230 };

const CONTOURS = Array.from({ length: 11 }, (_, i) => {
  const y = 40 + i * 33;
  const k = i * 10;
  return {
    d: `M-30 ${y} Q${110 + k} ${y - 20} ${230 + k} ${y + 10} T530 ${y}`,
    index: i % 3 === 1,
  };
});

const PEAKS = [
  { x: 80, y: 200, w: 15, h: 20 },
  { x: 150, y: 170, w: 15, h: 25 },
  { x: 380, y: 180, w: 18, h: 30 },
  { x: 420, y: 230, w: 12, h: 20 },
];

const RIVER = "M40 360 Q120 320 200 290 T340 230 T440 180";

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
                  strokeWidth="8"
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

            <g className="map-contours" fill="none" stroke="var(--ink-mute)">
              {CONTOURS.map((c, i) => (
                <path
                  key={i}
                  d={c.d}
                  pathLength={1}
                  strokeWidth={c.index ? 0.9 : 0.5}
                  opacity={c.index ? 0.7 : 0.4}
                  style={{ "--i": i } as React.CSSProperties}
                />
              ))}
            </g>

            <g className="map-peaks">
              {PEAKS.map((p, i) => (
                <g
                  key={i}
                  className="map-peak"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <path
                    d={`M${p.x} ${p.y} L${p.x} ${p.y + p.h} L${p.x - p.w} ${p.y + p.h} Z`}
                    fill="var(--ink-mute)"
                    opacity="0.9"
                  />
                  <path
                    d={`M${p.x} ${p.y} L${p.x + p.w} ${p.y + p.h} L${p.x} ${p.y + p.h} Z`}
                    fill="var(--ink-mute)"
                    opacity="0.5"
                  />
                </g>
              ))}
            </g>

            <path
              className="map-river"
              d={RIVER}
              mask="url(#map-river-mask)"
              stroke="var(--ink)"
              strokeWidth="1"
              strokeDasharray="2 4"
              fill="none"
              opacity="0.6"
            />

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

            <g transform="translate(120,260)">
              <g className="map-village" style={{ "--i": 0 } as React.CSSProperties}>
                <circle r="3" fill="var(--ink)" />
                <text className="map-text" x="8" y="4" fontSize="10" fill="var(--ink-soft)">
                  PANCIU
                </text>
              </g>
            </g>
            <g transform="translate(390,290)">
              <g className="map-village" style={{ "--i": 1 } as React.CSSProperties}>
                <circle r="3" fill="var(--ink)" />
                <text className="map-text" x="-66" y="4" fontSize="10" fill="var(--ink-soft)">
                  NICOREȘTI
                </text>
              </g>
            </g>

            <g transform={`translate(${CRAMA.x},${CRAMA.y})`}>
              <circle className="map-ring" r="14" style={{ "--i": 0 } as React.CSSProperties} />
              <circle className="map-ring" r="14" style={{ "--i": 1 } as React.CSSProperties} />
              <g className="map-marker">
                <use href="#star8" width="22" height="22" x="-11" y="-11" />
              </g>
            </g>
            <g className="map-crama-label map-text">
              <text x="280" y="212" fontSize="9" fill="var(--ink)" letterSpacing="1">
                BUCIUMENI
              </text>
              <text x="280" y="223" fontSize="7.5" fill="var(--ink-mute)" letterSpacing="0.5">
                CRAMĂ · 45.98°N 27.30°E
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
