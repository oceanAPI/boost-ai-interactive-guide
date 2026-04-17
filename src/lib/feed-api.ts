/**
 * Shared client for the "Feed me log" Cloudflare worker.
 *
 * If NEXT_PUBLIC_FEED_API_URL + NEXT_PUBLIC_FEED_CLIENT_TOKEN are set,
 * the feedback backlog and search log write to the worker and every
 * browser sees the same data. If they're not set, we silently fall
 * back to localStorage so local dev and any old build keeps working.
 */

export const FEED_API_URL = (process.env.NEXT_PUBLIC_FEED_API_URL || "").replace(/\/$/, "");
export const FEED_CLIENT_TOKEN = process.env.NEXT_PUBLIC_FEED_CLIENT_TOKEN || "";

export function isSharedBackendEnabled(): boolean {
  return Boolean(FEED_API_URL && FEED_CLIENT_TOKEN);
}

function authHeaders(adminPassword?: string): Record<string, string> {
  const h: Record<string, string> = { "content-type": "application/json" };
  if (FEED_CLIENT_TOKEN) h["x-client-token"] = FEED_CLIENT_TOKEN;
  if (adminPassword) h["x-admin-password"] = adminPassword;
  return h;
}

export async function feedPost<T = unknown>(
  path: string,
  body: unknown,
): Promise<T | null> {
  if (!isSharedBackendEnabled()) return null;
  try {
    const res = await fetch(`${FEED_API_URL}${path}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function feedGet<T = unknown>(
  path: string,
  adminPassword?: string,
): Promise<T | null> {
  if (!FEED_API_URL) return null;
  try {
    const res = await fetch(`${FEED_API_URL}${path}`, {
      method: "GET",
      headers: authHeaders(adminPassword),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function feedDelete(path: string, adminPassword?: string): Promise<boolean> {
  if (!FEED_API_URL) return false;
  try {
    const res = await fetch(`${FEED_API_URL}${path}`, {
      method: "DELETE",
      headers: authHeaders(adminPassword),
    });
    return res.ok;
  } catch {
    return false;
  }
}
