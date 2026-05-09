"use client";

import { useEffect, useRef, useState } from "react";

const FRAME_COUNT = 3;
const INTERVAL = 5500;

/**
 * Renders the hero pager (01 / 02 / 03) and drives the carousel by toggling
 * `.is-active` on sibling `.hero-frame` nodes via DOM queries — mirrors
 * Landing_V1.html exactly. Frames themselves are server-rendered in <Hero>.
 */
export function HeroPager() {
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const frames = document.querySelectorAll<HTMLElement>(".hero-frame");
    frames.forEach((f, i) => f.classList.toggle("is-active", i === active));
  }, [active]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    timer.current = setInterval(() => {
      setActive((i) => (i + 1) % FRAME_COUNT);
    }, INTERVAL);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  function go(i: number) {
    setActive(i);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setActive((k) => (k + 1) % FRAME_COUNT);
    }, INTERVAL);
  }

  return (
    <div className="hero-pager" role="tablist" aria-label="Cadre hero">
      {Array.from({ length: FRAME_COUNT }).map((_, i) => (
        <span key={i} style={{ display: "contents" }}>
          <button
            type="button"
            className={active === i ? "is-active" : ""}
            role="tab"
            aria-selected={active === i}
            onClick={() => go(i)}
          >
            {String(i + 1).padStart(2, "0")}
          </button>
          {i < FRAME_COUNT - 1 ? <span className="sep" aria-hidden="true" /> : null}
        </span>
      ))}
    </div>
  );
}
