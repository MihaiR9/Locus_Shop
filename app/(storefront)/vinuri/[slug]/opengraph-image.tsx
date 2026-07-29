import { ImageResponse } from "next/og";
import { loadItalianaFont } from "@/lib/og-font";
import { getWineBySlug } from "@/lib/wines-queries";
import { abvLabel, metaLine } from "@/lib/wines";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Vin Domeniul Locus";

const PAMANT = "#EBE1DA";
const PIVNITA = "#1A1A1A";
const STEJAR = "#4A3C2D";
const PIATRA = "#A89D8D";
const LINE = "rgba(74, 60, 45, 0.22)";

/**
 * OG image per vin — numele, gama, specificația și prețul.
 *
 * Prețul în imagine e deliberat: pe WhatsApp și în feed-urile sociale,
 * un link cu preț vizibil convertește vizibil mai bine decât unul fără.
 * Se regenerează odată cu pagina (revalidate=60 pe PDP).
 */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [wine, italiana] = await Promise.all([
    getWineBySlug(slug),
    loadItalianaFont(),
  ]);

  // Omitem cheia `fonts` cu totul dacă Italiana n-a putut fi încărcată —
  // un array gol suprascrie fontul implicit al lui Satori și randarea crapă.
  const fontOpts = italiana
    ? {
        fonts: [
          {
            name: "Italiana",
            data: italiana,
            style: "normal" as const,
            weight: 400 as const,
          },
        ],
      }
    : {};

  if (!wine) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: PAMANT,
            color: PIVNITA,
            fontSize: 64,
            fontFamily: italiana ? "Italiana" : undefined,
          }}
        >
          Domeniul Locus
        </div>
      ),
      { ...size, ...fontOpts },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAMANT,
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: STEJAR,
          }}
        >
          <span>Domeniul Locus</span>
          <span>
            {wine.gama} · {wine.code}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontFamily: italiana ? "Italiana" : undefined,
              fontSize: 116,
              lineHeight: 1.05,
              color: PIVNITA,
            }}
          >
            {wine.name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: 26,
              letterSpacing: 2,
              color: STEJAR,
            }}
          >
            {metaLine(wine)} · {abvLabel(wine)}
            {wine.year ? ` · ${wine.year}` : ""}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            borderTop: `1px solid ${LINE}`,
            paddingTop: 28,
          }}
        >
          <span style={{ display: "flex", fontSize: 20, letterSpacing: 3, color: PIATRA }}>
            Buciumeni · DOC-CMD Panciu
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "baseline",
              fontFamily: italiana ? "Italiana" : undefined,
              fontSize: 72,
              color: PIVNITA,
            }}
          >
            {wine.priceRon}
            <span style={{ fontSize: 26, marginLeft: 10, letterSpacing: 2 }}>lei</span>
          </span>
        </div>
      </div>
    ),
    { ...size, ...fontOpts },
  );
}
