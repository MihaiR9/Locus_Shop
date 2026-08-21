/**
 * Ilustrațiile celor trei capitole din /despre — desen de linie, nu
 * fotografie. Sunt gândite ca înlocuitor onest până apar fotografiile
 * reale: nu pretind că arată domeniul, ci desenează ideea capitolului.
 *
 * SVG inline, nu `<img>`, din două motive: animația de trasare vine din
 * CSS (vezi `.chapter-art` în globals.css), iar culorile se leagă la
 * variabilele temei, deci desenul trece corect și pe fundal închis.
 *
 * Fiecare traseu poartă `pathLength="1"`, așa că `stroke-dasharray: 1`
 * funcționează indiferent de lungimea reală a curbei — altfel ar trebui
 * măsurată fiecare cu `getTotalLength()`.
 */

type Variant = "familie" | "traditie" | "continuitate";

const TITLES: Record<Variant, { title: string; desc: string }> = {
  familie: {
    title: "Două vițe din aceeași rădăcină",
    desc: "O tulpină bătrână și un lăstar tânăr crescut lângă ea, împletindu-se.",
  },
  traditie: {
    title: "Un ciorchine care se coace în ritmul lui",
    desc: "Boabele se umplu una câte una, sub arcul unui an întreg.",
  },
  continuitate: {
    title: "Rădăcini vii și inele care se adaugă",
    desc: "Sub linia pământului, rădăcina se ramifică; deasupra, fiecare generație adaugă un inel.",
  },
};

export function ChapterArt({ variant }: { variant: Variant }) {
  const meta = TITLES[variant];
  return (
    <svg
      className={`chapter-art chapter-art--${variant}`}
      viewBox="0 0 400 320"
      role="img"
      aria-labelledby={`art-${variant}-t art-${variant}-d`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id={`art-${variant}-t`}>{meta.title}</title>
      <desc id={`art-${variant}-d`}>{meta.desc}</desc>
      {variant === "familie" && <Familie />}
      {variant === "traditie" && <Traditie />}
      {variant === "continuitate" && <Continuitate />}
    </svg>
  );
}

/* ── 01 Familie ────────────────────────────────────────────────────
   Tulpina bătrână urcă întâi, groasă și noduroasă. Lăstarul tânăr —
   auriu — pornește din aceeași bază și se împletește cu ea. Cârceii se
   prind la final, ca o legătură care se face după ce ambele au crescut. */
function Familie() {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path className="ca-ground" d="M60 268 H340" pathLength={1} />

      <path
        className="ca-draw ca-ink ca-d1"
        strokeWidth={3}
        pathLength={1}
        d="M186 268 C186 232 178 210 182 186 C186 160 200 140 196 112 C193 90 184 74 188 54"
      />
      <path
        className="ca-draw ca-ink ca-d2"
        strokeWidth={1.6}
        pathLength={1}
        d="M182 186 C168 176 160 164 158 150"
      />
      <path
        className="ca-draw ca-ink ca-d2"
        strokeWidth={1.6}
        pathLength={1}
        d="M196 112 C210 104 218 92 220 78"
      />

      <path
        className="ca-draw ca-gold ca-d3"
        strokeWidth={2.2}
        pathLength={1}
        d="M214 268 C214 240 220 222 216 202 C212 180 200 166 204 144 C207 126 216 114 214 98"
      />
      <path
        className="ca-draw ca-gold ca-d4"
        strokeWidth={1.4}
        pathLength={1}
        d="M216 202 C230 194 238 184 240 170"
      />

      {/* Cârcel: singura buclă din desen, acolo unde cele două se ating. */}
      <path
        className="ca-draw ca-gold ca-d5"
        strokeWidth={1.4}
        pathLength={1}
        d="M204 144 C192 140 186 132 190 126 C194 120 202 122 202 130 C202 138 194 142 186 140"
      />

      <circle className="ca-dot ca-d6" cx={188} cy={54} r={3.5} />
      <circle className="ca-dot ca-gold-fill ca-d7" cx={214} cy={98} r={3} />
    </g>
  );
}

