import "server-only";
import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentAdmin = {
  authId: string;
  email: string;
  role: "admin";
};

/**
 * Returnează admin-ul logat sau `null`. Verifică:
 * 1. Sesiune Supabase validă.
 * 2. `app_metadata.role === "admin"`.
 *
 * Wrap-uit în React `cache()` → apeluri repetate în același RSC pass
 * (layout + pagină) fac un singur round-trip la Supabase.
 */
export const getCurrentAdmin = cache(
  async (): Promise<CurrentAdmin | null> => {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const role = (user.app_metadata as { role?: string } | undefined)?.role;
    if (role !== "admin") return null;

    return {
      authId: user.id,
      email: user.email ?? "",
      role: "admin",
    };
  },
);
