import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client with the SERVICE_ROLE key — bypasses RLS entirely.
 *
 * Use ONLY for:
 *   - Stripe webhooks (`/api/stripe/webhook`)
 *   - Cron jobs (reconciliere statusuri ANAF, retry webhook-uri pierdute)
 *   - Backfills / one-off admin scripts
 *
 * NEVER import this from a "use client" file or pass the key to the
 * browser. Treat it like a database password.
 */
export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY missing. Set it in .env.local (server-only).",
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
