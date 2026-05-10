import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for the BROWSER. Uses the public anon key + RLS.
 * Use this in "use client" components for live queries, realtime, or
 * client-only mutations (e.g., upserting a wishlist row tied to the
 * current user). Never call from server code — use server.ts instead.
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase env missing. Copy .env.local.example to .env.local and fill it in.",
    );
  }
  return createBrowserClient(url, anonKey);
}
