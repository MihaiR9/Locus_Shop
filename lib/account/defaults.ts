import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Shipping, Billing } from "@/lib/checkout-store";

/**
 * Preferințe de checkout salvate pe cont, pentru pre-completare la
 * următoarele comenzi. Le încărcăm în /checkout server component și
 * le trimitem la client ca props.
 */

export type SavedAddress = {
  id: string;
  kind: string;
  name: string; // first_name + last_name concat, sau customers.name
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  county: string;
  zip: string | null;
  isDefault: boolean;
};

export type SavedBilling = {
  id: string;
  type: "fizica" | "juridica";
  label: string | null;
  // fizica
  cnp: string | null;
  // juridica
  company: string | null;
  cui: string | null;
  regNo: string | null;
  iban: string | null;
  hqAddress: string | null;
  isDefault: boolean;
};

export type SavedPickupPoint = {
  id: string;
  name: string;
  address: string;
};

export type AccountDefaults = {
  addresses: SavedAddress[];
  billingProfiles: SavedBilling[];
  favoritePickupPoint: SavedPickupPoint | null;
  /** Datele de bază ale customer-ului (pentru pre-fill nume/email/telefon). */
  customerName: string | null;
  customerEmail: string;
  customerPhone: string | null;
};

/** Încarcă tot ce a salvat un customer pentru pre-fill în checkout. */
export async function getAccountDefaults(
  customerId: string,
): Promise<AccountDefaults | null> {
  const supabase = await getSupabaseServerClient();

  const { data: customer } = await supabase
    .from("customers")
    .select(
      "email, name, phone, favorite_pickup_point_id, favorite_pickup_point_name, favorite_pickup_point_address",
    )
    .eq("id", customerId)
    .maybeSingle();

  if (!customer) return null;

  const { data: addresses } = await supabase
    .from("addresses")
    .select("id, kind, line1, line2, city, county, zip, is_default")
    .eq("customer_id", customerId)
    .order("is_default", { ascending: false });

  const { data: billingProfiles } = await supabase
    .from("billing_profiles")
    .select(
      "id, type, label, cnp, company, cui, reg_no, iban, hq_address, is_default",
    )
    .eq("customer_id", customerId)
    .order("is_default", { ascending: false });

  return {
    addresses: (addresses ?? []).map((a) => ({
      id: a.id,
      kind: a.kind,
      name: customer.name ?? "",
      phone: customer.phone ?? "",
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      county: a.county,
      zip: a.zip,
      isDefault: a.is_default,
    })),
    billingProfiles: (billingProfiles ?? []).map((b) => ({
      id: b.id,
      type: b.type as "fizica" | "juridica",
      label: b.label,
      cnp: b.cnp,
      company: b.company,
      cui: b.cui,
      regNo: b.reg_no,
      iban: b.iban,
      hqAddress: b.hq_address,
      isDefault: b.is_default,
    })),
    favoritePickupPoint: customer.favorite_pickup_point_id
      ? {
          id: customer.favorite_pickup_point_id,
          name: customer.favorite_pickup_point_name ?? "",
          address: customer.favorite_pickup_point_address ?? "",
        }
      : null,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
  };
}

/**
 * După o comandă reușită, salvăm datele pe contul customer-ului dacă
 * customer_id există (logat). Guest-urile nu au cont → skip.
 *
 * Regula pentru default:
 *   • Prima adresă / billing salvate → devin automat default.
 *   • Cele adăugate ulterior → NU sunt default (user schimbă manual din UI).
 *
 * Deduplicare pe adresă: dacă există deja o adresă cu aceleași câmpuri
 * (linie1 + oraș + județ + zip), o refolosim în loc să inserăm duplicat.
 */
