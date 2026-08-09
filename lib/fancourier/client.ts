import "server-only";
import type {
  FanCourierPickupPoint,
  FanCourierPickupType,
  FanCourierResponse,
  FanCourierService,
  FanCourierShipment,
  FanCourierTariffResponse,
} from "./types";

/**
 * FanCourier client — wrap peste https://api.fancourier.ro/
 *
 * Auth-ul se face cu `POST /login` care returnează un token cu valabilitate
 * 24h. Îl cache-uim în memorie (per instanță server) și îl refolosim.
 * Pentru webhook-uri / cron-uri, token-ul e refetch-uit dacă e mai vechi
 * de 23h.
 *
 * Toate funcțiile aruncă `FanCourierError` la eșec — apelantul e responsabil
 * să prindă și să propage un mesaj user-friendly (ex: server action).
 */

const BASE_URL = "https://api.fancourier.ro";
const TOKEN_TTL_MS = 23 * 60 * 60 * 1000; // 23h — refresh înainte de expirare

let cached: { token: string; expiresAt: number } | null = null;

export class FanCourierError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "FanCourierError";
    this.status = status;
    this.body = body;
  }
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new FanCourierError(`Lipsește env ${name}`, 500, null);
  return v;
}

function getClientId(): number {
  const v = requireEnv("FANCOURIER_CLIENT_ID");
  const n = Number(v);
  if (!Number.isFinite(n)) {
    throw new FanCourierError("FANCOURIER_CLIENT_ID trebuie să fie numeric", 500, v);
  }
  return n;
}

