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
        mapped.push({ target: m.target, value: applyTransform(value, m.transform), sourceLabel: m.source });
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

/* ─── Live schema introspection ────────────────────────────────── */

export interface SchemaField {
  value: string;
  label: string;
  group: string;
}

/** Flatten the keys actually present across sampled companies into a
 *  pickable field catalog. Top-level scalars/arrays + one level of
 *  nested objects (custom.*, usage.*, …) so ANY field Planhat returns is
 *  selectable — no hardcoded guessing, and fields not in our static list
 *  still surface. */
function flattenCompanyKeys(companies: Record<string, unknown>[]): SchemaField[] {
  const seen = new Map<string, string>(); // path → type label
  const note = (path: string, v: unknown) => {
    if (seen.has(path)) return;
    const t = Array.isArray(v) ? "array" : v === null ? "null" : typeof v;
    seen.set(path, t);
  };
  for (const c of companies) {
    for (const [k, v] of Object.entries(c)) {
      if (v && typeof v === "object" && !Array.isArray(v)) {
        // one level deep (custom.*, usage.*, sunits.*, lastTouchByType.*)
        for (const [ck, cv] of Object.entries(v as Record<string, unknown>)) {
          note(`${k}.${ck}`, cv);
        }
        note(k, v); // also expose the whole object
      } else {
        note(k, v);
      }
    }
  }
  const groupFor = (path: string): string => {
    const top = path.split(".")[0];
    if (path.includes(".")) return top === "custom" ? "Custom" : top;
    return "Company";
  };
  return [...seen.entries()]
    .map(([value, t]) => ({ value, label: `${value} : ${t}`, group: groupFor(value) }))
    .sort((a, b) =>
      a.group === b.group ? a.value.localeCompare(b.value) : a.group.localeCompare(b.group),
    );
}

/** Fetch a live sample and return every field path present, so the admin
 *  picker reflects the real Planhat shape (incl. fields not on our list). */
export async function introspectSchema(
  connectionId: string,
): Promise<Result<{ fields: SchemaField[]; sampled: number }>> {
  const email = await operatorEmail();
  if (!email) return { ok: false, error: "Not authorized." };

  const conn = await loadConnection(connectionId);
  if (!conn) return { ok: false, error: "Connection not found." };
  if (conn.provider !== "planhat") {
    return { ok: false, error: "Schema introspection currently supports Planhat only." };
  }
  const tok = resolveToken(conn);
  if (!tok.ok) return tok;

  try {
    const res = await planhatGet(conn.endpoint ?? "", "/companies?limit=20", tok.data);
    if (!res.ok) {
      return { ok: false, error: `Planhat HTTP ${res.status} sampling companies for schema.` };
    }
    const list = Array.isArray(res.body) ? (res.body as Record<string, unknown>[]) : [];
    if (list.length === 0) return { ok: false, error: "Planhat returned no companies to sample." };
    return { ok: true, data: { fields: flattenCompanyKeys(list), sampled: list.length } };
  } catch (e) {
    return { ok: false, error: `Network error reaching Planhat: ${(e as Error).message}` };
  }
}

/* ─── Company pull (team-facing, used by the CS builder) ────────── */

export interface CompanyHit {
  id: string;
  name: string;
}

export interface PullResult {
  company: CompanyHit;
  /** dot-path → resolved value, ready to deep-merge into the Customer record */
  patch: Record<string, unknown>;
  appliedCount: number;
  /** mapped targets Planhat had no value for AND no stored override yet */
  missing: { target: string; sourceLabel: string }[];
}

/** Any signed-in operator (broader than the integration admin allow-list)
 *  may pull company data — this is the product feature for the CS team.
 *  Secrets still stay server-side; reads only. */
async function sessionEmail(): Promise<string | null> {
  const session = await auth();
  return session?.user?.email?.toLowerCase() ?? null;
}

