"use client";

import { useState } from "react";
import { BottleInner, BottleSvg } from "@/components/landing/bottle-svg";
import type { Wine } from "@/lib/wines";

const CONTEXTS = [
  { key: "ctx-1", label: "Studio" },
  { key: "ctx-2", label: "În vie" },
  { key: "ctx-3", label: "Pe lemn" },
  { key: "ctx-4", label: "În pivniță" },
] as const;

export function WineGallery({ wine }: { wine: Wine }) {
  const [active, setActive] = useState<(typeof CONTEXTS)[number]["key"]>("ctx-1");

  return (
    <div className="gallery">
      <div className="gallery-thumbs" role="tablist" aria-label="Galerie">
        {CONTEXTS.map((c) => (
          <button
            key={c.key}
            type="button"
            className={`gallery-thumb ${active === c.key ? "is-active" : ""}`}
            aria-label={c.label}
            aria-selected={active === c.key}
            role="tab"
            onClick={() => setActive(c.key)}
          >
            <span className={`ctx ${c.key}`} aria-hidden="true" />
            <BottleSvg color={wine.bottleColor} gama={wine.gama} code={wine.code} />
          </button>
        ))}
      </div>
      <div className="gallery-main">
        <span className={`bg ${active}`} aria-hidden="true" />
        <svg
          className="bottle"
          viewBox="0 0 80 200"
          aria-label={`Sticla ${wine.name} ${wine.code}`}
          role="img"
        >
          <BottleInner color={wine.bottleColor} gama={wine.gama} code={wine.code} />
        </svg>
      </div>
    </div>
  );
}
