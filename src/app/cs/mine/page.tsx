"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  listMyEngagements,
  deleteEngagement,
  addCollaborator,
  removeCollaborator,
  listCollaborators,
  listComments,
  listAccessRequests,
  approveAccessRequest,
  denyAccessRequest,
  type EngagementSummary,
  type CollaboratorRow,
  type CommentRow,
  type AccessRequestRow,
} from "@/app/actions/engagements";
import { CsChrome } from "@/components/builder/CsChrome";
import { EngagementCard } from "@/components/builder/EngagementCard";
import { EngagementDetail } from "@/components/builder/EngagementDetail";

/* ─── My engagements (/cs/mine) ───
 *  A dedicated page (not a popup) listing engagements the CSM owns or
 *  collaborates on. Clicking a card opens the detail panel
 *  (collaborators, comments, edit-access requests) with an
 *  Open-in-builder action. */
export default function CsMinePage() {
  const router = useRouter();

  const [list, setList] = useState<EngagementSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [detail, setDetail] = useState<EngagementSummary | null>(null);
  const [collaborators, setCollaborators] = useState<CollaboratorRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [requests, setRequests] = useState<AccessRequestRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newCollabEmail, setNewCollabEmail] = useState("");
  const [collabError, setCollabError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await listMyEngagements();
      // CSM workspace surfaces customer-success engagements here.
      setList(res.ok ? res.data.filter((e) => e.audience === "customer-success") : []);
      setLoading(false);
    })();
  }, []);

  const openDetail = async (e: EngagementSummary) => {
    setDetail(e);
    setDetailLoading(true);
    setCollabError(null);
    const isOwner = e.role === "owner";
    const [collabs, cmts, reqs] = await Promise.all([
      listCollaborators(e.id),
      listComments(e.id),
      isOwner ? listAccessRequests(e.id) : Promise.resolve({ ok: true as const, data: [] }),
    ]);
    setCollaborators(collabs.ok ? collabs.data : []);
    setComments(cmts.ok ? cmts.data : []);
    setRequests(reqs.ok ? reqs.data : []);
    setDetailLoading(false);
  };

  const handleAddCollaborator = async () => {
    if (!detail) return;
    setCollabError(null);
    const res = await addCollaborator(detail.id, newCollabEmail);
    if (!res.ok) { setCollabError(res.error); return; }
    setNewCollabEmail("");
    const refreshed = await listCollaborators(detail.id);
    setCollaborators(refreshed.ok ? refreshed.data : []);
  };

  const handleRemoveCollaborator = async (email: string) => {
    if (!detail) return;
    const res = await removeCollaborator(detail.id, email);
    if (!res.ok) return;
    setCollaborators((prev) => prev.filter((c) => c.email !== email));
  };

  const handleApprove = async (email: string) => {
    if (!detail) return;
    const res = await approveAccessRequest(detail.id, email);
    if (!res.ok) return;
    setRequests((prev) => prev.filter((r) => r.requester_email !== email));
    const refreshed = await listCollaborators(detail.id);
    setCollaborators(refreshed.ok ? refreshed.data : []);
  };

  const handleDeny = async (email: string) => {
    if (!detail) return;
    const res = await denyAccessRequest(detail.id, email);
    if (!res.ok) return;
    setRequests((prev) => prev.filter((r) => r.requester_email !== email));
  };

  const handleDelete = async () => {
    if (!detail) return;
    const res = await deleteEngagement(detail.id);
    if (!res.ok) return;
    setList((prev) => prev.filter((e) => e.id !== detail.id));
    setDetail(null);
  };

  return (
    <CsChrome
      title="My engagements"
      subtitle="Engagements you own or collaborate on. Open one to keep editing, or manage access."
    >
      {loading ? (
        <p className="text-[13px] text-boost-muted py-10 text-center">Loading…</p>
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-boost-border bg-white px-6 py-12 text-center">
          <p className="text-[14px] font-semibold text-boost-dark">No engagements yet</p>
          <p className="text-[13px] text-boost-muted mt-1.5">
            Start a new engagement and it auto-saves here.
          </p>
          <button
            type="button"
            onClick={() => router.push("/cs/build")}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-boost-purple px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white hover:bg-boost-purple/90 transition-colors"
          >
            <span aria-hidden="true">+</span> New engagement
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {list.map((e) => (
            <EngagementCard
              key={e.id}
              companyName={e.company_name}
              title={e.title}
              companyUrl={e.company_url}
              audience={e.audience}
              ownerEmail={e.owner_email}
              updatedAt={e.updated_at}
              role={e.role}
              collaborators={e.collaborators}
              onClick={() => openDetail(e)}
              action={
                <button
                  type="button"
                  onClick={() => router.push(`/cs/build?id=${e.id}`)}
                  className="rounded-lg bg-boost-purple px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:bg-boost-purple/90 transition-colors"
                >
                  Open
                </button>
              }
            />
          ))}
        </div>
      )}

      {/* Detail panel */}
      {detail ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 bg-boost-dark/30 backdrop-blur-sm overflow-y-auto"
          role="presentation"
          onClick={() => setDetail(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-boost-border bg-white shadow-xl animate-modal-in mt-8"
            onClick={(ev) => ev.stopPropagation()}
          >
            <EngagementDetail
              engagement={detail}
              isOwner={detail.role === "owner"}
              loading={detailLoading}
              collaborators={collaborators}
              comments={comments}
              newCollabEmail={newCollabEmail}
              onNewCollabEmailChange={setNewCollabEmail}
              collabError={collabError}
              onAddCollaborator={handleAddCollaborator}
              onRemoveCollaborator={handleRemoveCollaborator}
              onBack={() => setDetail(null)}
              onOpen={() => router.push(`/cs/build?id=${detail.id}`)}
              onDelete={handleDelete}
              isOpenEngagement={false}
              accessRequests={requests}
              onApproveRequest={handleApprove}
              onDenyRequest={handleDeny}
            />
          </div>
        </div>
      ) : null}
    </CsChrome>
  );
}
