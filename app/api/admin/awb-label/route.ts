import { NextResponse, type NextRequest } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { getAwbLabel, FanCourierError } from "@/lib/fancourier/client";

/**
 * GET /api/admin/awb-label?awb=NNN&format=pdf|html
 *
 * Descarcă eticheta unui AWB direct din API-ul FanCourier și o servește
 * inline pentru print. Doar admin.
 */
export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const awb = searchParams.get("awb")?.trim();
  const format = searchParams.get("format") === "html" ? "html" : "pdf";

  if (!awb) {
    return NextResponse.json({ error: "awb lipsă" }, { status: 400 });
  }

  try {
    const { bytes, contentType } = await getAwbLabel([awb], {
      pdf: format === "pdf",
      language: "ro",
    });
    return new NextResponse(bytes, {
      headers: {
        "Content-Type":
          contentType ||
          (format === "pdf" ? "application/pdf" : "text/html; charset=utf-8"),
        "Content-Disposition": `inline; filename="AWB-${awb}.${format}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const msg =
      err instanceof FanCourierError
        ? `FanCourier: ${err.message}`
        : err instanceof Error
          ? err.message
          : "Eroare descărcare etichetă";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
