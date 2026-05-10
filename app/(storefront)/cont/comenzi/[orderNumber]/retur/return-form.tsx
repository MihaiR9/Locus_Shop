"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const REASONS = [
  {
    value: "deteriorat",
    title: "Deteriorat la livrare",
    desc: "Sticla spartă, eticheta umedă, dop deplasat etc.",
  },
  {
    value: "neconform",
    title: "Nu corespunde descrierii",
    desc: "Alt vin decât cel comandat sau detalii eronate pe pagină.",
  },
  {
    value: "razgandit",
    title: "M-am răzgândit",
    desc: "Conform OUG 34/2014, în 14 zile, doar pentru sticle nedeschise.",
  },
  {
    value: "alt",
    title: "Alt motiv",
    desc: "Detaliază mai jos ce s-a întâmplat.",
  },
];

const RESOLUTIONS = [
  { value: "rambursare", label: "Rambursare integrală" },
  { value: "inlocuire", label: "Înlocuire (același vin)" },
];

type Props = { orderNumber: string };

export function ReturnForm({ orderNumber }: Props) {
  const router = useRouter();
  const [reason, setReason] = useState("deteriorat");
  const [resolution, setResolution] = useState("rambursare");
  const [explain, setExplain] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (explain.trim().length < 10) {
      setError("Adaugă o explicație de minim 10 caractere.");
      return;
    }
    setError(null);
    setPending(true);
    // TODO: real server action — insert into `returns` table + email admin
    // For now, simulate then redirect to a confirmation screen.
    const ticketId = "RET-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    setTimeout(() => {
      router.push(
        `/cont/comenzi/${encodeURIComponent(orderNumber)}/retur/trimis?ticket=${ticketId}`,
      );
    }, 600);
  }

  return (
    <form className="return-form" onSubmit={onSubmit} noValidate>
      <div className="field">
        <label>Motivul returului</label>
        <div className="reason-grid">
          {REASONS.map((r) => (
            <label key={r.value} className="reason-option">
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
              />
              <span className="reason-option-text">
                <strong>{r.title}</strong>
                <br />
                {r.desc}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="ret-explain">Detalii (obligatoriu)</label>
        <textarea
          id="ret-explain"
          name="explain"
          placeholder="Spune-ne pe scurt ce s-a întâmplat. Dacă există fotografii relevante, le poți trimite ulterior pe email."
          value={explain}
          onChange={(e) => setExplain(e.target.value)}
          minLength={10}
          required
          rows={5}
        />
      </div>

      <div className="field">
        <label>Cum preferi să rezolvăm</label>
        <div
          style={{ display: "flex", gap: 24, fontFamily: "var(--font-mono), monospace", fontSize: 13, color: "var(--ink-soft)" }}
        >
          {RESOLUTIONS.map((r) => (
            <label key={r.value} style={{ display: "inline-flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
              <input
                type="radio"
                name="resolution"
                value={r.value}
                checked={resolution === r.value}
                onChange={() => setResolution(r.value)}
                style={{ accentColor: "var(--ink)" }}
              />
              {r.label}
            </label>
          ))}
        </div>
      </div>

      {error && (
        <p
          role="alert"
          style={{
            margin: 0,
            color: "#a23",
            fontFamily: "var(--font-mono), monospace",
            fontSize: 12,
          }}
        >
          {error}
        </p>
      )}

      <button type="submit" className="submit" disabled={pending}>
        {pending ? "se trimite…" : "Trimite cererea"}
        {!pending && (
          <svg className="arrow-svg" width="16" height="8" viewBox="0 0 24 12" aria-hidden="true">
            <use href="#arrow-right" />
          </svg>
        )}
      </button>
    </form>
  );
}
