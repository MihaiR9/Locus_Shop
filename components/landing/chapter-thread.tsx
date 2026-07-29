"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Firul ondulat care leagă capitolele poveștii, ca în landing-v6.
 *
 * Se desenează peste secțiunile `.chapter`, trecând printr-un punct în
 * dreptul fiecăruia, și se „umple" pe măsură ce derulezi.
 *
 * Trei decizii care contează:
 *
 * 1. **Doar pe desktop.** Pe mobil capitolele sunt stivuite pe o singură
 *    coloană, deci firul ar fi o linie verticală dreaptă — zgomot, nu
 *    ornament. Sub 900px componenta nu randează nimic.
 *
 * 2. **Se recalculează la resize și la încărcarea imaginilor.** Poziția
 *    punctelor vine din geometria reală a secțiunilor, nu din procente
 *    ghicite. Fără asta, firul „sare" pe ecrane de laptop unde imaginile
 *    își schimbă înălțimea după încărcare.
 *
 * 3. **Respectă `prefers-reduced-motion`.** Cine a cerut mai puțină
 *    mișcare primește firul desenat static, complet.
 */

type Point = { x: number; y: number };

const MOBILE_BREAKPOINT = 900;

export function ChapterThread({ count }: { count: number }) {
  const [path, setPath] = useState("");
  const [dots, setDots] = useState<Point[]>([]);
  const [box, setBox] = useState({ w: 0, h: 0, top: 0 });
  const [progress, setProgress] = useState(0);
  const [enabled, setEnabled] = useState(false);
  // Lungimea traseului stă în state, nu într-un ref: e citită la randare
  // pentru `stroke-dasharray`, iar un ref citit în render sparge randarea
  // concurentă (React nu îl re-evaluează).
  const [len, setLen] = useState(1);
  const pathRef = useRef<SVGPathElement | null>(null);

  /** Recalculează geometria din pozițiile reale ale secțiunilor. */
  const measure = useCallback(() => {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      setEnabled(false);
      return;
    }
    const chapters = Array.from(document.querySelectorAll<HTMLElement>(".chapter"));
    if (chapters.length === 0) {
      setEnabled(false);
      return;
    }

    const first = chapters[0].getBoundingClientRect();
    const last = chapters[chapters.length - 1].getBoundingClientRect();
    const scrollY = window.scrollY;
    const top = first.top + scrollY;
    const height = last.bottom + scrollY - top;
    const width = window.innerWidth;

    // Firul stă într-un CULOAR PROPRIU pe marginea stângă, nu peste
    // conținut. Prima versiune îl trecea prin centrul paginii, unde tăia
    // coloana de text a capitolelor.
    const rail = Math.max(28, Math.min(width * 0.045, 76));
    const amp = Math.min(rail * 0.55, 34); // ondulație discretă, în culoar

    const pts: Point[] = chapters.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: rail, y: r.top + scrollY - top + r.height / 2 };
    });

    // Curbă în S între puncte — linia șerpuiește în jurul culoarului
    // în loc să coboare drept.
    let d = `M ${rail} 0`;
    pts.forEach((p, i) => {
      const prevY = i === 0 ? 0 : pts[i - 1].y;
      const dir = i % 2 === 0 ? -1 : 1;
      d += ` C ${p.x + amp * dir} ${prevY + (p.y - prevY) * 0.35}, ${p.x - amp * dir} ${prevY + (p.y - prevY) * 0.65}, ${p.x} ${p.y}`;
    });
    const lastP = pts[pts.length - 1];
    d += ` C ${lastP.x + amp} ${lastP.y + (height - lastP.y) * 0.4}, ${lastP.x - amp} ${lastP.y + (height - lastP.y) * 0.75}, ${lastP.x} ${height}`;

    setBox({ w: width, h: height, top });
    setDots(pts);
    setPath(d);
    setEnabled(true);
  }, []);

  useEffect(() => {
    // Măsurăm într-un frame, nu sincron: geometria e validă abia după
    // paint, iar setState sincron în efect declanșează randări în cascadă.
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    onResize();
    window.addEventListener("resize", onResize);

    // Imaginile capitolelor schimbă înălțimea secțiunilor după ce se
    // încarcă — remăsurăm, altfel firul rămâne desenat pe geometria veche.
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(".chapter img"));
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener("load", onResize, { once: true });
    });

    const ro = new ResizeObserver(onResize);
    document.querySelectorAll(".chapter").forEach((el) => ro.observe(el));

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [measure, count]);

  useEffect(() => {
    if (!enabled) return;

    // Cine a cerut mai puțină mișcare primește firul desenat complet,
    // fără să urmărească scroll-ul.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const raf = requestAnimationFrame(() => setProgress(1));
      return () => cancelAnimationFrame(raf);
    }

    const onScroll = () => {
      const seen = window.scrollY + window.innerHeight - box.top;
      setProgress(Math.max(0, Math.min(1, seen / (box.h || 1))));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const raf = requestAnimationFrame(onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled, box.top, box.h]);

  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength() || 1);
  }, [path]);

  if (!enabled || !path) return null;

  return (
    <svg
      className="chapter-thread"
      style={{ top: box.top, height: box.h }}
      viewBox={`0 0 ${box.w} ${box.h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path ref={pathRef} className="thread-track" d={path} />
      <path
        className="thread-fill"
        d={path}
        style={{ strokeDasharray: len, strokeDashoffset: len * (1 - progress) }}
      />
      {dots.map((p, i) => (
        <circle
          key={i}
          className={`thread-dot ${progress * box.h > p.y ? "is-on" : ""}`}
          cx={p.x}
          cy={p.y}
          r="5"
        />
      ))}
    </svg>
  );
}
