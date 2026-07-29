import { ImageResponse } from "next/og";
import { loadItalianaFont } from "@/lib/og-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Domeniul Locus — un loc. un timp. un vin.";

// Tokens de brand (light mode) — vezi CLAUDE.md secțiunea 2.
const PAMANT = "#EBE1DA";
const PIVNITA = "#1A1A1A";
const STEJAR = "#4A3C2D";
const PIATRA = "#A89D8D";

/**
 * Imaginea implicită afișată când site-ul e partajat pe Facebook, WhatsApp,
 * Instagram, LinkedIn sau Slack. Fără ea, link-urile apar ca text gol —
 * pierdere directă de CTR pe tot ce e organic și social.
 */
export default async function Image() {
  const italiana = await loadItalianaFont();

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
            fontSize: 22,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: STEJAR,
          }}
        >
          Domeniul Locus
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: italiana ? "Italiana" : undefined,
            fontSize: 118,
            lineHeight: 1.06,
            color: PIVNITA,
          }}
        >
          <span>un loc.</span>
          <span>un timp.</span>
          <span>un vin.</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            letterSpacing: 3,
            color: PIATRA,
          }}
        >
          <span>Buciumeni · între Panciu și Nicorești</span>
          <span>45.98°N 27.30°E</span>
        </div>
      </div>
    ),
    {
      ...size,
      // Cheia `fonts` se omite complet când Italiana n-a putut fi încărcată:
      // un array gol ar suprascrie fontul implicit al lui Satori și
      // randarea ar eșua în loc să degradeze.
      ...(italiana
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
        : {}),
    },
  );
}
