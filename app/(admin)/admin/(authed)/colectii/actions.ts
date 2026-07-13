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

export async function createCollection(formData: FormData): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const active = formData.get("active") === "on";

  if (!name) return { ok: false, error: "Numele e obligatoriu." };
  const slug = slugify(slugRaw || name);
  if (!slug) return { ok: false, error: "Slug invalid." };

  const supabase = await getSupabaseServerClient();

  const { data: existing } = await supabase
    .from("collections")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return { ok: false, error: `Slug "${slug}" deja folosit.` };

  const heroFile = formData.get("hero_image") as File | null;
  let heroUrl: string | null = null;
  if (heroFile && heroFile.size > 0) {
    const upload = await uploadToMedia(`collections/${slug}`, heroFile);
    if ("error" in upload) return { ok: false, error: `Upload: ${upload.error}` };
    heroUrl = upload.url;
  }

  const { error } = await supabase.from("collections").insert({
    slug,
    name,
    description,
    hero_image: heroUrl,
    active,
    sort_order: 999,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/colectii");
  redirect(`/admin/colectii/${slug}`);
}

export async function updateCollection(
  currentSlug: string,
  formData: FormData,
): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const active = formData.get("active") === "on";

  if (!name) return { ok: false, error: "Numele e obligatoriu." };
  const newSlug = slugify(slugRaw || name);

  const supabase = await getSupabaseServerClient();

  const { data: current } = await supabase
    .from("collections")
    .select("id, slug, hero_image")
    .eq("slug", currentSlug)
    .maybeSingle();
  if (!current) return { ok: false, error: "Colecția nu există." };

  if (newSlug !== currentSlug) {
    const { data: taken } = await supabase
      .from("collections")
      .select("id")
      .eq("slug", newSlug)
      .maybeSingle();
    if (taken) return { ok: false, error: `Slug "${newSlug}" deja folosit.` };
  }

  let heroUrl: string | null = current.hero_image;
  const heroFile = formData.get("hero_image") as File | null;
  if (heroFile && heroFile.size > 0) {
    const upload = await uploadToMedia(`collections/${newSlug}`, heroFile);
    if ("error" in upload) return { ok: false, error: `Upload: ${upload.error}` };
    heroUrl = upload.url;
  }

  const { error } = await supabase
    .from("collections")
    .update({
      slug: newSlug,
      name,
      description,
      hero_image: heroUrl,
      active,
    })
    .eq("id", current.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/colectii");
  revalidatePath(`/admin/colectii/${newSlug}`);
  if (newSlug !== currentSlug) redirect(`/admin/colectii/${newSlug}`);
  return { ok: true };
}

export async function deleteCollection(slug: string): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("collections").delete().eq("slug", slug);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/colectii");
  redirect("/admin/colectii");
}

export async function setCollectionProducts(
  slug: string,
  productIds: string[],
): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const supabase = await getSupabaseServerClient();
  const { data: coll } = await supabase
    .from("collections")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!coll) return { ok: false, error: "Colecția nu există." };

  // Wipe + reinsert (simple, atomic prin RLS + transaction PostgREST batch)
  const { error: delErr } = await supabase
    .from("collection_products")
    .delete()
    .eq("collection_id", coll.id);
  if (delErr) return { ok: false, error: delErr.message };

  if (productIds.length > 0) {
    const rows = productIds.map((pid, idx) => ({
      collection_id: coll.id,
      product_id: pid,
      sort_order: idx,
    }));
    const { error: insErr } = await supabase
      .from("collection_products")
      .insert(rows);
    if (insErr) return { ok: false, error: insErr.message };
  }

  revalidatePath(`/admin/colectii/${slug}`);
  return { ok: true };
}
