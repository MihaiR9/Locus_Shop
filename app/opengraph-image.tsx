import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { loadItalianaFont } from "@/lib/og-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Domeniul Locus — un loc. un timp. un vin.";

// Tokens de brand — vezi CLAUDE.md secțiunea 2.
const PAMANT = "#EBE1DA";

/**
 * Imaginea implicită afișată când site-ul e partajat pe Facebook, WhatsApp,
 * Instagram, LinkedIn sau Slack: fotografia cu dealurile din hero, cu titlul
 * hero-ului peste ea. Fundalul e pregătit de `scripts/build-og-image.mjs`
 * (decupat 1200×630 și tonifiat ca pe site — Satori nu suportă filtre CSS).
 */
export default async function Image() {
  const [italiana, photo] = await Promise.all([
    loadItalianaFont(),
    readFile(join(process.cwd(), "public/brand/og-dealuri.jpg")),
  ]);
  const background = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#1A1A1A",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={background}
          width={1200}
          height={630}
          alt=""
          style={{ position: "absolute", top: 0, left: 0 }}
        />
        {/* Aceleași umbre ca în hero: de jos în sus și dinspre stânga. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            backgroundImage:
              "linear-gradient(180deg, rgba(26,26,26,0) 30%, rgba(26,26,26,0.7) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            backgroundImage:
              "linear-gradient(90deg, rgba(20,16,12,0.5) 0%, rgba(20,16,12,0.15) 55%, rgba(20,16,12,0) 85%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: 28,
            padding: "0 80px 64px",
            color: PAMANT,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: 7,
              textTransform: "uppercase",
              opacity: 0.9,
            }}
          >
            Domeniul Locus · Buciumeni
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: italiana ? "Italiana" : undefined,
              fontSize: 112,
              lineHeight: 1.0,
            }}
          >
            <span>un loc.</span>
            <span>un timp.</span>
            <span>un vin.</span>
          </div>
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
