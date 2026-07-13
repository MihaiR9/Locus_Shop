"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { uploadToMedia } from "@/lib/admin/storage";

type Result = { ok: true } | { ok: false; error: string };

async function requireAdmin(): Promise<Result> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Neautorizat." };
  return { ok: true };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function parseNumber(v: FormDataEntryValue | null): number | null {
  if (v === null) return null;
  const s = String(v).trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function parseIntOr(v: FormDataEntryValue | null, fallback = 0): number {
  const n = parseNumber(v);
  if (n === null) return fallback;
  return Math.round(n);
}

type ProductFormPayload = {
  code: string;
  slug: string;
  name: string;
  gama: "cuvinte" | "semne" | "pauze";
  type: "alb" | "rosu" | "rose";
  sweetness: "sec" | "demisec" | "dulce";
  bottleColor: "white" | "red" | "rose";
  abv: number;
  priceCents: number;
  stock: number;
  year: number | null;
  active: boolean;
  short: string | null;
  notes: string | null;
  taste: string | null;
  pair: string | null;
  glass: string | null;
  decant: string | null;
  ageNote: string | null;
  grape: string | null;
  servingTemp: string | null;
};

function extractPayload(formData: FormData): ProductFormPayload | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Numele e obligatoriu." };

  const codeRaw = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!/^[A-Z]{2}\d{2}$/.test(codeRaw)) {
    return { error: 'Codul are formatul "LC01" (2 litere + 2 cifre).' };
  }

  const slug = slugify(String(formData.get("slug") ?? "") || name);
  if (!slug) return { error: "Slug invalid." };

  const gama = String(formData.get("gama") ?? "") as ProductFormPayload["gama"];
  if (!["cuvinte", "semne", "pauze"].includes(gama)) {
    return { error: "Gamă invalidă." };
  }
  const type = String(formData.get("type") ?? "") as ProductFormPayload["type"];
  if (!["alb", "rosu", "rose"].includes(type)) {
    return { error: "Tip invalid." };
  }
  const sweetness = String(
    formData.get("sweetness") ?? "",
  ) as ProductFormPayload["sweetness"];
  if (!["sec", "demisec", "dulce"].includes(sweetness)) {
    return { error: "Dulceață invalidă." };
  }
  const bottleColor = String(
    formData.get("bottle_color") ?? "",
  ) as ProductFormPayload["bottleColor"];
  if (!["white", "red", "rose"].includes(bottleColor)) {
    return { error: "Culoare sticlă invalidă." };
  }

  const abv = parseNumber(formData.get("abv")) ?? 0;
  const priceRon = parseNumber(formData.get("price_ron")) ?? 0;
  const priceCents = Math.round(priceRon * 100);
  const stock = parseIntOr(formData.get("stock"), 0);
  const year = parseNumber(formData.get("year"));
  const active = formData.get("active") === "on";

  const asStr = (k: string): string | null => {
    const v = String(formData.get(k) ?? "").trim();
    return v || null;
  };

  return {
    code: codeRaw,
    slug,
    name,
    gama,
    type,
    sweetness,
    bottleColor,
    abv,
    priceCents,
    stock,
    year: year !== null ? Math.round(year) : null,
    active,
    short: asStr("short"),
    notes: asStr("notes"),
    taste: asStr("taste"),
    pair: asStr("pair"),
    glass: asStr("glass"),
    decant: asStr("decant"),
    ageNote: asStr("age_note"),
    grape: asStr("grape"),
    servingTemp: asStr("serving_temp"),
  };
}

