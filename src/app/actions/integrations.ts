"use server";

import { auth } from "@/auth";
import { getServiceClient } from "@/lib/supabase";

/**
 * Integration persistence + live-fetch server actions.
 *
 * Connections are ORG-LEVEL: any operator on the allow-list can manage
 * every connection. Authorization is enforced here (the page's
 * client-side gate is cosmetic). RLS stays deny-all as a backstop.
 *
 * SECRETS NEVER TOUCH THE BROWSER OR THE DB. A connection stores the
 * NAME of an env var (auth_env_key, e.g. PLANHAT_API_TOKEN); the secret
 * value lives only in the server env. testConnection / fetchPreview read
 * process.env[auth_env_key] at call time, but ONLY after the name passes
 * a strict allow-list pattern, so the lookup can never be pointed at our
 * own secrets (SUPABASE_SERVICE_ROLE_KEY, AUTH_SECRET, …).
 */

const ALLOWED_INTEGRATION_EMAILS = [
  "dev@boost.ai",
  "mikal@boost.ai",
  "jakob@boost.ai",
];

/** Env-var names a connection is allowed to reference. Anything else is
 *  rejected, so the dynamic process.env[name] lookup is sandboxed to
 *  integration tokens and can't read our own platform secrets. */
const ENV_KEY_PATTERN = /^(PLANHAT|AWS)_[A-Z0-9_]+$/;

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export type Provider = "planhat" | "aws";
export type SourceKind = "provider" | "other" | "custom";

export interface ConnectionRow {
  id: string;
  owner_email: string;
  name: string;
  provider: Provider;
  endpoint: string | null;
  auth_env_key: string | null;
  status: "draft" | "connected";
  created_at: string;
  updated_at: string;
}

export interface FieldMapRow {
  id: string;
  connection_id: string;
  kind: SourceKind;
  source: string;
  target: string;
  transform: string;
  position: number;
}

export interface IntegrationsBundle {
  connections: ConnectionRow[];
  /** connection_id → ordered field-map rows */
  mapsByConnection: Record<string, FieldMapRow[]>;
}

/** Resolve the signed-in operator email, or null if not allow-listed. */
async function operatorEmail(): Promise<string | null> {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) return null;
  return ALLOWED_INTEGRATION_EMAILS.includes(email) ? email : null;
}

/** Validate an env-key NAME (never a secret). Empty is allowed (a
 *  connection can be saved before its token exists). */
function validateEnvKey(raw: string): Result<string> {
  const name = raw.trim();
  if (!name) return { ok: true, data: "" };
  if (name.length > 64) return { ok: false, error: "Env key name too long." };
  if (!ENV_KEY_PATTERN.test(name)) {
    return {
      ok: false,
      error:
        "Auth must be an ENV VAR NAME like PLANHAT_API_TOKEN or AWS_ROLE_ARN — never the secret itself.",
    };
  }
  return { ok: true, data: name };
}

/* ─── CRUD ─────────────────────────────────────────────────────── */

export async function listIntegrations(): Promise<Result<IntegrationsBundle>> {
  const email = await operatorEmail();
  if (!email) return { ok: false, error: "Not authorized." };

  const db = getServiceClient();
  const { data: connections, error: cErr } = await db
    .from("integration_connections")
    .select("*")
    .order("created_at", { ascending: true });
  if (cErr) return { ok: false, error: cErr.message };

  const { data: maps, error: mErr } = await db
    .from("integration_field_maps")
    .select("*")
    .order("position", { ascending: true });
  if (mErr) return { ok: false, error: mErr.message };

  const mapsByConnection: Record<string, FieldMapRow[]> = {};
  for (const m of (maps ?? []) as FieldMapRow[]) {
    (mapsByConnection[m.connection_id] ??= []).push(m);
  }

  return {
    ok: true,
    data: {
      connections: (connections ?? []) as ConnectionRow[],
      mapsByConnection,
    },
  };
}

