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
  company_url: string | null;
  audience: string | null;
  owner_email: string;
  updated_at: string;
  role: "owner" | "collaborator";
  /** Collaborator emails on this engagement. Attached by the list
   *  actions via a single batched query (no N+1). */
  collaborators?: string[];
}

/** Browse-library row: every engagement the caller can see in the
 *  shared library, with the caller's relationship to it. "other" =
 *  owned by someone else and the caller is not a collaborator (view
 *  is baseline; they can request edit access). */
export interface BrowseSummary {
  id: string;
  title: string | null;
  company_name: string | null;
  company_url: string | null;
  audience: string | null;
  owner_email: string;
  updated_at: string;
  role: "owner" | "collaborator" | "other";
  collaborators: string[];
  /** True when the caller already has a pending edit-access request. */
  pending_request: boolean;
}

export interface AccessRequestRow {
  engagement_id: string;
  requester_email: string;
  status: string;
  created_at: string;
}

export interface CollaboratorRow {
  email: string;
  added_by: string | null;
  created_at: string;
}

export interface CommentRow {
  id: string;
  author_email: string;
  author_kind: string;
  section_id: string | null;
  body: string;
  parent_id: string | null;
  resolved: boolean;
  created_at: string;
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

/** Read-only fetch for the shared library. ANY signed-in boost user
 *  may view (baseline access) — returns just enough to render the
 *  read-only guide (data + sections + audience). Edit still requires
 *  getEngagement's owner/collaborator/invitee check. */
export async function getEngagementForView(
  id: string,
): Promise<Result<{ data: GuideFormData; sections: string[]; audience: string | null }>> {
  const email = await sessionEmail();
  if (!email) return { ok: false, error: "Not signed in." };
  if (!isBoost(email)) return { ok: false, error: "Only boost.ai users can view engagements." };

  const db = getServiceClient();
  const { data: eng, error } = await db
    .from("engagements")
    .select("data,sections,audience")
    .eq("id", id)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!eng) return { ok: false, error: "Engagement not found." };
  return {
    ok: true,
    data: { data: eng.data as GuideFormData, sections: eng.sections ?? [], audience: eng.audience },
  };
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
  // company_url is pulled from the data JSONB (no dedicated column) so
  // the saved-engagements list can render a Brandfetch logo.
  const cols =
    "id,title,company_name,audience,owner_email,updated_at,company_url:data->>company_url";

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

  // Attach collaborator emails in one batched query (no N+1).
  const collabsById = await collaboratorsByEngagement(
    db,
    summaries.map((s) => s.id),
  );
  for (const s of summaries) s.collaborators = collabsById.get(s.id) ?? [];

  return { ok: true, data: summaries };
}

/** Batch-fetch collaborator emails for a set of engagement ids,
 *  grouped by engagement_id. One query, grouped in memory. */
async function collaboratorsByEngagement(
  db: ReturnType<typeof getServiceClient>,
  ids: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (ids.length === 0) return map;
  const { data } = await db
    .from("engagement_collaborators")
    .select("engagement_id,email")
    .in("engagement_id", ids);
  for (const row of data ?? []) {
    const list = map.get(row.engagement_id) ?? [];
    list.push(row.email);
    map.set(row.engagement_id, list);
  }
  return map;
}

/* ─── Collaborators (boost-domain editors) ───
 *  Boost collaborators sign in with Google and then see the engagement
 *  in their own My Engagements list (listMyEngagements joins them in).
 *  No magic link needed — that's only for external (non-boost) people.
 */

/** Add a @boost.ai collaborator. Owner or existing collaborator may add. */
export async function addCollaborator(
  engagementId: string,
  rawEmail: string,
): Promise<Result<{ email: string }>> {
  const caller = await sessionEmail();
  if (!caller) return { ok: false, error: "Not signed in." };
  if (!(await canEdit(engagementId, caller))) return { ok: false, error: "No access." };

  const email = rawEmail.trim().toLowerCase();
  if (!email) return { ok: false, error: "Enter an email." };
  if (!isBoost(email)) {
    return { ok: false, error: "Collaborators must be @boost.ai. External people are invited separately." };
  }

  const db = getServiceClient();
  const { error } = await db
    .from("engagement_collaborators")
    .upsert(
      { engagement_id: engagementId, email, added_by: caller },
      { onConflict: "engagement_id,email" },
    );
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { email } };
}

