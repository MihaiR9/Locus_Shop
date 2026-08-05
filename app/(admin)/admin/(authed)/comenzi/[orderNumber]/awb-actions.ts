"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  createInternalAwb,
  deleteAwb as fcDeleteAwb,
  FanCourierError,
} from "@/lib/fancourier/client";
import type {
  FanCourierService,
  FanCourierShipment,
} from "@/lib/fancourier/types";
import type { ShippingMethodId } from "@/lib/shipping";

type Result<T = void> =
  | ({ ok: true } & (T extends void ? object : { data: T }))
  | { ok: false; error: string };

async function assertAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Neautorizat");
  return admin;
}

type ShippingAddressSnapshot = {
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  email?: string;
  line1?: string;
  address?: string;
  street?: string;
  city?: string;
  locality?: string;
  county?: string;
  zip?: string;
  zipCode?: string;
  serviceId?: ShippingMethodId;
};

/**
 * Generează un AWB FanCourier pentru comandă. Cere adminului să confirme
 * greutatea + dimensiunile (nu le știm automat — depinde de câte sticle).
 *
 * Serviciul + punctul PUDO se iau din snapshot-ul comenzii (dacă clientul a
 * ales FANbox/PayPoint/Office la checkout). Adminul le poate override-ui.
 */
export async function generateAwb(
  orderNumber: string,
  args: {
    weightKg: number;
    dimensions: { length: number; width: number; height: number };
    parcels?: number;
    /** Override serviciu FC dacă adminul vrea altceva decât ce a ales clientul. */
    serviceOverride?: FanCourierService | null;
    observation?: string;
  },
): Promise<Result<{ awbNumber: string }>> {
  try {
    await assertAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Neautorizat" };
  }

  const supabase = await getSupabaseServerClient();

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, shipping_method, shipping_address, courier_service, pickup_point_id, awb_number, guest_email, customers(email, name, phone)",
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (orderErr) {
    console.error("[generateAwb] order lookup failed", orderNumber, orderErr);
    /* Cel mai probabil: migrarea 0016_fancourier.sql nu a fost aplicată,
       deci coloanele `courier_service` / `pickup_point_id` nu există. */
    if (
      orderErr.message.includes("courier_service") ||
      orderErr.message.includes("pickup_point_id")
    ) {
      return {
        ok: false,
        error:
          "DB lipsă: rulează migrarea 0016_fancourier.sql pe Supabase (SQL editor). Detalii în CLAUDE / actions.",
      };
    }
    return { ok: false, error: `Eroare DB: ${orderErr.message}` };
  }
  if (!order) return { ok: false, error: "Comanda nu există." };
  if (order.awb_number) {
    return {
      ok: false,
      error: `Există deja AWB (${order.awb_number}). Șterge-l întâi dacă vrei să-l regenerezi.`,
    };
  }
  if (order.shipping_method !== "curier") {
    return {
      ok: false,
      error: "Comanda e cu ridicare personală — nu se emite AWB.",
    };
  }
  if (order.status !== "paid" && order.status !== "shipped") {
    return {
      ok: false,
      error: `Nu pot emite AWB — statusul e "${order.status}" (trebuie "paid").`,
    };
  }

  const addr = (order.shipping_address ?? {}) as ShippingAddressSnapshot;
  const cust = Array.isArray(order.customers) ? order.customers[0] : order.customers;

  const service = (args.serviceOverride ??
    (order.courier_service as FanCourierService | null) ??
    "Standard") as FanCourierService;

  const firstLast = [
    addr.first_name ?? addr.firstName,
    addr.last_name ?? addr.lastName,
  ]
    .filter(Boolean)
    .join(" ");
  const name = addr.name ?? firstLast ?? cust?.name ?? "";
  const phone = addr.phone ?? cust?.phone ?? "";
  const email = addr.email ?? cust?.email ?? order.guest_email ?? undefined;
  const county = addr.county ?? "";
  const locality = addr.city ?? addr.locality ?? "";

  if (!name || !phone || !county || !locality) {
    return {
      ok: false,
      error: `Date destinatar incomplete: ${[
        !name && "nume",
        !phone && "telefon",
        !county && "județ",
        !locality && "localitate",
      ]
        .filter(Boolean)
        .join(", ")}.`,
    };
  }

  // Adresa: dacă e Standard = adresa reală. Dacă e FANbox/PayPoint/Office
  // → strada = id-ul punctului PUDO (așa cere API-ul, vezi PDF pag. 19).
  const requiresPickup = service === "FANbox" || service === "CollectPoint";
  let street: string;
  let streetNo = "";
  let pickupLocation: string | undefined;

  if (requiresPickup) {
    if (!order.pickup_point_id) {
      return {
        ok: false,
        error: `Serviciul ${service} cere un punct PUDO — clientul nu a selectat unul.`,
      };
    }
    street = order.pickup_point_id;
    pickupLocation = order.pickup_point_id;
  } else {
    street = addr.line1 ?? addr.address ?? addr.street ?? "";
    if (!street) {
      /* Debug helper: dăm în mesaj cheile efective din snapshot ca să
         vedem instant dacă e alt naming (ex: `street1`, `addr1`, etc.). */
      return {
        ok: false,
        error: `Lipsește adresa de livrare în snapshot-ul comenzii. Câmpuri disponibile: ${Object.keys(addr).join(", ") || "(gol)"}.`,
      };
    }
  }

  const shipment: FanCourierShipment = {
    info: {
      service,
      packages: { parcel: args.parcels ?? 1, envelopes: 0 },
      weight: args.weightKg,
      cod: 0, // plată online — fără ramburs
      declaredValue: 0,
      payment: "sender",
      returnPayment: null,
      observation: args.observation ?? `Comanda ${orderNumber}`,
      content: `Comanda ${orderNumber}`,
      dimensions: args.dimensions,
      options: service === "FANbox" ? ["V"] : undefined,
    },
    recipient: {
      name,
      phone,
      email,
      address: {
        county,
        locality,
        street,
        streetNo,
        pickupLocation,
        zipCode: addr.zip ?? "",
      },
    },
  };

  let awbNumber: string;
  try {
    const res = await createInternalAwb(shipment);
    awbNumber = res.awbNumber;
  } catch (err) {
    const msg =
      err instanceof FanCourierError
        ? `FanCourier: ${err.message}`
        : err instanceof Error
          ? err.message
          : "Eșec necunoscut la FanCourier";
    await supabase.from("order_events").insert({
      order_id: order.id,
      type: "awb_generate_failed",
      payload: { error: msg, shipment: shipment as unknown as Record<string, unknown> },
    });
    return { ok: false, error: msg };
  }

  await supabase
    .from("orders")
    .update({
      awb_number: awbNumber,
      awb_created_at: new Date().toISOString(),
      courier_service: service,
    })
    .eq("id", order.id);

  await supabase.from("order_events").insert({
    order_id: order.id,
    type: "awb_generated",
    payload: {
      awb_number: awbNumber,
      service,
      weight_kg: args.weightKg,
      dimensions: args.dimensions,
    },
  });

  revalidatePath(`/admin/comenzi/${orderNumber}`);
  revalidatePath("/admin/comenzi");
  return { ok: true, data: { awbNumber } };
}