export async function saveConnection(input: {
  id?: string;
  name: string;
  provider: Provider;
  endpoint: string;
  authEnvKey: string;
  status?: "draft" | "connected";
}): Promise<Result<{ id: string }>> {
  const email = await operatorEmail();
  if (!email) return { ok: false, error: "Not authorized." };

  const name = input.name.trim();
  if (!name) return { ok: false, error: "Name is required." };
  const envCheck = validateEnvKey(input.authEnvKey);
  if (!envCheck.ok) return envCheck;

  const db = getServiceClient();
  const patch = {
    name,
    provider: input.provider,
    endpoint: input.endpoint.trim() || null,
    auth_env_key: envCheck.data || null,
    status: input.status ?? "draft",
  };

  if (input.id) {
    const { error } = await db
      .from("integration_connections")
      .update(patch)
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: { id: input.id } };
  }

  const { data, error } = await db
    .from("integration_connections")
    .insert({ ...patch, owner_email: email })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: data.id } };
}

export async function deleteConnection(id: string): Promise<Result<{ id: string }>> {
  const email = await operatorEmail();
  if (!email) return { ok: false, error: "Not authorized." };

  const db = getServiceClient();
  const { error } = await db.from("integration_connections").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id } };
}

/** Replace the entire field map for a connection (delete-then-insert in
 *  position order). Simpler and race-free for a single-operator edit. */
export async function saveFieldMap(
  connectionId: string,
  mappings: { kind: SourceKind; source: string; target: string; transform: string }[],
): Promise<Result<{ count: number }>> {
  const email = await operatorEmail();
  if (!email) return { ok: false, error: "Not authorized." };

  const db = getServiceClient();
  const { error: delErr } = await db
    .from("integration_field_maps")
    .delete()
    .eq("connection_id", connectionId);
  if (delErr) return { ok: false, error: delErr.message };

  if (mappings.length === 0) return { ok: true, data: { count: 0 } };

  const rows = mappings.map((m, i) => ({
    connection_id: connectionId,
    kind: m.kind,
    source: m.source,
    target: m.target,
    transform: m.transform,
    position: i,
  }));
  const { error: insErr } = await db.from("integration_field_maps").insert(rows);
  if (insErr) return { ok: false, error: insErr.message };
  return { ok: true, data: { count: rows.length } };
}

/* ─── Live Planhat ─────────────────────────────────────────────── */

async function loadConnection(id: string): Promise<ConnectionRow | null> {
  const db = getServiceClient();
  const { data } = await db
    .from("integration_connections")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as ConnectionRow) ?? null;
}

/** Read the bearer token for a connection from the server env, after
 *  validating the env-key name. Returns the token or an error string. */
function resolveToken(conn: ConnectionRow): Result<string> {
  const key = (conn.auth_env_key ?? "").trim();
  if (!key) return { ok: false, error: "No auth env key set on this connection." };
  if (!ENV_KEY_PATTERN.test(key)) {
    return { ok: false, error: `Env key "${key}" is not an allowed integration key name.` };
  }
  const token = process.env[key];
  if (!token) {
    return {
      ok: false,
      error: `Env var ${key} is not set on the server. Add it in .env.local (dev) and Vercel env (prod), then restart.`,
    };
  }
  return { ok: true, data: token };
}

