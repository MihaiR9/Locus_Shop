import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Upload la Supabase Storage bucket "media". Foloseste sesiunea admin
 * (RLS policy media_admin_insert). Returnează public URL.
 */
export async function uploadToMedia(
  folder: string,
  file: File,
): Promise<{ url: string } | { error: string }> {
  const supabase = await getSupabaseServerClient();

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  const path = `${folder}/${Date.now()}-${safeName}`;

  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from("media")
    .upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (error) return { error: error.message };

  const { data: publicData } = supabase.storage
    .from("media")
    .getPublicUrl(path);

  return { url: publicData.publicUrl };
}