/** Anulează un AWB (dacă nu a plecat încă cu curierul). */
export async function cancelAwb(orderNumber: string): Promise<Result> {
  try {
    await assertAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Neautorizat" };
  }

  const supabase = await getSupabaseServerClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, awb_number, status")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) return { ok: false, error: "Comanda nu există." };
  if (!order.awb_number) return { ok: false, error: "Comanda nu are AWB." };

  try {
    await fcDeleteAwb(order.awb_number);
  } catch (err) {
    const msg =
      err instanceof FanCourierError
        ? `FanCourier: ${err.message}`
        : err instanceof Error
          ? err.message
          : "Eșec la ștergere AWB";
    return { ok: false, error: msg };
  }

  await supabase
    .from("orders")
    .update({
      awb_number: null,
      awb_created_at: null,
      // Dacă era deja marcată shipped, o revenim la paid — user va regenera AWB.
      ...(order.status === "shipped"
        ? { status: "paid", shipped_at: null }
        : {}),
    })
    .eq("id", order.id);

  await supabase.from("order_events").insert({
    order_id: order.id,
    type: "awb_cancelled",
    payload: { awb_number: order.awb_number },
  });

  revalidatePath(`/admin/comenzi/${orderNumber}`);
  revalidatePath("/admin/comenzi");
  return { ok: true };
}

/** Util informativ pentru UI. Nu apelează API — doar mapează serviciul. */
export async function getSuggestedShipmentSettings(orderNumber: string): Promise<{
  service: FanCourierService;
  pickupInfo: { id: string; name: string; address: string } | null;
} | null> {
  try {
    await assertAdmin();
  } catch {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "courier_service, pickup_point_id, pickup_point_name, pickup_point_address",
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) return null;

  return {
    service: (order.courier_service ?? "Standard") as FanCourierService,
    pickupInfo: order.pickup_point_id
      ? {
          id: order.pickup_point_id,
          name: order.pickup_point_name ?? "",
          address: order.pickup_point_address ?? "",
        }
      : null,
  };
}