function setPath(root: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(".");
  let cur = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const next = cur[p];
    if (next == null || typeof next !== "object" || Array.isArray(next)) {
      cur[p] = {};
    }
    cur = cur[p] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

/** Coerce a stored/entered override string into number/boolean where it
 *  clearly is one; otherwise keep the raw value. */
function coerceValue(v: unknown): unknown {
  if (typeof v !== "string") return v;
  const s = v.trim();
  if (s === "") return s;
  if (s === "true") return true;
  if (s === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return v;
}

/** Parse a number from a Planhat value, tolerating comma decimals and
 *  surrounding whitespace. Returns null when it isn't numeric. */
function toNumber(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const s = v.trim().replace(/\s/g, "").replace(",", ".");
    if (s === "" || isNaN(Number(s))) return null;
    return Number(s);
  }
  return null;
}

/** Apply a field-map transform token to a resolved value. Unknown/legacy
 *  tokens (the column used to hold free-text notes) are a no-op so old maps
 *  keep working. Non-numeric values pass through untouched. */
function applyTransform(value: unknown, transform: string): unknown {
  const t = (transform ?? "").trim();
  if (!t) return value;
  const num = toNumber(value);
  switch (t) {
    case "ratio_to_percent":
      return num === null ? value : Math.round(num * 1000) / 10;
    case "percent_to_ratio":
      return num === null ? value : num / 100;
    case "round":
      return num === null ? value : Math.round(num);
    case "round1":
      return num === null ? value : Math.round(num * 10) / 10;
    case "to_number":
      return num === null ? value : num;
    default:
      return value;
  }
}

function companyHit(c: Record<string, unknown>): CompanyHit {
  return {
    id: String((c._id as string) ?? (c.id as string) ?? ""),
    name: String((c.name as string) ?? "(unnamed)"),
  };
}

/** First Planhat connection (the CS builder auto-uses it). */
export async function getDefaultPlanhatConnection(): Promise<Result<CompanyHit | null>> {
  const email = await sessionEmail();
  if (!email) return { ok: false, error: "Not signed in." };
  const db = getServiceClient();
  const { data, error } = await db
    .from("integration_connections")
    .select("id,name,provider")
    .eq("provider", "planhat")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: true, data: null };
  return { ok: true, data: { id: data.id as string, name: data.name as string } };
}

/** Live name-search against Planhat companies (client-side substring over
 *  a sampled page — Planhat has no general name-query param). */
export async function searchPlanhatCompanies(
  connectionId: string,
  query: string,
): Promise<Result<CompanyHit[]>> {
  const email = await sessionEmail();
  if (!email) return { ok: false, error: "Not signed in." };

  const conn = await loadConnection(connectionId);
  if (!conn) return { ok: false, error: "Connection not found." };
  const tok = resolveToken(conn);
  if (!tok.ok) return tok;

  try {
    const res = await planhatGet(conn.endpoint ?? "", "/companies?limit=2000", tok.data);
    if (!res.ok) return { ok: false, error: `Planhat HTTP ${res.status} listing companies.` };
    const list = Array.isArray(res.body) ? (res.body as Record<string, unknown>[]) : [];
    const q = query.trim().toLowerCase();
    const hits = (q
      ? list.filter((c) => String((c.name as string) ?? "").toLowerCase().includes(q))
      : list
    )
      .slice(0, 25)
      .map(companyHit);
    return { ok: true, data: hits };
  } catch (e) {
    return { ok: false, error: `Network error reaching Planhat: ${(e as Error).message}` };
  }
}

/** Fetch one company by id, run the saved field map, merge stored
 *  overrides, and report which mapped targets still have no value. */
export async function pullCustomer(
  connectionId: string,
  companyId: string,
): Promise<Result<PullResult>> {
  const email = await sessionEmail();
  if (!email) return { ok: false, error: "Not signed in." };

  const conn = await loadConnection(connectionId);
  if (!conn) return { ok: false, error: "Connection not found." };
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
    const id = companyId.trim();
    const res = await planhatGet(conn.endpoint ?? "", `/companies/${id}`, tok.data);
    if (!res.ok) return { ok: false, error: `Planhat HTTP ${res.status} fetching company ${id}.` };
    const company = (res.body as Record<string, unknown>) ?? {};
    const hit = companyHit(company);

    const patch: Record<string, unknown> = {};
    if (hit.name) patch.company_name = hit.name;

    const missing: { target: string; sourceLabel: string }[] = [];
    let appliedCount = 0;
    for (const m of maps) {
      if (!m.target) continue;
      let value: unknown;
      if (m.kind === "custom") value = m.source;
      else if (m.kind === "other") value = walk(company, m.source.split("."));
      else value = getPath(company, m.source);
      if (value === undefined || value === null || value === "") {
        missing.push({ target: m.target, sourceLabel: m.source });
      } else {
        setPath(patch, m.target, applyTransform(value, m.transform));
        appliedCount++;
      }
    }

    // Overlay manually-stored overrides (these win, and clear "missing").
    const { data: ovRows } = await db
      .from("integration_customer_overrides")
      .select("field_target,value")
      .eq("connection_id", connectionId)
      .eq("planhat_company_id", hit.id);
    const overrideTargets = new Set<string>();
    for (const r of (ovRows ?? []) as { field_target: string; value: unknown }[]) {
      setPath(patch, r.field_target, coerceValue(r.value));
      overrideTargets.add(r.field_target);
      appliedCount++;
    }

    return {
      ok: true,
      data: {
        company: hit,
        patch,
        appliedCount,
        missing: missing.filter((m) => !overrideTargets.has(m.target)),
      },
    };
  } catch (e) {
    return { ok: false, error: `Network error reaching Planhat: ${(e as Error).message}` };
  }
}

