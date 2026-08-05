import { NextResponse, type NextRequest } from "next/server";
import { getPickupPoints, FanCourierError } from "@/lib/fancourier/client";
import type { FanCourierPickupType } from "@/lib/fancourier/types";

/**
 * GET /api/fancourier/pickup-points?type=fanbox|paypoint|office&county=X&locality=Y
 *
 * Returnează lista de puncte PUDO din API-ul FanCourier, filtrată local
 * după județ / localitate. Rezultatul e cache-uit pe edge 1h (lista se
 * schimbă rar), și 24h pe browser.
 *
 * Dacă lipsesc credențialele FC (dev local fără .env.local complet) →
 * răspunde 200 cu listă goală + `configured: false`, ca UI-ul să poată
 * afișa un fallback (input manual pentru id-ul punctului).
 */

const VALID_TYPES: FanCourierPickupType[] = ["fanbox", "paypoint", "office"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as FanCourierPickupType | null;
  const county = searchParams.get("county")?.trim().toLowerCase() ?? "";
  const locality = searchParams.get("locality")?.trim().toLowerCase() ?? "";

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { ok: false, error: "type invalid — folosește fanbox/paypoint/office" },
      { status: 400 },
    );
  }

  try {
    const all = await getPickupPoints(type);
    const filtered = all.filter((p) => {
      if (county && !p.address.county.toLowerCase().includes(county)) return false;
      if (locality && !p.address.locality.toLowerCase().includes(locality)) return false;
      return true;
    });

    return NextResponse.json(
      { ok: true, configured: true, points: filtered },
      {
        headers: {
          "Cache-Control":
            "public, max-age=86400, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (err) {
    const isConfigError =
      err instanceof FanCourierError && err.message.startsWith("Lipsește env");
    if (isConfigError) {
      return NextResponse.json({
        ok: true,
        configured: false,
        points: [],
        message:
          "FanCourier neconfigurat local. Introdu manual id-ul punctului de ridicare (îl copiezi din selfAWB).",
      });
    }
    console.error("[api/fancourier/pickup-points]", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "Nu am putut lua lista punctelor FanCourier.",
      },
      { status: 500 },
    );
  }
}