export async function saveAccountFromOrder(args: {
  customerId: string;
  shipping: Shipping;
  billing: Billing;
}): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { customerId, shipping, billing } = args;

  // ── Nume + telefon pe customer (dacă lipsesc) ──
  const { data: customer } = await supabase
    .from("customers")
    .select("name, phone")
    .eq("id", customerId)
    .maybeSingle();

  const patch: Record<string, string> = {};
  if (!customer?.name && shipping.method === "curier") {
    const full = `${shipping.firstName} ${shipping.lastName}`.trim();
    if (full) patch.name = full;
  }
  if (!customer?.phone) {
    const phone = shipping.method === "curier" ? shipping.phone : shipping.phone;
    if (phone) patch.phone = phone;
  }
  if (Object.keys(patch).length > 0) {
    await supabase.from("customers").update(patch).eq("id", customerId);
  }

  // ── Adresă livrare (doar dacă e curier cu adresă completă) ──
  if (shipping.method === "curier" && shipping.address && shipping.city) {
    const { data: existing } = await supabase
      .from("addresses")
      .select("id")
      .eq("customer_id", customerId)
      .eq("line1", shipping.address)
      .eq("city", shipping.city)
      .eq("county", shipping.county)
      .maybeSingle();

    if (!existing) {
      const { count } = await supabase
        .from("addresses")
        .select("id", { count: "exact", head: true })
        .eq("customer_id", customerId);
      const isFirst = (count ?? 0) === 0;

      await supabase.from("addresses").insert({
        customer_id: customerId,
        kind: "livrare",
        line1: shipping.address,
        line2: null,
        city: shipping.city,
        county: shipping.county,
        zip: shipping.zip || null,
        is_default: isFirst,
      });
    }
  }

  // ── FANbox favorit (dacă a fost selectat un punct FANbox) ──
  if (shipping.method === "curier" && shipping.pickupPointId) {
    await supabase
      .from("customers")
      .update({
        favorite_pickup_point_id: shipping.pickupPointId,
        favorite_pickup_point_name: shipping.pickupPointName ?? null,
        favorite_pickup_point_address: shipping.pickupPointAddress ?? null,
      })
      .eq("id", customerId);
  }

  // ── Billing profile ──
  const isFizica = billing.type === "fizica";
  /* Dedup:
     - juridica → CUI (unic per firmă)
     - fizica   → adresa (nume + adresă = profil unic; CNP nu-l mai cerem) */
  const dedupVal = isFizica
    ? [
        (billing as { address?: string }).address,
        (billing as { city?: string }).city,
        (billing as { county?: string }).county,
        (billing as { zip?: string }).zip,
      ]
        .filter(Boolean)
        .join(", ")
    : (billing as { cui?: string }).cui;

  let existingBillingId: string | null = null;
  if (dedupVal) {
    const { data: found } = await supabase
      .from("billing_profiles")
      .select("id")
      .eq("customer_id", customerId)
      .eq("type", billing.type)
      .eq(isFizica ? "hq_address" : "cui", dedupVal)
      .maybeSingle();
    existingBillingId = found?.id ?? null;
  }

  if (!existingBillingId) {
    const { count } = await supabase
      .from("billing_profiles")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", customerId);
    const isFirst = (count ?? 0) === 0;

    if (isFizica) {
      const b = billing as {
        firstName: string;
        lastName: string;
        cnp?: string;
        address?: string;
        city?: string;
        county?: string;
        zip?: string;
      };
      /* Adresa de facturare pentru fizica o îndesăm în hq_address (reutilizăm
         coloana — nu adăugăm alta separată). Serializare simplă cu virgule. */
      const addr = [b.address, b.city, b.county, b.zip]
        .filter(Boolean)
        .join(", ");
      await supabase.from("billing_profiles").insert({
        customer_id: customerId,
        type: "fizica",
        label: `${b.firstName} ${b.lastName}`.trim() || null,
        cnp: b.cnp || null,
        hq_address: addr || null,
        is_default: isFirst,
      });
    } else {
      const b = billing as {
        company: string;
        cui?: string;
        reg?: string;
        iban?: string;
        hq?: string;
      };
      await supabase.from("billing_profiles").insert({
        customer_id: customerId,
        type: "juridica",
        label: b.company || null,
        company: b.company,
        cui: b.cui || null,
        reg_no: b.reg || null,
        iban: b.iban || null,
        hq_address: b.hq || null,
        is_default: isFirst,
      });
    }
  }
}
