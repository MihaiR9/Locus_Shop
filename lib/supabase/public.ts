import { createClient } from "@supabase/supabase-js";

/**
 * Cookies-FREE Supabase client with the public anon key.
 *
 * Use for any query that:
 *   - reads public catalog data (products, prices), AND
 *   - may run in a context where there's no HTTP request available
 *     (e.g., `generateStaticParams`, ISR revalidation, build-time
 *     metadata generation).
 *
 * Server components rendering inside a request use `getSupabaseServerClient`
 * instead — that one bridges Next.js cookies so the auth session is
 * visible to RLS for user-specific data (their orders, addresses).
 *
 * RLS is still enforced here; anon can only read rows where catalog
 * policies allow (e.g., `products.active = true`).
 */
export function getSupabasePublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase env missing. Copy .env.local.example to .env.local and fill it in.",
    );
  }
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
