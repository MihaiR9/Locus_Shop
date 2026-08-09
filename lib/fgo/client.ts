import "server-only";
import { createHash } from "node:crypto";
import type {
  FgoEmitereRequest,
  FgoEmitereResponse,
  FgoPrintResponse,
  FgoSimpleResponse,
  FgoStatusResponse,
} from "./types";

/**
 * FGO API client — wrap peste https://api.fgo.ro/v1/ (sau testuat).
 *
 * Hash-ul: SHA-1 uppercase de concat(CodUnic + PrivateKey + <context>)
 * Contextul diferă după endpoint:
 *   • emitere → nume client (Denumire)
 *   • anulare/print/stergere/status → numărul facturii (fără serie)
 *   • articole → doar CodUnic + PrivateKey
 *
 * Limitare 1 request/secundă per endpoint (nu impunem client-side —
 * assumăm frecvență mică pentru cazul de admin).
 */

export class FgoError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "FgoError";
    this.status = status;
    this.body = body;
  }
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v)
    throw new FgoError(
      `Lipsește ${name}. Setează env vars FGO (vezi .env.local.example).`,
      500,
      null,
    );
  return v;
}

function getBaseUrl(): string {
  return (process.env.FGO_BASE_URL ?? "https://api-testuat.fgo.ro/v1").replace(
    /\/+$/,
    "",
  );
}

/** SHA-1 uppercase. */
function sha1Upper(s: string): string {
  return createHash("sha1").update(s, "utf8").digest("hex").toUpperCase();
}

/** Hash pentru emitere: CodUnic + PrivateKey + DenumireClient. */
export function hashForEmitere(codUnic: string, privateKey: string, denumire: string): string {
  return sha1Upper(codUnic + privateKey + denumire);
}

/** Hash pentru anulare/print/stergere/status: CodUnic + PrivateKey + NumarFactura. */
export function hashForInvoiceNumber(codUnic: string, privateKey: string, numar: string): string {
  return sha1Upper(codUnic + privateKey + numar);
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const bodyStr = JSON.stringify(body);
  console.log(`[FGO] POST ${url}`);
  console.log(`[FGO] REQUEST body:`, bodyStr.substring(0, 2000));
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: bodyStr,
    cache: "no-store",
  });
  const raw = await res.text();
  console.log(`[FGO] RESPONSE ${res.status}:`, raw.substring(0, 2000));
  let parsed: unknown = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = raw;
  }
  if (!res.ok) {
    throw new FgoError(
      `FGO ${path} → ${res.status}`,
      res.status,
      parsed ?? raw,
    );
  }
  return parsed as T;
}

/* ─── Endpoints ────────────────────────────────────────────── */

/**
 * Emite o factură. Primești Numar+Serie+Link către PDF.
 * Payload-ul (Client + Continut) e responsabilitatea apelantului —
 * vezi `build-invoice.ts` pentru construirea din order.
 */
export async function emitereFactura(payload: {
  client: FgoEmitereRequest["Client"];
  continut: FgoEmitereRequest["Continut"];
  idExtern?: string;
  numar?: string;
  text?: string;
  explicatii?: string;
  tipFactura?: FgoEmitereRequest["TipFactura"];
  dataEmitere?: string;
  dataScadenta?: string;
}): Promise<FgoEmitereResponse> {
  const codUnic = requireEnv("FGO_COD_UNIC");
  const privateKey = requireEnv("FGO_PRIVATE_KEY");
  const serie = requireEnv("FGO_SERIE");
  const platformaUrl = requireEnv("FGO_PLATFORMA_URL");

  const body: FgoEmitereRequest = {
    CodUnic: codUnic,
    Hash: hashForEmitere(codUnic, privateKey, payload.client.Denumire),
    Valuta: "RON",
    TipFactura: payload.tipFactura ?? "Factura",
    Serie: serie,
    Client: payload.client,
    Continut: payload.continut,
    PlatformaUrl: platformaUrl,
    ...(payload.numar ? { Numar: payload.numar } : {}),
    ...(payload.idExtern ? { IdExtern: payload.idExtern } : {}),
    ...(payload.text ? { Text: payload.text } : {}),
    ...(payload.explicatii ? { Explicatii: payload.explicatii } : {}),
    ...(payload.dataEmitere ? { DataEmitere: payload.dataEmitere } : {}),
    ...(payload.dataScadenta ? { DataScadenta: payload.dataScadenta } : {}),
    VerificareDuplicat: true,
  };

  return postJson<FgoEmitereResponse>("/factura/emitere", body);
}

/** Print — returnează link PDF (regenerate dacă e nevoie). */
export async function printFactura(args: {
  numar: string;
  serie: string;
}): Promise<FgoPrintResponse> {
  const codUnic = requireEnv("FGO_COD_UNIC");
  const privateKey = requireEnv("FGO_PRIVATE_KEY");
  const platformaUrl = requireEnv("FGO_PLATFORMA_URL");

  return postJson<FgoPrintResponse>("/factura/print", {
    CodUnic: codUnic,
    Hash: hashForInvoiceNumber(codUnic, privateKey, args.numar),
    Numar: args.numar,
    Serie: args.serie,
    PlatformaUrl: platformaUrl,
  });
}

/** Anulare (stornare în cont FGO, factura rămâne dar cu status anulat). */
export async function anulareFactura(args: {
  numar: string;
  serie: string;
}): Promise<FgoSimpleResponse> {
  const codUnic = requireEnv("FGO_COD_UNIC");
  const privateKey = requireEnv("FGO_PRIVATE_KEY");
  const platformaUrl = requireEnv("FGO_PLATFORMA_URL");

  return postJson<FgoSimpleResponse>("/factura/anulare", {
    CodUnic: codUnic,
    Hash: hashForInvoiceNumber(codUnic, privateKey, args.numar),
    Numar: args.numar,
    Serie: args.serie,
    PlatformaUrl: platformaUrl,
  });
}

/** Ștergere completă a facturii — util doar dacă a fost emisă greșit. */
export async function stergereFactura(args: {
  numar: string;
  serie: string;
}): Promise<FgoSimpleResponse> {
  const codUnic = requireEnv("FGO_COD_UNIC");
  const privateKey = requireEnv("FGO_PRIVATE_KEY");
  const platformaUrl = requireEnv("FGO_PLATFORMA_URL");

  return postJson<FgoSimpleResponse>("/factura/stergere", {
    CodUnic: codUnic,
    Hash: hashForInvoiceNumber(codUnic, privateKey, args.numar),
    Numar: args.numar,
    Serie: args.serie,
    PlatformaUrl: platformaUrl,
  });
}

/** Status factură — pentru reconciliere/verificare încasări. */
export async function getStatusFactura(args: {
  numar: string;
  serie: string;
}): Promise<FgoStatusResponse> {
  const codUnic = requireEnv("FGO_COD_UNIC");
  const privateKey = requireEnv("FGO_PRIVATE_KEY");
  const platformaUrl = requireEnv("FGO_PLATFORMA_URL");

  return postJson<FgoStatusResponse>("/factura/getstatus", {
    CodUnic: codUnic,
    Hash: hashForInvoiceNumber(codUnic, privateKey, args.numar),
    Numar: args.numar,
    Serie: args.serie,
    PlatformaUrl: platformaUrl,
  });
}
