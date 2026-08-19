"use client";

import { useEffect, useState } from "react";
import type {
  FanCourierPickupPoint,
  FanCourierPickupType,
} from "@/lib/fancourier/types";

export type PickupPointsState =
  | { status: "idle"; points: [] }
  | { status: "loading"; points: [] }
  | { status: "ok"; points: FanCourierPickupPoint[] }
  | { status: "unconfigured"; points: []; message: string }
  | { status: "error"; points: []; message: string };

type ApiResponse =
  | { ok: true; configured: true; points: FanCourierPickupPoint[] }
  | { ok: true; configured: false; points: []; message: string }
  | { ok: false; error: string };

const IDLE: PickupPointsState = { status: "idle", points: [] };
const LOADING: PickupPointsState = { status: "loading", points: [] };

/* Lista are ~5000 de puncte și se schimbă rar, iar în același pas de
   checkout o cer două componente — dropdown-ul de localitate și selectorul
   de punct. Ținem promisiunea la nivel de modul, ca să plece un singur
   request pentru toată durata paginii. */
const inFlight = new Map<FanCourierPickupType, Promise<PickupPointsState>>();

function load(type: FanCourierPickupType): Promise<PickupPointsState> {
  const hit = inFlight.get(type);
  if (hit) return hit;

  const p = fetch(`/api/fancourier/pickup-points?type=${encodeURIComponent(type)}`)
    .then((r) => r.json() as Promise<ApiResponse>)
    .then((json): PickupPointsState => {
      if (!json.ok) return { status: "error", points: [], message: json.error };
      if (!json.configured)
        return { status: "unconfigured", points: [], message: json.message };
      return { status: "ok", points: json.points };
    })
    .catch((err): PickupPointsState => {
      /* Un eșec de rețea nu rămâne memorat — altfel clientul e blocat pe
         eroare până reîncarcă pagina, deși a doua încercare ar reuși. */
      inFlight.delete(type);
      return { status: "error", points: [], message: String(err) };
    });

  inFlight.set(type, p);
  return p;
}

/**
 * Punctele PUDO pentru un tip. `enabled` false lasă hook-ul inert — pe
 * tab-ul de livrare la ușă nu are rost să tragem 5000 de lockere.
 */
export function usePickupPoints(
  type: FanCourierPickupType,
  enabled = true,
): PickupPointsState {
  /* Ținem tipul lângă rezultat ca să nu servim, pentru o clipă, lista
     tipului anterior după ce s-a schimbat prop-ul. */
  const [entry, setEntry] = useState<{
    type: FanCourierPickupType;
    state: PickupPointsState;
  } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    load(type).then((state) => {
      if (alive) setEntry({ type, state });
    });
    return () => {
      alive = false;
    };
  }, [type, enabled]);

  if (!enabled) return IDLE;
  return entry?.type === type ? entry.state : LOADING;
}

/**
 * Normalizare pentru comparat nume de locuri.
 *
 * FanCourier livrează totul fără diacritice — „Bucuresti", „Galati",
 * „Timis" — în timp ce dropdown-ul nostru de județe folosește ortografia
 * corectă. Comparate direct, cele două nu se potrivesc niciodată, iar
 * clientul primea „nu există lockere" fix în județele mari.
 */
export function foldDiacritics(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    // ș/ț cu virgulă dedesubt nu se descompun în toate fonturile de date.
    .replace(/[șş]/gi, "s")
    .replace(/[țţ]/gi, "t")
    .trim()
    .toLowerCase();
}

/**
 * Localitățile distincte dintr-un județ, sortate românește. Sursa e chiar
 * lista de puncte: dacă un oraș nu apare aici, nu are locker, deci nu are
 * ce căuta în dropdown.
 */
export function localitiesInCounty(
  points: FanCourierPickupPoint[],
  county: string,
): string[] {
  if (!county.trim()) return [];
  const target = foldDiacritics(county);
  const seen = new Map<string, string>();
  for (const p of points) {
    if (foldDiacritics(p.address.county ?? "") !== target) continue;
    const locality = (p.address.locality ?? "").trim();
    if (!locality) continue;
    // Cheie normalizată — FanCourier scrie uneori aceeași localitate diferit.
    const key = foldDiacritics(locality);
    if (!seen.has(key)) seen.set(key, locality);
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b, "ro"));
}
