"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getTemplateDef } from "@/lib/email/schema";
import { defaultBlocks, previewTemplate } from "@/lib/email/render";

type Result = { ok: true } | { ok: false; error: string };

async function requireAdmin(): Promise<Result> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Neautorizat." };
  return { ok: true };
}

export async function saveEmailTemplate(
  key: string,
  subject: string,
  blocks: Record<string, string>,
): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const def = getTemplateDef(key);
  if (!def) return { ok: false, error: "Template inexistent." };

  const trimmedSubject = subject.trim();
  if (!trimmedSubject) return { ok: false, error: "Subiectul e obligatoriu." };

  // Păstrăm doar cheile definite în schema — orice restul e ignorat.
  const validBlocks: Record<string, string> = {};
  def.blocks.forEach((b) => {
    const v = blocks[b.key];
    // Empty string = revert la default la render — dar salvăm ce a introdus user-ul.
    if (typeof v === "string") validBlocks[b.key] = v;
  });

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("email_templates")
    .upsert(
      {
        key,
        subject: trimmedSubject,
        blocks: validBlocks,
      },
      { onConflict: "key" },
    );

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/emailuri");
  revalidatePath(`/admin/emailuri/${key}`);
  return { ok: true };
}

/**
 * Preview cu blocurile curente (nesalvate). Rulează pipeline-ul de render
 * cu sample data din schema — folosit pentru iframe live în editor.
 */
export async function previewEmailTemplate(
  key: string,
  subject: string,
  blocks: Record<string, string>,
): Promise<{ ok: true; subject: string; html: string } | { ok: false; error: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  try {
    const { subject: renderedSubject, html } = previewTemplate(
      key,
      blocks,
      subject,
    );
    return { ok: true, subject: renderedSubject, html };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Preview failed",
    };
  }
}

/**
 * Reset la default — șterge row-ul din DB, render-ul revine la defaults
 * din schema.
 */
export async function resetEmailTemplate(key: string): Promise<Result> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const def = getTemplateDef(key);
  if (!def) return { ok: false, error: "Template inexistent." };

  const supabase = await getSupabaseServerClient();
  // Upsert cu defaults în loc de delete — păstrăm row-ul pentru consistență.
  const { error } = await supabase
    .from("email_templates")
    .upsert(
      {
        key,
        subject: def.subject,
        blocks: defaultBlocks(def),
      },
      { onConflict: "key" },
    );

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/emailuri");
  revalidatePath(`/admin/emailuri/${key}`);
  return { ok: true };
}
