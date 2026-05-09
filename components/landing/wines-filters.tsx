"use client";

import { useEffect, useState } from "react";

const FILTERS = [
  { value: "all", label: "Toate" },
  { value: "alb", label: "Alb" },
  { value: "rosu", label: "Roșu" },
  { value: "sec", label: "Sec" },
  { value: "demisec", label: "Demisec" },
  { value: "cuvinte", label: "Cuvinte" },
  { value: "semne", label: "Semne" },
] as const;

export function WinesFilters() {
  const [active, setActive] = useState<string>("all");

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>("#winesGrid .wine[data-tags]");
    cards.forEach((c) => {
      const tags = (c.dataset.tags || "").split(" ");
      const match = active === "all" || tags.includes(active);
      c.classList.toggle("is-hidden", !match);
    });
  }, [active]);

  return (
    <div className="filters" role="group" aria-label="Filtre vinuri">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          type="button"
          className={`filter ${active === f.value ? "is-active" : ""}`}
          aria-pressed={active === f.value}
          onClick={() => setActive(f.value)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
