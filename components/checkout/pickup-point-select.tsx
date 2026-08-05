"use client";

import { useEffect, useRef, useState } from "react";
import type { FanCourierPickupPoint, FanCourierPickupType } from "@/lib/fancourier/types";

type SelectedPoint = {
  id: string;
  name: string;
  address: string;
};

type Props = {
  type: FanCourierPickupType;
  /** Județ selectat în form — filtrează lista. Lăsat gol = fără filtrare. */
  county: string;
  /** Localitate selectată — filtrează suplimentar. */
  locality: string;
  value: SelectedPoint | null;
  onChange: (point: SelectedPoint | null) => void;
  disabled?: boolean;
};

type ApiResponse =
  | { ok: true; configured: true; points: FanCourierPickupPoint[] }
  | { ok: true; configured: false; points: []; message: string }
  | { ok: false; error: string };

/**
 * Selector puncte PUDO (FANbox / PayPoint / sediu FAN).
 *
 * Fetch-ul pornește când user-ul are județ ales — nu vrem 5000 de puncte
 * încărcate pe blank. Dacă API-ul e neconfigurat local (dev fără .env
 * complet), oferim un fallback: input text pentru id-ul punctului.
 */
export function PickupPointSelect({
  type,
  county,
  locality,
  value,
  onChange,
  disabled,
}: Props) {
  const [points, setPoints] = useState<FanCourierPickupPoint[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "ok" | "unconfigured" | "error">(
    "idle",
  );
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [manualId, setManualId] = useState(value?.id ?? "");
  const [query, setQuery] = useState("");

  // Fetch pe mount pentru fiecare tip nou — luăm TOATE punctele (~5k pt
  // FANbox). Filtrarea pe județ/localitate se face client-side ca să nu
  // refetch-uim la fiecare tastă în input-uri.
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setState("loading");

    fetch(`/api/fancourier/pickup-points?type=${encodeURIComponent(type)}`, {
      signal: ctrl.signal,
    })
      .then((r) => r.json() as Promise<ApiResponse>)
      .then((json) => {
        if (!json.ok) {
          setState("error");
          setErrMsg(json.error);
          return;
        }
        if (!json.configured) {
          setState("unconfigured");
          setErrMsg(json.message);
          return;
        }
        setPoints(json.points);
        setState("ok");
        setErrMsg(null);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setState("error");
        setErrMsg(String(err));
      });

    return () => ctrl.abort();
  }, [type]);

  const norm = (s: string) => s.toLowerCase();

  /* Filtrarea combină `query` (căutare liberă) cu județul/localitatea pre-
     completate în formularul de checkout — dacă user-ul le-a scris deja,
     lista pornește restrânsă la zona lui. Dacă vrea altundeva, șterge sau
     scrie explicit în search. */
  const filtered = points.filter((p) => {
    if (query.trim()) {
      const q = norm(query);
      const inName = norm(p.name).includes(q);
      const inStreet = norm(p.address.street ?? "").includes(q);
      const inLocality = norm(p.address.locality ?? "").includes(q);
      const inCounty = norm(p.address.county ?? "").includes(q);
      if (!(inName || inStreet || inLocality || inCounty)) return false;
      return true;
    }
    // Fără query: preferă zona clientului (dacă a completat)
    if (county && !norm(p.address.county ?? "").includes(norm(county))) return false;
    if (locality && !norm(p.address.locality ?? "").includes(norm(locality)))
      return false;
    return true;
  });

  function selectPoint(p: FanCourierPickupPoint) {
    onChange({
      id: p.id,
      name: p.name,
      address: [
        p.address.street,
        p.address.streetNo,
        p.address.locality,
        p.address.county,
      ]
        .filter(Boolean)
        .join(", "),
    });
  }

  function applyManual() {
    const id = manualId.trim();
    if (!id) {
      onChange(null);
      return;
    }
    onChange({ id, name: `Punct ${type} · ${id}`, address: "" });
  }

  return (
    <div className="field">
      <label>
        Punct de ridicare <span className="req">*</span>
      </label>

      {state === "loading" && (
        <p className="step-note" style={{ marginTop: 6 }}>
          Se încarcă lista de lockere FANbox din toată țara…
        </p>
      )}

      {state === "unconfigured" && (
        <div>
          <p className="step-note" style={{ marginTop: 6, color: "#a86000" }}>
            {errMsg}
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              className="input"
              placeholder="ID punct (ex: FAN0033)"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              disabled={disabled}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn-outline"
              onClick={applyManual}
            >
              aplică
            </button>
          </div>
        </div>
      )}

      {state === "error" && (
        <p className="step-error" style={{ marginTop: 6 }}>
          {errMsg}
        </p>
      )}

      {state === "ok" && (
        <>
          <input
            type="search"
            className="input"
            placeholder={`Caută după nume, stradă, cartier sau oraș · ${points.length} puncte`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={disabled}
            style={{ marginBottom: 8 }}
          />
          {filtered.length === 0 ? (
            <p className="step-note" style={{ marginTop: 6 }}>
              Nu am găsit nimic. Șterge din text sau caută alt oraș.
            </p>
          ) : (
            <select
              className="select"
              value={value?.id ?? ""}
              onChange={(e) => {
                const p = filtered.find((x) => x.id === e.target.value);
                if (p) selectPoint(p);
                else onChange(null);
              }}
              disabled={disabled}
              size={Math.min(8, Math.max(3, filtered.length))}
            >
              <option value="">
                Alege lockerul ({filtered.length} găsite
                {county && !query ? ` în ${county}` : ""})
              </option>
              {filtered.slice(0, 200).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.address.locality} · {p.name} — {p.address.street}{" "}
                  {p.address.streetNo}
                </option>
              ))}
              {filtered.length > 200 && (
                <option disabled>
                  … și încă {filtered.length - 200}. Restrânge cu search.
                </option>
              )}
            </select>
          )}
          {value && (
            <p className="step-note" style={{ marginTop: 6, color: "#3E4336" }}>
              ✓ {value.name}
              {value.address ? ` · ${value.address}` : ""}
            </p>
          )}
        </>
      )}
    </div>
  );
}