/** Remove a collaborator. Owner or collaborator may remove. */
export async function removeCollaborator(
  engagementId: string,
  rawEmail: string,
): Promise<Result<{ email: string }>> {
  const caller = await sessionEmail();
  if (!caller) return { ok: false, error: "Not signed in." };
  if (!(await canEdit(engagementId, caller))) return { ok: false, error: "No access." };

  const email = rawEmail.trim().toLowerCase();
  const db = getServiceClient();
  const { error } = await db
    .from("engagement_collaborators")
    .delete()
    .eq("engagement_id", engagementId)
    .ilike("email", email);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { email } };
}

/** List collaborators on an engagement. Owner/collaborator only. */
export async function listCollaborators(
  engagementId: string,
): Promise<Result<CollaboratorRow[]>> {
  const caller = await sessionEmail();
  if (!caller) return { ok: false, error: "Not signed in." };
  if (!(await canEdit(engagementId, caller))) return { ok: false, error: "No access." };

  const db = getServiceClient();
  const { data, error } = await db
    .from("engagement_collaborators")
    .select("email,added_by,created_at")
    .eq("engagement_id", engagementId)
    .order("created_at", { ascending: true });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: (data ?? []) as CollaboratorRow[] };
}

/* ─── Comments (read-only foundation) ───
 *  Display now; capture (external viewers commenting via /e/[id])
 *  lands with the sharing sub-phase. Owner/collaborator can read. */
export async function listComments(
  engagementId: string,
): Promise<Result<CommentRow[]>> {
  const caller = await sessionEmail();
  if (!caller) return { ok: false, error: "Not signed in." };
  if (!(await canEdit(engagementId, caller))) return { ok: false, error: "No access." };

  const db = getServiceClient();
  const { data, error } = await db
    .from("engagement_comments")
    .select("id,author_email,author_kind,section_id,body,parent_id,resolved,created_at")
    .eq("engagement_id", engagementId)
    .order("created_at", { ascending: true });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: (data ?? []) as CommentRow[] };
}

/* ─── Shared engagement library + edit-access requests ───
 *  Any signed-in boost user can browse every engagement (view is
 *  baseline — the read-only guide render). For engagements they don't
 *  own or collaborate on, they can request edit access; the owner
 *  approves in-app, which promotes them to a collaborator. */

/** List every engagement in the shared library with the caller's
 *  relationship to each. Boost-only. */
export async function listAllEngagements(): Promise<Result<BrowseSummary[]>> {
  const email = await sessionEmail();
  if (!email) return { ok: false, error: "Not signed in." };
  if (!isBoost(email)) return { ok: false, error: "Only boost.ai users can browse engagements." };

  const db = getServiceClient();
  const cols =
    "id,title,company_name,audience,owner_email,updated_at,company_url:data->>company_url";

  const { data: rows, error } = await db
    .from("engagements")
    .select(cols)
    .order("updated_at", { ascending: false });
  if (error) return { ok: false, error: error.message };
  const all = rows ?? [];

  const ids = all.map((e) => e.id);
  const collabsById = await collaboratorsByEngagement(db, ids);

  // Engagement ids where the caller has a pending edit-access request.
  const { data: reqRows } = await db
    .from("engagement_access_requests")
    .select("engagement_id")
    .ilike("requester_email", email)
    .eq("status", "pending");
  const pendingIds = new Set((reqRows ?? []).map((r) => r.engagement_id));

  const summaries: BrowseSummary[] = all.map((e) => {
    const collaborators = collabsById.get(e.id) ?? [];
    const isOwner = e.owner_email.toLowerCase() === email;
    const isCollab = collaborators.some((c) => c.toLowerCase() === email);
    const role: BrowseSummary["role"] = isOwner
      ? "owner"
      : isCollab
        ? "collaborator"
        : "other";
    return { ...e, collaborators, role, pending_request: pendingIds.has(e.id) };
  });

  return { ok: true, data: summaries };
}

