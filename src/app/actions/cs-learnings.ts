"use server";

import { auth } from "@/auth";
import { getServiceClient } from "@/lib/supabase";

/**
 * CS decision-engine learnings — operator-curated GLOBAL suppression list.
 *
 * The /cs/analytics operator removes engine suggestions that make no sense.
 * Each removal STAGES a `suppress` row; runTraining() flips staged → active.
 * Active rows hydrate the client and the pure suggest* functions filter them
 * out for every customer, everywhere they run. The mute list is global: one
 * row per (kind, item_key).
 *
 * Security: mutations are restricted to a single operator; reads of the
 * ACTIVE set are open to any signed-in session (so the mute list applies for
 * the whole team). Service-role only; RLS stays deny-all as a backstop.
 * Degrades gracefully to empty when the 0005 table is absent.
 */

const LEARNINGS_OPERATOR = "mikal@boost.ai";

export type LearningKind = "story" | "recommendation" | "agentic" | "chapter";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export interface LearningRow {
  id: string;
  kind: LearningKind;
  item_key: string;
  item_label: string | null;
  status: "staged" | "active";
  created_by: string | null;
  updated_at: string;
}

export interface SerializedLearned {
  stories: string[];
  recommendations: string[];
  agentic: string[];
  chapters: string[];
}

const KIND_TO_BUCKET: Record<LearningKind, keyof SerializedLearned> = {
  story: "stories",
  recommendation: "recommendations",
  agentic: "agentic",
  chapter: "chapters",
};

const EMPTY_LEARNED: SerializedLearned = {
  stories: [],
  recommendations: [],
  agentic: [],
  chapters: [],
};

async function sessionEmail(): Promise<string | null> {
  const session = await auth();
  return session?.user?.email?.toLowerCase() ?? null;
}

/** Email if the caller is the single learnings operator, else null. */
async function learningsOperator(): Promise<string | null> {
  const email = await sessionEmail();
  return email === LEARNINGS_OPERATOR ? email : null;
}

/**
 * The ACTIVE suppression set, bucketed by kind. Any signed-in session may
 * read this — it is what every client hydrates so the mute list applies for
 * the whole team. Missing table / not signed in → empty (graceful).
 */
export async function loadActiveSuppressions(): Promise<Result<SerializedLearned>> {
  const email = await sessionEmail();
  if (!email) return { ok: true, data: EMPTY_LEARNED };

  try {
    const db = getServiceClient();
    const { data, error } = await db
      .from("cs_engine_learnings")
      .select("kind,item_key")
      .eq("status", "active");
    if (error) return { ok: true, data: EMPTY_LEARNED };

    const out: SerializedLearned = {
      stories: [],
      recommendations: [],
      agentic: [],
      chapters: [],
    };
    for (const r of (data ?? []) as { kind: LearningKind; item_key: string }[]) {
      const bucket = KIND_TO_BUCKET[r.kind];
      if (bucket) out[bucket].push(r.item_key);
    }
    return { ok: true, data: out };
  } catch {
    return { ok: true, data: EMPTY_LEARNED };
  }
}

/** Staged + active rows for the operator learnings panel. Operator-only. */
export async function listLearnings(): Promise<
  Result<{ staged: LearningRow[]; active: LearningRow[] }>
> {
  const email = await learningsOperator();
  if (!email) return { ok: false, error: "Not authorised." };

  const db = getServiceClient();
  const { data, error } = await db
    .from("cs_engine_learnings")
    .select("id,kind,item_key,item_label,status,created_by,updated_at")
    .order("updated_at", { ascending: false });
  if (error) return { ok: false, error: error.message };

  const rows = (data ?? []) as LearningRow[];
  return {
    ok: true,
    data: {
      staged: rows.filter((r) => r.status === "staged"),
      active: rows.filter((r) => r.status === "active"),
    },
  };
}

/** Stage a suppression (remove a suggestion that makes no sense). Operator-only.
 *  Upserts on (kind,item_key); a row already active stays active. */
export async function stageLearning(input: {
  kind: LearningKind;
  item_key: string;
  item_label?: string;
}): Promise<Result<LearningRow>> {
  const email = await learningsOperator();
  if (!email) return { ok: false, error: "Not authorised." };

  const kind = input.kind;
  const item_key = input.item_key?.trim();
  if (!item_key) return { ok: false, error: "Missing item key." };

  const db = getServiceClient();
  const { data, error } = await db
    .from("cs_engine_learnings")
    .upsert(
      {
        kind,
        item_key,
        item_label: input.item_label?.trim() || null,
        signal: "suppress",
        created_by: email,
      },
      { onConflict: "kind,item_key", ignoreDuplicates: false },
    )
    .select("id,kind,item_key,item_label,status,created_by,updated_at")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: data as LearningRow };
}

/** Delete a suppression (un-remove). Operator-only. */
export async function removeLearning(
  kind: LearningKind,
  item_key: string,
): Promise<Result<{ removed: boolean }>> {
  const email = await learningsOperator();
  if (!email) return { ok: false, error: "Not authorised." };

  const db = getServiceClient();
  const { error } = await db
    .from("cs_engine_learnings")
    .delete()
    .eq("kind", kind)
    .eq("item_key", item_key);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { removed: true } };
}

/** Publish all staged suppressions: staged → active. Operator-only. */
export async function runTraining(): Promise<
  Result<{ promoted: number; active: number }>
> {
  const email = await learningsOperator();
  if (!email) return { ok: false, error: "Not authorised." };

  const db = getServiceClient();
  const { data: promoted, error: upErr } = await db
    .from("cs_engine_learnings")
    .update({ status: "active" })
    .eq("status", "staged")
    .select("id");
  if (upErr) return { ok: false, error: upErr.message };

  const { count, error: cntErr } = await db
    .from("cs_engine_learnings")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");
  if (cntErr) return { ok: false, error: cntErr.message };

  return {
    ok: true,
    data: { promoted: (promoted ?? []).length, active: count ?? 0 },
  };
}
