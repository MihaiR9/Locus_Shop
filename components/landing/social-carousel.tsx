"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { SOCIAL_POSTS, INSTAGRAM_URL } from "@/lib/social-posts";

/**
 * Carusel cu vinul în contexte reale — masă, cadou, cramă, petrecere.
 *
 * De ce există: cineva care intră de pe o reclamă nu are niciun motiv să
 * te creadă. Fotografiile de studio arată produsul; astea arată că el
 * există în lumea reală și, mai important, CÂND se bea. La vin, ocazia
 * vinde mai mult decât nota de degustare.
 *
 * Derulare nativă cu scroll-snap, nu un slider cu JS: merge cu degetul pe
 * touch, cu trackpad-ul pe laptop și cu tastatura, fără bibliotecă.
 */
export function SocialCarousel() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const syncEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(syncEdges);
    el.addEventListener("scroll", syncEdges, { passive: true });
    window.addEventListener("resize", syncEdges);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", syncEdges);
      window.removeEventListener("resize", syncEdges);
    };
  }, [syncEdges]);

  function nudge(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".social-card");
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  }

  return (
    <section className="social" id="social" aria-label="Vinul în context">
      <div className="social-head">
        <div>
          <div className="eyebrow">Din viața vinului</div>
          <h2 className="h2">Unde ajunge.</h2>
        </div>
        <div className="social-head-side">
          <p className="lead">
            Mese lungi, cadouri, seri care nu se grăbesc. Trimite-ne pozele
            tale — le publicăm aici.
          </p>
          <div className="social-nav">
            <button
              type="button"
              onClick={() => nudge(-1)}
              disabled={atStart}
              aria-label="Fotografia anterioară"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              disabled={atEnd}
              aria-label="Fotografia următoare"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="social-track" ref={trackRef}>
        {SOCIAL_POSTS.map((p) => (
          <figure className="social-card" key={p.src + p.tag}>
            <Image
              src={p.src}
              alt={p.alt}
              width={800}
              height={800}
              sizes="(max-width: 700px) 78vw, (max-width: 1100px) 40vw, 300px"
            />
            <figcaption>{p.tag}</figcaption>
          </figure>
        ))}

        <Link className="social-card social-card--cta" href="/social">
          <span className="social-cta-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <use href="#star8" />
            </svg>
          </span>
          <span className="social-cta-text">Vezi toate</span>
        </Link>
      </div>

      <a
        className="social-ig"
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        Urmărește-ne pe Instagram ↗
      </a>
    </section>
  );
}