/** Request edit access to an engagement the caller doesn't own/collab.
 *  Idempotent (PK on engagement_id + requester_email). Boost-only. */
export async function requestEditAccess(
  engagementId: string,
): Promise<Result<{ status: string }>> {
  const email = await sessionEmail();
  if (!email) return { ok: false, error: "Not signed in." };
  if (!isBoost(email)) return { ok: false, error: "Only boost.ai users can request access." };
  if (await canEdit(engagementId, email)) {
    return { ok: false, error: "You already have edit access." };
  }

  const db = getServiceClient();
  const { error } = await db
    .from("engagement_access_requests")
    .upsert(
      { engagement_id: engagementId, requester_email: email, status: "pending" },
      { onConflict: "engagement_id,requester_email" },
    );
  if (error) return { ok: false, error: error.message };

  // Best-effort audit event (non-fatal).
  await db.from("engagement_events").insert({
    engagement_id: engagementId,
    viewer_email: email,
    event_type: "access_requested",
  });

  return { ok: true, data: { status: "pending" } };
}

/** List pending edit-access requests for an engagement. Owner only. */
export async function listAccessRequests(
  engagementId: string,
): Promise<Result<AccessRequestRow[]>> {
  const email = await sessionEmail();
  if (!email) return { ok: false, error: "Not signed in." };

  const db = getServiceClient();
  const { data: eng } = await db
    .from("engagements")
    .select("owner_email")
    .eq("id", engagementId)
    .maybeSingle();
  if (!eng || eng.owner_email.toLowerCase() !== email) {
    return { ok: false, error: "Only the owner can view access requests." };
  }

  const { data, error } = await db
    .from("engagement_access_requests")
    .select("engagement_id,requester_email,status,created_at")
    .eq("engagement_id", engagementId)
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: (data ?? []) as AccessRequestRow[] };
}

/** Approve a request → add the requester as a collaborator + mark
 *  the request approved. Owner only. */
export async function approveAccessRequest(
  engagementId: string,
  rawRequester: string,
): Promise<Result<{ email: string }>> {
  const email = await sessionEmail();
  if (!email) return { ok: false, error: "Not signed in." };

  const db = getServiceClient();
  const { data: eng } = await db
    .from("engagements")
    .select("owner_email")
    .eq("id", engagementId)
    .maybeSingle();
  if (!eng || eng.owner_email.toLowerCase() !== email) {
    return { ok: false, error: "Only the owner can approve access." };
  }

  const requester = rawRequester.trim().toLowerCase();
  if (!requester) return { ok: false, error: "No requester." };

  const { error: collabErr } = await db
    .from("engagement_collaborators")
    .upsert(
      { engagement_id: engagementId, email: requester, added_by: email },
      { onConflict: "engagement_id,email" },
    );
  if (collabErr) return { ok: false, error: collabErr.message };

  await db
    .from("engagement_access_requests")
    .update({ status: "approved" })
    .eq("engagement_id", engagementId)
    .ilike("requester_email", requester);

  return { ok: true, data: { email: requester } };
}

/** Deny a request → mark it denied (no collaborator added). Owner only. */
export async function denyAccessRequest(
  engagementId: string,
  rawRequester: string,
): Promise<Result<{ email: string }>> {
  const email = await sessionEmail();
  if (!email) return { ok: false, error: "Not signed in." };

  const db = getServiceClient();
  const { data: eng } = await db
    .from("engagements")
    .select("owner_email")
    .eq("id", engagementId)
    .maybeSingle();
  if (!eng || eng.owner_email.toLowerCase() !== email) {
    return { ok: false, error: "Only the owner can deny access." };
  }

  const requester = rawRequester.trim().toLowerCase();
  const { error } = await db
    .from("engagement_access_requests")
    .update({ status: "denied" })
    .eq("engagement_id", engagementId)
    .ilike("requester_email", requester);
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { email: requester } };
}
