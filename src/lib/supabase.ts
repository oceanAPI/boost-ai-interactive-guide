import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the SERVICE-ROLE key.
 *
 * This key bypasses Row-Level Security, so it must NEVER reach the
 * browser. The `server-only` import above makes the build fail if this
 * module is ever pulled into a client bundle.
 *
 * All engagement data access goes through server actions that use this
 * client AFTER authorizing the caller against the Auth.js session — RLS
 * stays enabled as a deny-all backstop for any other access path.
 *
 * Env (Vercel + .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL      — project URL
 *   SUPABASE_SERVICE_ROLE_KEY     — service-role secret (server only)
 */
let cached: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/** True when Supabase is configured. Lets callers degrade gracefully
 *  (e.g. fall back to fragment-only mode) instead of throwing. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
