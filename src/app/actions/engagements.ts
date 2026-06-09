"use server";

import { auth } from "@/auth";
import { getServiceClient } from "@/lib/supabase";
import type { GuideFormData } from "@/lib/types";

/**
 * Engagement persistence server actions (Phase 1).
 *
 * Every action authorizes against the Auth.js session email before
 * touching Supabase (which runs with the service-role key, bypassing
 * RLS). View/edit authorization:
 *   - owner_email === caller  → full
 *   - collaborator (boost)    → edit
 *   - invitee (external)      → view + comment (wired in Phase 2)
 */

const BOOST_DOMAIN = "boost.ai";

export interface EngagementRow {
  id: string;
  owner_email: string;
  title: string | null;
  company_name: string | null;
  data: GuideFormData;
  sections: string[];
  audience: string | null;
  created_at: string;
  updated_at: string;
}

export interface EngagementSummary {
  id: string;
  title: string | null;
  company_name: string | null;
  audience: string | null;
  owner_email: string;
  updated_at: string;
  role: "owner" | "collaborator";
}

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

/** Resolve the signed-in email (lowercased) or null. */
async function sessionEmail(): Promise<string | null> {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  return email ?? null;
}

function isBoost(email: string): boolean {
  return email.endsWith(`@${BOOST_DOMAIN}`);
}

/** Can this email edit this engagement? owner or boost collaborator. */
async function canEdit(engagementId: string, email: string): Promise<boolean> {
  const db = getServiceClient();
  const { data: eng } = await db
    .from("engagements")
    .select("owner_email")
    .eq("id", engagementId)
    .maybeSingle();
  if (eng && eng.owner_email.toLowerCase() === email) return true;

  const { data: collab } = await db
    .from("engagement_collaborators")
    .select("email")
    .eq("engagement_id", engagementId)
    .ilike("email", email)
    .maybeSingle();
  return Boolean(collab);
}

/** Create a new engagement owned by the caller. Boost users only. */
export async function createEngagement(input: {
  data: GuideFormData;
  sections: string[];
  audience?: string | null;
}): Promise<Result<{ id: string }>> {
  const email = await sessionEmail();
  if (!email) return { ok: false, error: "Not signed in." };
  if (!isBoost(email)) return { ok: false, error: "Only boost.ai users can create engagements." };

  const db = getServiceClient();
  const { data, error } = await db
    .from("engagements")
    .insert({
      owner_email: email,
      title: input.data.company_name || null,
      company_name: input.data.company_name || null,
      data: input.data,
      sections: input.sections,
      audience: input.audience ?? null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id: data.id } };
}

/** Update an engagement's data/sections. Owner or collaborator. Logs an edit. */
export async function updateEngagement(input: {
  id: string;
  data?: GuideFormData;
  sections?: string[];
  audience?: string | null;
  summary?: string;
}): Promise<Result<{ id: string }>> {
  const email = await sessionEmail();
  if (!email) return { ok: false, error: "Not signed in." };
  if (!(await canEdit(input.id, email))) return { ok: false, error: "No edit access." };

  const db = getServiceClient();
  const patch: Record<string, unknown> = {};
  if (input.data !== undefined) {
    patch.data = input.data;
    patch.title = input.data.company_name || null;
    patch.company_name = input.data.company_name || null;
  }
  if (input.sections !== undefined) patch.sections = input.sections;
  if (input.audience !== undefined) patch.audience = input.audience;

  const { error } = await db.from("engagements").update(patch).eq("id", input.id);
  if (error) return { ok: false, error: error.message };

  // Audit row (best-effort; non-fatal if it fails).
  await db.from("engagement_edits").insert({
    engagement_id: input.id,
    editor_email: email,
    summary: input.summary ?? "Edited engagement",
  });

  return { ok: true, data: { id: input.id } };
}

/** Fetch one engagement if the caller may view it. */
export async function getEngagement(id: string): Promise<Result<EngagementRow>> {
  const email = await sessionEmail();
  if (!email) return { ok: false, error: "Not signed in." };

  const db = getServiceClient();
  const { data: eng, error } = await db
    .from("engagements")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!eng) return { ok: false, error: "Engagement not found." };

  const owner = eng.owner_email.toLowerCase() === email;
  let allowed = owner;
  if (!allowed) {
    const { data: collab } = await db
      .from("engagement_collaborators")
      .select("email")
      .eq("engagement_id", id)
      .ilike("email", email)
      .maybeSingle();
    allowed = Boolean(collab);
  }
  if (!allowed) {
    // Phase 2 extends this to external invitees.
    const { data: invite } = await db
      .from("engagement_invites")
      .select("email,status")
      .eq("engagement_id", id)
      .ilike("email", email)
      .maybeSingle();
    allowed = Boolean(invite && invite.status !== "revoked");
  }
  if (!allowed) return { ok: false, error: "No access." };

  return { ok: true, data: eng as EngagementRow };
}

/** Delete an entire engagement. Owner only. Cascades to children. */
export async function deleteEngagement(id: string): Promise<Result<{ id: string }>> {
  const email = await sessionEmail();
  if (!email) return { ok: false, error: "Not signed in." };

  const db = getServiceClient();
  const { data: eng } = await db
    .from("engagements")
    .select("owner_email")
    .eq("id", id)
    .maybeSingle();
  if (!eng) return { ok: false, error: "Engagement not found." };
  if (eng.owner_email.toLowerCase() !== email) {
    return { ok: false, error: "Only the owner can delete an engagement." };
  }

  const { error } = await db.from("engagements").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { id } };
}

/** List engagements the caller owns or collaborates on. */
export async function listMyEngagements(): Promise<Result<EngagementSummary[]>> {
  const email = await sessionEmail();
  if (!email) return { ok: false, error: "Not signed in." };

  const db = getServiceClient();
  const cols = "id,title,company_name,audience,owner_email,updated_at";

  const { data: owned, error: ownedErr } = await db
    .from("engagements")
    .select(cols)
    .ilike("owner_email", email)
    .order("updated_at", { ascending: false });
  if (ownedErr) return { ok: false, error: ownedErr.message };

  const { data: collabRows } = await db
    .from("engagement_collaborators")
    .select("engagement_id")
    .ilike("email", email);
  const collabIds = (collabRows ?? []).map((r) => r.engagement_id);

  let collabEngagements: typeof owned = [];
  if (collabIds.length > 0) {
    const { data: ce } = await db
      .from("engagements")
      .select(cols)
      .in("id", collabIds)
      .order("updated_at", { ascending: false });
    collabEngagements = ce ?? [];
  }

  const summaries: EngagementSummary[] = [
    ...(owned ?? []).map((e) => ({ ...e, role: "owner" as const })),
    ...collabEngagements.map((e) => ({ ...e, role: "collaborator" as const })),
  ];
  return { ok: true, data: summaries };
}
