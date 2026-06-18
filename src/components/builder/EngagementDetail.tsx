"use client";

import { RailLogoTile } from "./Rail";
import type {
  EngagementSummary,
  CollaboratorRow,
  CommentRow,
  AccessRequestRow,
} from "@/app/actions/engagements";

/* ─── Engagement detail panel (inside My Engagements modal) ───
 *  Clicking a saved engagement opens this instead of loading straight
 *  into the builder: logo + meta, an Open-in-builder action, the
 *  collaborator manager (add/remove @boost.ai editors), and the
 *  comments-so-far (read-only foundation; capture lands with sharing).
 *  Shared between the Sales (/admin) and CSM (/cs) workspaces. */
export function EngagementDetail(props: {
  engagement: EngagementSummary;
  isOwner: boolean;
  loading: boolean;
  collaborators: CollaboratorRow[];
  comments: CommentRow[];
  newCollabEmail: string;
  onNewCollabEmailChange: (v: string) => void;
  collabError: string | null;
  onAddCollaborator: () => void;
  onRemoveCollaborator: (email: string) => void;
  onBack: () => void;
  onOpen: () => void;
  onDelete: () => void;
  isOpenEngagement: boolean;
  /** Owner-only pending edit-access requests + handlers. Optional —
   *  callers that don't surface requests (e.g. legacy modal) omit them. */
  accessRequests?: AccessRequestRow[];
  onApproveRequest?: (email: string) => void;
  onDenyRequest?: (email: string) => void;
}) {
  const {
    engagement: e,
    isOwner,
    loading,
    collaborators,
    comments,
    newCollabEmail,
    onNewCollabEmailChange,
    collabError,
    onAddCollaborator,
    onRemoveCollaborator,
    onBack,
    onOpen,
    onDelete,
    isOpenEngagement,
    accessRequests = [],
    onApproveRequest,
    onDenyRequest,
  } = props;

  const dom = (e.company_url || "")
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .trim();
  const src = dom ? `https://cdn.brandfetch.io/${dom}` : null;
  const label = e.company_name || e.title || "Untitled engagement";
  const initials = label.trim()[0]?.toUpperCase() ?? "?";

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-boost-border">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to list"
          className="flex-shrink-0 -ml-1 p-1.5 rounded-md text-boost-muted hover:text-boost-dark hover:bg-boost-surface transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <RailLogoTile src={src} initials={initials} alt={label} />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-boost-dark truncate leading-tight">{label}</p>
          <p className="text-[10px] text-boost-muted mt-0.5">
            {isOwner ? "Owner" : "Collaborator"}
            {dom ? <><span className="mx-1.5">·</span>{dom}</> : null}
            {isOpenEngagement ? <span className="ml-1.5 text-boost-green font-semibold">· open now</span> : null}
          </p>
        </div>
      </div>

      <div className="max-h-[64vh] overflow-y-auto px-5 py-4 space-y-5">
        {/* Open in builder */}
        <button
          type="button"
          onClick={onOpen}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-boost-purple px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-white hover:bg-boost-purple/90 transition-colors"
        >
          Open in builder <span aria-hidden="true">→</span>
        </button>

        {/* Access requests (owner only) */}
        {isOwner && accessRequests.length > 0 ? (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-boost-muted mb-2">
              Edit access requests
            </p>
            <ul className="space-y-1.5">
              {accessRequests.map((r) => (
                <li
                  key={r.requester_email}
                  className="flex items-center gap-2 rounded-lg border border-boost-border bg-boost-surface/40 px-3 py-2"
                >
                  <span className="flex-1 truncate text-[12px] text-boost-dark">{r.requester_email}</span>
                  <button
                    type="button"
                    onClick={() => onApproveRequest?.(r.requester_email)}
                    className="rounded-md bg-boost-green-light px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white hover:bg-boost-green-light/90 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => onDenyRequest?.(r.requester_email)}
                    className="text-[10px] font-semibold uppercase tracking-[0.12em] text-boost-muted hover:text-boost-gold transition-colors"
                  >
                    Deny
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Collaborators */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-boost-muted mb-2">
            Collaborators
          </p>
          {loading ? (
            <p className="text-[12px] text-boost-muted">Loading…</p>
          ) : collaborators.length === 0 ? (
            <p className="text-[12px] text-boost-muted/80">
              No collaborators yet. Add a boost.ai teammate to let them edit.
            </p>
          ) : (
            <ul className="space-y-1 mb-2">
              {collaborators.map((c) => (
                <li key={c.email} className="group flex items-center gap-2 text-[12px] text-boost-dark">
                  <span className="flex-1 truncate">{c.email}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveCollaborator(c.email)}
                    aria-label={`Remove ${c.email}`}
                    className="opacity-0 group-hover:opacity-100 text-boost-muted hover:text-boost-gold transition-all text-[11px] font-semibold uppercase tracking-[0.12em]"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          {/* Add collaborator */}
          <div className="flex items-center gap-2 mt-1">
            <input
              type="email"
              value={newCollabEmail}
              onChange={(ev) => onNewCollabEmailChange(ev.target.value)}
              onKeyDown={(ev) => { if (ev.key === "Enter") onAddCollaborator(); }}
              placeholder="teammate@boost.ai"
              className="flex-1 px-3 py-2 bg-white border border-boost-border rounded-lg text-[12px] text-boost-dark placeholder-boost-lavender focus:outline-none focus:ring-2 focus:ring-boost-green-light focus:border-transparent"
            />
            <button
              type="button"
              onClick={onAddCollaborator}
              className="flex-shrink-0 rounded-lg border border-boost-border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-boost-dark hover:bg-boost-surface transition-colors"
            >
              Add
            </button>
          </div>
          {collabError ? (
            <p className="text-[11px] text-boost-gold mt-1.5">{collabError}</p>
          ) : null}
        </div>

        {/* Comments */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-boost-muted mb-2">
            Comments
          </p>
          {loading ? (
            <p className="text-[12px] text-boost-muted">Loading…</p>
          ) : comments.length === 0 ? (
            <p className="text-[12px] text-boost-muted/80">
              No comments yet. Comments from people you share this with will
              appear here.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {comments.map((c) => (
                <li key={c.id} className="rounded-lg border border-boost-border bg-boost-surface/40 px-3 py-2">
                  <p className="text-[11px] text-boost-dark">{c.body}</p>
                  <p className="text-[9px] text-boost-muted mt-1">
                    {c.author_email}
                    <span className="mx-1.5">·</span>
                    {new Date(c.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    {c.resolved ? <span className="ml-1.5 text-boost-green">· resolved</span> : null}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Delete */}
        {isOwner ? (
          <button
            type="button"
            onClick={onDelete}
            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-boost-muted hover:text-boost-gold transition-colors"
          >
            Delete engagement
          </button>
        ) : null}
      </div>
    </>
  );
}