/** All manually-stored overrides for a customer (target → value). */
export async function loadOverrides(
  connectionId: string,
  companyId: string,
): Promise<Result<Record<string, unknown>>> {
  const email = await sessionEmail();
  if (!email) return { ok: false, error: "Not signed in." };
  const db = getServiceClient();
  const { data, error } = await db
    .from("integration_customer_overrides")
    .select("field_target,value")
    .eq("connection_id", connectionId)
    .eq("planhat_company_id", companyId);
  if (error) return { ok: false, error: error.message };
  const out: Record<string, unknown> = {};
  for (const r of (data ?? []) as { field_target: string; value: unknown }[]) {
    out[r.field_target] = r.value;
  }
  return { ok: true, data: out };
}

/* ─── Assets (instances) ───────────────────────────────────────── */

export interface AssetHit {
  /** Planhat asset _id (stable, for keys). */
  planhatId: string;
  /** Display name. */
  name: string;
  /** The identifier we persist as the instance id (externalId ?? name). */
  instanceId: string;
}

/** Fetch the assets belonging to one company. In Planhat an asset is an
 *  instance/deployment under a company, so this populates the engagement's
 *  instance picker. Session-gated (CS-team feature), reads only. */
export async function fetchPlanhatAssets(
  connectionId: string,
  companyId: string,
): Promise<Result<AssetHit[]>> {
  const email = await sessionEmail();
  if (!email) return { ok: false, error: "Not signed in." };

  const conn = await loadConnection(connectionId);
  if (!conn) return { ok: false, error: "Connection not found." };
  const tok = resolveToken(conn);
  if (!tok.ok) return tok;

  try {
    const cid = companyId.trim();
    const res = await planhatGet(
      conn.endpoint ?? "",
      `/assets?companyId=${encodeURIComponent(cid)}&limit=2000`,
      tok.data,
    );
    if (!res.ok) return { ok: false, error: `Planhat HTTP ${res.status} listing assets.` };
    const list = Array.isArray(res.body) ? (res.body as Record<string, unknown>[]) : [];
    // Defense in depth: if the query param was ignored and items carry a
    // companyId, keep only this company's assets.
    const matches = list.filter((a) => String((a.companyId as string) ?? "") === cid);
    const final = matches.length > 0 ? matches : list;
    const hits = final.map((a) => {
      const name = String((a.name as string) ?? "(unnamed asset)");
      const externalId = (a.externalId as string) ?? "";
      return {
        planhatId: String((a._id as string) ?? (a.id as string) ?? ""),
        name,
        instanceId: externalId || name,
      };
    });
    return { ok: true, data: hits };
  } catch (e) {
    return { ok: false, error: `Network error reaching Planhat: ${(e as Error).message}` };
  }
}

/** Sample live assets and return the real field shape — used to confirm
 *  which key identifies the instance. Operator-gated. */
export async function introspectAssetSchema(
  connectionId: string,
): Promise<Result<{ fields: SchemaField[]; sampled: number }>> {
  const email = await operatorEmail();
  if (!email) return { ok: false, error: "Not authorized." };

  const conn = await loadConnection(connectionId);
  if (!conn) return { ok: false, error: "Connection not found." };
  if (conn.provider !== "planhat") {
    return { ok: false, error: "Asset introspection currently supports Planhat only." };
  }
  const tok = resolveToken(conn);
  if (!tok.ok) return tok;

  try {
    const res = await planhatGet(conn.endpoint ?? "", "/assets?limit=20", tok.data);
    if (!res.ok) return { ok: false, error: `Planhat HTTP ${res.status} sampling assets.` };
    const list = Array.isArray(res.body) ? (res.body as Record<string, unknown>[]) : [];
    if (list.length === 0) return { ok: false, error: "Planhat returned no assets to sample." };
    return { ok: true, data: { fields: flattenCompanyKeys(list), sampled: list.length } };
  } catch (e) {
    return { ok: false, error: `Network error reaching Planhat: ${(e as Error).message}` };
  }
}

/** Upsert one manually-filled field for a customer (queryable later via
 *  SQL — this is the persisted store of metadata Planhat doesn't have).
 *  An empty value deletes the override. */
export async function saveOverride(input: {
  connectionId: string;
  companyId: string;
  companyName: string;
  target: string;
  value: unknown;
}): Promise<Result<{ target: string }>> {
  const email = await sessionEmail();
  if (!email) return { ok: false, error: "Not signed in." };
  if (!input.target) return { ok: false, error: "Target field is required." };

  const db = getServiceClient();
  const isEmpty =
    input.value === "" || input.value === null || input.value === undefined;

  if (isEmpty) {
    const { error } = await db
      .from("integration_customer_overrides")
      .delete()
      .eq("connection_id", input.connectionId)
      .eq("planhat_company_id", input.companyId)
      .eq("field_target", input.target);
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: { target: input.target } };
  }

  const { error } = await db.from("integration_customer_overrides").upsert(
    {
      connection_id: input.connectionId,
      planhat_company_id: input.companyId,
      company_name: input.companyName,
      field_target: input.target,
      value: coerceValue(input.value),
      entered_by: email,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "connection_id,planhat_company_id,field_target" },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { target: input.target } };
}