export async function createProduct(formData: FormData): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const payload = extractPayload(formData);
  if ("error" in payload) return { ok: false, error: payload.error };

  const supabase = await getSupabaseServerClient();

  const { data: existing } = await supabase
    .from("products")
    .select("id")
    .or(`code.eq.${payload.code},slug.eq.${payload.slug}`)
    .maybeSingle();
  if (existing) {
    return { ok: false, error: "Cod sau slug deja folosit." };
  }

  const { data: inserted, error } = await supabase
    .from("products")
    .insert({
      code: payload.code,
      slug: payload.slug,
      name: payload.name,
      gama: payload.gama,
      type: payload.type,
      sweetness: payload.sweetness,
      bottle_color: payload.bottleColor,
      abv: payload.abv,
      price_cents: payload.priceCents,
      stock: payload.stock,
      year: payload.year,
      active: payload.active,
      short: payload.short,
      notes: payload.notes,
      taste: payload.taste,
      pair: payload.pair,
      glass: payload.glass,
      decant: payload.decant,
      age_note: payload.ageNote,
      grape: payload.grape,
      serving_temp: payload.servingTemp,
    })
    .select("id, code")
    .single();

  if (error || !inserted) {
    return { ok: false, error: error?.message ?? "Nu am putut crea produsul." };
  }

  // Upload hero image dacă e furnizat
  const heroFile = formData.get("hero_image") as File | null;
  if (heroFile && heroFile.size > 0) {
    const upload = await uploadToMedia(`products/${payload.code}`, heroFile);
    if ("url" in upload) {
      await supabase
        .from("products")
        .update({ hero_image: upload.url })
        .eq("id", inserted.id);
    }
  }

  // Attach la colecții selectate
  const collectionIds = formData.getAll("collection_ids").map(String).filter(Boolean);
  if (collectionIds.length > 0) {
    const rows = collectionIds.map((cid) => ({
      collection_id: cid,
      product_id: inserted.id,
      sort_order: 999,
    }));
    await supabase.from("collection_products").insert(rows);
  }

  revalidatePath("/admin/produse");
  redirect(`/admin/produse/${inserted.code}`);
}

export async function updateProduct(
  currentCode: string,
  formData: FormData,
): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const payload = extractPayload(formData);
  if ("error" in payload) return { ok: false, error: payload.error };

  const supabase = await getSupabaseServerClient();

  const { data: current } = await supabase
    .from("products")
    .select("id, code, hero_image")
    .eq("code", currentCode)
    .maybeSingle();
  if (!current) return { ok: false, error: "Produsul nu există." };

  let heroUrl: string | null = current.hero_image;
  const heroFile = formData.get("hero_image") as File | null;
  if (heroFile && heroFile.size > 0) {
    const upload = await uploadToMedia(`products/${payload.code}`, heroFile);
    if ("url" in upload) heroUrl = upload.url;
  }

  const { error } = await supabase
    .from("products")
    .update({
      code: payload.code,
      slug: payload.slug,
      name: payload.name,
      gama: payload.gama,
      type: payload.type,
      sweetness: payload.sweetness,
      bottle_color: payload.bottleColor,
      abv: payload.abv,
      price_cents: payload.priceCents,
      stock: payload.stock,
      year: payload.year,
      active: payload.active,
      short: payload.short,
      notes: payload.notes,
      taste: payload.taste,
      pair: payload.pair,
      glass: payload.glass,
      decant: payload.decant,
      age_note: payload.ageNote,
      grape: payload.grape,
      serving_temp: payload.servingTemp,
      hero_image: heroUrl,
    })
    .eq("id", current.id);
  if (error) return { ok: false, error: error.message };

  // Update collections M2M — wipe + reinsert
  const collectionIds = formData.getAll("collection_ids").map(String).filter(Boolean);
  await supabase.from("collection_products").delete().eq("product_id", current.id);
  if (collectionIds.length > 0) {
    const rows = collectionIds.map((cid) => ({
      collection_id: cid,
      product_id: current.id,
      sort_order: 999,
    }));
    await supabase.from("collection_products").insert(rows);
  }

  revalidatePath("/admin/produse");
  revalidatePath(`/admin/produse/${payload.code}`);
  if (payload.code !== currentCode) redirect(`/admin/produse/${payload.code}`);
  return { ok: true };
}

export async function deleteProduct(code: string): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("products").delete().eq("code", code);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/produse");
  redirect("/admin/produse");
}
