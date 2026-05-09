import { Reveal } from "@/components/reveal";

export function MapSection() {
  return (
    <section className="locul" id="locul" aria-label="Locul">
      <div className="locul-grid">
        <Reveal
          as="div"
          className="map"
          aria-label="Hartă schematică Buciumeni — Panciu — Nicorești"
        >
          <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
            {/* relief lines */}
            <g
              stroke="var(--ink-mute)"
              strokeWidth="0.6"
              fill="none"
              opacity="0.5"
            >
              <path d="M0 80 Q120 60 240 90 T500 80" />
              <path d="M0 130 Q140 110 260 140 T500 130" />
              <path d="M0 180 Q160 160 280 190 T500 180" />
              <path d="M0 240 Q180 220 300 250 T500 240" />
              <path d="M0 300 Q200 280 320 310 T500 300" />
              <path d="M0 350 Q220 330 340 360 T500 350" />
            </g>

            {/* relief peaks */}
            <g fill="var(--ink-mute)" opacity="0.8">
              <path d="M80 200 L95 220 L65 220 Z" />
              <path d="M150 170 L165 195 L135 195 Z" />
              <path d="M380 180 L398 210 L362 210 Z" />
              <path d="M420 230 L432 250 L408 250 Z" />
            </g>

            {/* river */}
            <path
              d="M40 360 Q120 320 200 290 T340 230 T440 180"
              stroke="var(--ink)"
              strokeWidth="1"
              strokeDasharray="2 4"
              fill="none"
              opacity="0.6"
            />

            {/* villages */}
            <g transform="translate(120,260)">
              <circle r="3" fill="var(--ink)" />
              <text
                x="8"
                y="4"
                fontFamily="IBM Plex Mono, monospace"
                fontSize="10"
                fill="var(--ink-soft)"
              >
                PANCIU
              </text>
            </g>
            <g transform="translate(390,290)">
              <circle r="3" fill="var(--ink)" />
              <text
                x="-66"
                y="4"
                fontFamily="IBM Plex Mono, monospace"
                fontSize="10"
                fill="var(--ink-soft)"
              >
                NICOREȘTI
              </text>
            </g>

            {/* crama marker */}
            <g transform="translate(265, 230)" className="marker">
              <use href="#star8" width="24" height="24" x="-12" y="-12" color="var(--vie)" />
            </g>
            <text
              x="280"
              y="220"
              fontFamily="IBM Plex Mono, monospace"
              fontSize="9"
              fill="var(--ink)"
              letterSpacing="1"
            >
              BUCIUMENI
            </text>
            <text
              x="280"
              y="232"
              fontFamily="IBM Plex Mono, monospace"
              fontSize="8"
              fill="var(--ink-mute)"
              letterSpacing="0.5"
            >
              CRAMĂ · 45.98°N 27.30°E
            </text>

            {/* compass */}
            <g transform="translate(450, 50)" opacity="0.7">
              <circle r="14" fill="none" stroke="var(--ink-mute)" strokeWidth="0.6" />
              <path d="M0 -10 L3 0 L0 10 L-3 0 Z" fill="var(--ink)" />
              <text
                y="-18"
                textAnchor="middle"
                fontFamily="IBM Plex Mono, monospace"
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
            Un punct precis, între Panciu și Nicorești.
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
          <a href="#despre" className="btn-ghost">
            <span>Vezi povestea locului</span>
            <svg className="arrow-svg" viewBox="0 0 24 12" aria-hidden="true">
              <use href="#arrow-right" />
            </svg>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