async function planhatGet(
  endpoint: string,
  path: string,
  token: string,
): Promise<{ status: number; ok: boolean; body: unknown; text: string }> {
  const base = (endpoint || "https://api.planhat.com").replace(/\/+$/, "");
  const url = `${base}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    const text = await res.text();
    let body: unknown = text;
    try {
      body = JSON.parse(text);
    } catch {
      /* leave as text */
    }
    return { status: res.status, ok: res.ok, body, text };
  } finally {
    clearTimeout(timer);
  }
}

/** Hit Planhat with the env token and report whether it authenticates. */
export async function testConnection(
  connectionId: string,
): Promise<Result<{ status: number; sampleCount: number; message: string }>> {
  const email = await operatorEmail();
  if (!email) return { ok: false, error: "Not authorized." };

  const conn = await loadConnection(connectionId);
  if (!conn) return { ok: false, error: "Connection not found." };
  if (conn.provider !== "planhat") {
    return { ok: false, error: "Live test currently supports Planhat connections only." };
  }

  const tok = resolveToken(conn);
  if (!tok.ok) return tok;

  try {
    const res = await planhatGet(conn.endpoint ?? "", "/companies?limit=1", tok.data);
    if (!res.ok) {
      const detail =
        typeof res.body === "object" && res.body
          ? JSON.stringify(res.body).slice(0, 300)
          : res.text.slice(0, 300);
      return {
        ok: false,
        error: `Planhat returned HTTP ${res.status}. ${detail}`,
      };
    }
    const arr = Array.isArray(res.body) ? res.body : [];
    return {
      ok: true,
      data: {
        status: res.status,
        sampleCount: arr.length,
        message: `Connected — Planhat responded ${res.status} with ${arr.length} sample company.`,
      },
    };
  } catch (e) {
    return { ok: false, error: `Network error reaching Planhat: ${(e as Error).message}` };
  }
}

/** Resolve a dot path against an object. Tries the literal path first,
 *  then the path with its first segment stripped (so the catalog's
 *  logical prefixes like "company." / "metrics." fall through to the
 *  real Planhat shape, where the company object IS the root). */
function getPath(obj: unknown, path: string): unknown {
  const direct = walk(obj, path.split("."));
  if (direct !== undefined) return direct;
  const parts = path.split(".");
  if (parts.length > 1) return walk(obj, parts.slice(1));
  return undefined;
}
function walk(obj: unknown, parts: string[]): unknown {
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

/** Fetch one Planhat company (by id or name substring) and run the
 *  saved field map against it. Returns the raw object (so the operator
 *  can correct paths against reality) plus the mapped key→value preview
 *  and a list of source paths that didn't resolve. */
export async function fetchPreview(
  connectionId: string,
  query: string,
): Promise<
  Result<{
    company: { id?: string; name?: string };
    raw: unknown;
    mapped: { target: string; value: unknown; sourceLabel: string }[];
    unresolved: string[];
  }>
> {
  const email = await operatorEmail();
  if (!email) return { ok: false, error: "Not authorized." };

  const conn = await loadConnection(connectionId);
  if (!conn) return { ok: false, error: "Connection not found." };
  if (conn.provider !== "planhat") {
    return { ok: false, error: "Live fetch currently supports Planhat connections only." };
  }

  const tok = resolveToken(conn);
  if (!tok.ok) return tok;

  const db = getServiceClient();
  const { data: mapRows } = await db
    .from("integration_field_maps")
    .select("*")
    .eq("connection_id", connectionId)
    .order("position", { ascending: true });
  const maps = (mapRows ?? []) as FieldMapRow[];

  try {
    const q = query.trim();
    // 24-hex looks like a Mongo/Planhat id → fetch directly; else list+filter.
    const isId = /^[a-f0-9]{24}$/i.test(q);
    let company: Record<string, unknown> | null = null;

    if (isId) {
      const res = await planhatGet(conn.endpoint ?? "", `/companies/${q}`, tok.data);
      if (!res.ok) {
        return { ok: false, error: `Planhat HTTP ${res.status} fetching company ${q}.` };
      }
      company = (res.body as Record<string, unknown>) ?? null;
    } else {
      const res = await planhatGet(conn.endpoint ?? "", "/companies?limit=50", tok.data);
      if (!res.ok) {
        const detail =
          typeof res.body === "object" && res.body
            ? JSON.stringify(res.body).slice(0, 300)
            : res.text.slice(0, 300);
        return { ok: false, error: `Planhat HTTP ${res.status} listing companies. ${detail}` };
      }
      const list = Array.isArray(res.body) ? (res.body as Record<string, unknown>[]) : [];
      if (list.length === 0) return { ok: false, error: "Planhat returned no companies." };
      company = q
        ? list.find((c) =>
            String((c.name as string) ?? "").toLowerCase().includes(q.toLowerCase()),
          ) ?? null
        : list[0];
      if (!company) {
        return { ok: false, error: `No company name matched "${q}" in the first 50 results.` };
      }
    }

    const mapped: { target: string; value: unknown; sourceLabel: string }[] = [];
    const unresolved: string[] = [];

    for (const m of maps) {
      if (!m.target) continue;
      if (m.kind === "custom") {
        mapped.push({ target: m.target, value: m.source, sourceLabel: `custom: "${m.source}"` });
        continue;
      }
      const value =
        m.kind === "other"
          ? walk(company, m.source.split("."))
          : getPath(company, m.source);
      if (value === undefined) {
        unresolved.push(m.source);
        mapped.push({ target: m.target, value: undefined, sourceLabel: m.source });
      } else {
        mapped.push({ target: m.target, value, sourceLabel: m.source });
      }
    }

    return {
      ok: true,
      data: {
        company: {
          id: (company?._id as string) ?? (company?.id as string),
          name: company?.name as string,
        },
        raw: company,
        mapped,
        unresolved,
      },
    };
  } catch (e) {
    return { ok: false, error: `Network error reaching Planhat: ${(e as Error).message}` };
  }
}