async function login(): Promise<string> {
  const username = requireEnv("FANCOURIER_USERNAME");
  const password = requireEnv("FANCOURIER_PASSWORD");
  const url = `${BASE_URL}/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
  const res = await fetch(url, { method: "POST", cache: "no-store" });
  const body = (await res.json().catch(() => ({}))) as {
    token?: string;
    data?: { token?: string };
    status?: string;
    message?: string;
  };
  /* API-ul FC întoarce fie `{token}` direct (vechi, ca în PDF v2.0 din
     mai 2023), fie `{status, data: {token, expiresAt}}` (actualizat).
     Acceptăm ambele forme. */
  const token = body?.token ?? body?.data?.token;
  if (!res.ok || !token) {
    throw new FanCourierError("Login FanCourier eșuat", res.status, body);
  }
  return token;
}

async function getToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now()) return cached.token;
  const token = await login();
  cached = { token, expiresAt: Date.now() + TOKEN_TTL_MS };
  return token;
}

/** Forțează un login nou — util dacă primești 401 pe un endpoint. */
export function invalidateFanCourierToken() {
  cached = null;
}

type RequestInitJson = Omit<RequestInit, "body"> & { jsonBody?: unknown };

async function request<T>(
  path: string,
  init: RequestInitJson = {},
  retryOn401 = true,
): Promise<T> {
  const token = await getToken();
  const { jsonBody, headers, ...rest } = init;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(jsonBody !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: jsonBody !== undefined ? JSON.stringify(jsonBody) : undefined,
    cache: "no-store",
  });

  if (res.status === 401 && retryOn401) {
    invalidateFanCourierToken();
    return request<T>(path, init, false);
  }

  const raw = await res.text();
  const parsed = raw ? safeParseJson(raw) : null;

  if (!res.ok) {
    const fromBody =
      parsed && typeof parsed === "object" && "message" in parsed
        ? String((parsed as { message: unknown }).message)
        : null;
    throw new FanCourierError(
      fromBody ?? `FanCourier ${path} → ${res.status}`,
      res.status,
      parsed ?? raw,
    );
  }
  return parsed as T;
}

function safeParseJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

/* ─── Endpoints ─────────────────────────────────────────────── */

/** Calculează tariful unei expediții. Returnează costul în lei (cu TVA). */
export async function getInternalTariff(args: {
  service: FanCourierService;
  weightKg: number;
  parcels: number;
  recipientLocality: string;
  recipientCounty: string;
  payment?: "sender" | "recipient";
  declaredValueRon?: number;
  options?: string[];
  dimensions?: { length: number; width: number; height: number };
}): Promise<FanCourierTariffResponse> {
  const params = new URLSearchParams({
    clientId: String(getClientId()),
    "info[service]": args.service,
    "info[payment]": args.payment ?? "sender",
    "info[weight]": String(args.weightKg),
    "info[packages][parcel]": String(args.parcels),
    "recipient[locality]": args.recipientLocality,
    "recipient[county]": args.recipientCounty,
  });
  if (args.declaredValueRon)
    params.set("info[declaredValue]", String(args.declaredValueRon));
  if (args.dimensions) {
    params.set("info[dimensions][length]", String(args.dimensions.length));
    params.set("info[dimensions][width]", String(args.dimensions.width));
    params.set("info[dimensions][height]", String(args.dimensions.height));
  }
  args.options?.forEach((o) => params.append("info[options][]", o));

  const res = await request<FanCourierResponse<FanCourierTariffResponse>>(
    `/reports/awb/internal-tariff?${params.toString()}`,
  );
  return res.data;
}

/** Creează un AWB. Returnează numărul AWB (string). */
export async function createInternalAwb(
  shipment: FanCourierShipment,
): Promise<{ awbNumber: string; raw: unknown }> {
  const body = { clientId: getClientId(), shipments: [shipment] };
  const res = await request<unknown>("/intern-awb", {
    method: "POST",
    jsonBody: body,
  });

  /* API-ul FC returnează AWB-ul cu naming diferit față de versiunea din
     PDF. Am văzut în practică: `data[0].awbNumber`, `data[0].awb`,
     `data.awbNumber` (nu în array), sau chiar `data` = string direct.
     Extragem defensiv toate variantele + log complet la eșec. */
  const extractAwb = (obj: unknown): string | null => {
    if (!obj) return null;
    if (typeof obj === "string") return obj;
    if (typeof obj === "number") return String(obj);
    if (typeof obj !== "object") return null;
    const rec = obj as Record<string, unknown>;
    const candidates = [
      rec.awbNumber,
      rec.awb,
      rec.number,
      rec.awb_number,
      rec.awbNo,
      rec.awb_no,
    ];
    for (const c of candidates) {
      if (typeof c === "string" && c.trim()) return c.trim();
      if (typeof c === "number") return String(c);
    }
    return null;
  };

  /* Response format actual (nu cel din PDF v2.0):
     { "response": [ { "awbNumber": 7000...657, "tariff": ..., ... } ] }
     Verificăm both `response` și `data` (retro-compat cu vechiul format). */
  const root = res as {
    response?: unknown;
    data?: unknown;
    message?: string;
    status?: string;
  };
  const data = root?.response ?? root?.data;

  let awb: string | null = null;
  if (Array.isArray(data)) {
    for (const it of data) {
      awb = extractAwb(it);
      if (awb) break;
    }
  } else {
    awb = extractAwb(data);
  }

  if (!awb) {
    console.error("[FanCourier] AWB response fără număr identificabil:", JSON.stringify(res));
    const msg =
      (Array.isArray(data) && data[0] && typeof data[0] === "object"
        ? (data[0] as { message?: string; error?: string }).message ??
          (data[0] as { message?: string; error?: string }).error
        : null) ??
      root.message ??
      "răspuns neașteptat (verifică log-urile serverului pentru raw body)";
    throw new FanCourierError(
      `AWB creat fără număr — ${msg}`,
      500,
      res,
    );
  }
  return { awbNumber: awb, raw: res };
}

/** Șterge un AWB din borderou. Merge doar dacă nu a plecat curierul cu el. */
export async function deleteAwb(awbNumber: string): Promise<void> {
  const params = new URLSearchParams({
    clientId: String(getClientId()),
    awb: awbNumber,
  });
  await request(`/awb?${params.toString()}`, { method: "DELETE" });
}

/**
 * Descarcă eticheta unui AWB (sau mai multor). Returnează bytes (PDF sau HTML).
 * Setează `pdf=true` pentru PDF, altfel HTML.
 */
export async function getAwbLabel(
  awbNumbers: string[],
  opts: { pdf?: boolean; language?: "ro" | "en" } = {},
): Promise<{ bytes: ArrayBuffer; contentType: string }> {
  const params = new URLSearchParams({
    clientId: String(getClientId()),
    pdf: opts.pdf ? "1" : "0",
    ...(opts.language ? { language: opts.language } : {}),
  });
  awbNumbers.forEach((a) => params.append("awbs[]", a));

  const token = await getToken();
  const res = await fetch(
    `${BASE_URL}/awb/label?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new FanCourierError(
      `Descărcare etichetă eșuată (${res.status})`,
      res.status,
      body,
    );
  }
  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  const bytes = await res.arrayBuffer();
  return { bytes, contentType };
}

/** Tracking pentru unul sau mai multe AWB-uri. */
export async function trackAwb(
  awbNumbers: string[],
  language: "ro" | "en" = "ro",
): Promise<unknown> {
  const params = new URLSearchParams({
    clientId: String(getClientId()),
    language,
  });
  awbNumbers.forEach((a) => params.append("awb[]", a));
  const res = await request<FanCourierResponse<unknown>>(
    `/reports/awb/tracking?${params.toString()}`,
  );
  return res.data;
}

/** Listă puncte PUDO — FANbox, PayPoint, sau sedii FAN. */
export async function getPickupPoints(
  type: FanCourierPickupType,
): Promise<FanCourierPickupPoint[]> {
  const res = await request<FanCourierResponse<FanCourierPickupPoint[]>>(
    `/reports/pickup-points?type=${encodeURIComponent(type)}`,
  );
  return res.data;
}

/** Detaliile unui punct anume. */
export async function getPickupPointById(
  id: string,
): Promise<FanCourierPickupPoint | null> {
  const res = await request<FanCourierResponse<FanCourierPickupPoint[]>>(
    `/reports/pickup-points?id=${encodeURIComponent(id)}`,
  );
  return res.data?.[0] ?? null;
}