/* ── 02 Tradiție ───────────────────────────────────────────────────
   Arcul de deasupra e anul care trece. Boabele apar una câte una, de
   sus în jos, cu întârzieri lungi între ele — răbdarea e chiar ritmul
   animației, nu un simbol desenat. */
function Traditie() {
  const berries: Array<[number, number, number]> = [
    [200, 148, 15],
    [176, 170, 14],
    [224, 170, 14],
    [200, 190, 15],
    [180, 212, 13],
    [220, 212, 13],
    [200, 234, 12],
  ];
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path
        className="ca-arc"
        strokeWidth={1.2}
        pathLength={1}
        d="M70 200 C 90 92, 310 92, 330 200"
      />
      <path className="ca-ground" d="M60 274 H340" pathLength={1} />

      <path
        className="ca-draw ca-ink ca-d1"
        strokeWidth={2.4}
        pathLength={1}
        d="M200 128 C198 116 202 104 208 96"
      />
      <path
        className="ca-draw ca-ink ca-d2"
        strokeWidth={1.6}
        pathLength={1}
        d="M208 96 C222 92 236 98 242 110 C232 116 216 112 208 96 Z"
      />

      {berries.map(([cx, cy, r], i) => (
        <circle
          key={`${cx}-${cy}`}
          className={`ca-berry ca-b${i + 1}`}
          cx={cx}
          cy={cy}
          r={r}
          strokeWidth={1.4}
        />
      ))}
    </g>
  );
}

/* ── 03 Continuitate ───────────────────────────────────────────────
   Linia pământului taie desenul în două. Deasupra, o viță scurtă.
   Dedesubt, rădăcina care se ramifică — desenată mai apăsat decât
   partea de deasupra, fiindcă despre ea e capitolul. Inelele se adaugă
   dinspre interior spre exterior; ultimul e auriu. */
function Continuitate() {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path className="ca-ground" d="M40 158 H360" pathLength={1} />

      <path
        className="ca-draw ca-ink ca-d1"
        strokeWidth={2.4}
        pathLength={1}
        d="M200 158 C200 136 196 120 200 104"
      />
      <path
        className="ca-draw ca-ink ca-d2"
        strokeWidth={1.4}
        pathLength={1}
        d="M200 122 C214 116 222 106 224 94"
      />
      <path
        className="ca-draw ca-ink ca-d2"
        strokeWidth={1.4}
        pathLength={1}
        d="M200 134 C186 128 178 120 176 110"
      />

      <path
        className="ca-draw ca-ink ca-d3"
        strokeWidth={2.6}
        pathLength={1}
        d="M200 158 C200 188 198 208 200 232 C201 248 204 258 202 272"
      />
      <path
        className="ca-draw ca-ink ca-d4"
        strokeWidth={1.6}
        pathLength={1}
        d="M199 196 C182 206 168 218 158 236 C152 248 148 256 146 266"
      />
      <path
        className="ca-draw ca-ink ca-d4"
        strokeWidth={1.6}
        pathLength={1}
        d="M200 200 C218 210 232 222 242 240 C248 250 252 258 254 268"
      />
      <path
        className="ca-draw ca-ink ca-d5"
        strokeWidth={1.1}
        pathLength={1}
        d="M158 236 C148 234 138 236 130 242"
      />
      <path
        className="ca-draw ca-ink ca-d5"
        strokeWidth={1.1}
        pathLength={1}
        d="M242 240 C252 238 262 240 270 246"
      />

      {/* Inelele — capitolele. Ultimul, auriu, e cel adăugat acum. */}
      <circle className="ca-ring ca-r1" cx={200} cy={158} r={26} strokeWidth={1} />
      <circle className="ca-ring ca-r2" cx={200} cy={158} r={44} strokeWidth={1} />
      <circle
        className="ca-ring ca-ring-gold ca-r3"
        cx={200}
        cy={158}
        r={62}
        strokeWidth={1.2}
      />
    </g>
  );
}
