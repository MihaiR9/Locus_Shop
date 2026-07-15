import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  ALL_EMAIL_TEMPLATES,
  getTemplateDef,
  type EmailTemplateDef,
} from "@/lib/email/schema";
import { defaultBlocks, seedTemplatesIfMissing } from "@/lib/email/render";

export type EmailTemplateRow = {
  key: string;
  name: string; // din schema
  description: string; // din schema
  destination: "client" | "admin";
  subject: string; // din DB sau default
  blocks: Record<string, string>; // din DB sau defaults
  updatedAt: string | null;
  isCustomized: boolean; // are DB row diferit de defaults
  variables: readonly string[];
};

/**
 * Listează toate template-urile editabile — merge datele din DB peste
 * schema (nume, descriere, blocks disponibile) și marchează dacă textul
 * a fost personalizat.
 *
 * Auto-seed la primul acces — dacă DB e gol, populăm cu default-urile.
 */
export async function listEmailTemplates(): Promise<EmailTemplateRow[]> {
  await seedTemplatesIfMissing();

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("email_templates")
    .select("key, subject, blocks, updated_at");

  if (error) {
    console.error("[listEmailTemplates]", error.message);
  }

  const byKey = new Map<
    string,
    { subject: string; blocks: Record<string, string>; updatedAt: string }
  >();
  (data ?? []).forEach((r) => {
    byKey.set(r.key, {
      subject: r.subject,
      blocks: (r.blocks as Record<string, string> | null) ?? {},
      updatedAt: r.updated_at,
    });
  });

  return ALL_EMAIL_TEMPLATES.map((def) => rowFor(def, byKey.get(def.key)));
}

export async function getEmailTemplate(
  key: string,
): Promise<EmailTemplateRow | null> {
  const def = getTemplateDef(key);
  if (!def) return null;

  await seedTemplatesIfMissing();

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("email_templates")
    .select("subject, blocks, updated_at")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    console.error("[getEmailTemplate]", error.message);
    return rowFor(def, undefined);
  }

  return rowFor(
    def,
    data
      ? {
          subject: data.subject,
          blocks: (data.blocks as Record<string, string> | null) ?? {},
          updatedAt: data.updated_at,
        }
      : undefined,
  );
}

function rowFor(
  def: EmailTemplateDef,
  db:
    | { subject: string; blocks: Record<string, string>; updatedAt: string }
    | undefined,
): EmailTemplateRow {
  const defaults = defaultBlocks(def);
  const subject = db?.subject ?? def.subject;
  const blocks = { ...defaults, ...(db?.blocks ?? {}) };

  const isCustomized =
    !!db &&
    (db.subject !== def.subject ||
      def.blocks.some((b) => (db.blocks[b.key] ?? b.defaultValue) !== b.defaultValue));

  return {
    key: def.key,
    name: def.name,
    description: def.description,
    destination: def.destination,
    subject,
    blocks,
    updatedAt: db?.updatedAt ?? null,
    isCustomized,
    variables: def.variables,
  };
}
