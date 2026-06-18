"use client";

import { useState, useEffect, useRef, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { assetPath } from "@/lib/asset-path";
import { encodeGuideData } from "@/lib/url-encoding";
import {
  createEngagement,
  updateEngagement,
  listMyEngagements,
  getEngagement,
  deleteEngagement,
  addCollaborator,
  removeCollaborator,
  listCollaborators,
  listComments,
  type EngagementSummary,
  type CollaboratorRow,
  type CommentRow,
} from "@/app/actions/engagements";
import type { Customer } from "@/lib/types";
import { AUDIENCE_DEFAULTS } from "@/data/audience-sections";
import { CollapsibleSection } from "@/components/builder/CollapsibleSection";
import { Rail, RailLogoTile } from "@/components/builder/Rail";
import { EngagementDetail } from "@/components/builder/EngagementDetail";
import { CS_WORKSPACE, railItemsFor } from "@/components/builder/workspace-config";

import { CompanyInputPanel } from "@/components/builder/sections/cs/CompanyInputPanel";
import { AgendaInputPanel } from "@/components/builder/sections/cs/AgendaInputPanel";
import { PerformanceInputPanel } from "@/components/builder/sections/cs/PerformanceInputPanel";
import { AgenticOutcomeInputPanel } from "@/components/builder/sections/cs/AgenticOutcomeInputPanel";
import { BenchmarkInputPanel } from "@/components/builder/sections/cs/BenchmarkInputPanel";
import { RecommendationsInputPanel } from "@/components/builder/sections/cs/RecommendationsInputPanel";
import { SuccessPlanInputPanel } from "@/components/builder/sections/cs/SuccessPlanInputPanel";
import { AgentSwotInputPanel } from "@/components/builder/sections/cs/AgentSwotInputPanel";
import { UatStatusInputPanel } from "@/components/builder/sections/cs/UatStatusInputPanel";
import { GovernanceInputPanel } from "@/components/builder/sections/cs/GovernanceInputPanel";

import AgendaSection from "@/components/sections/AgendaSection";
import PerformanceSection from "@/components/sections/PerformanceSection";
import AgenticBeforeAfterSection from "@/components/sections/AgenticBeforeAfterSection";
import BenchmarkingSection from "@/components/sections/BenchmarkingSection";
import TopRecommendationsSection from "@/components/sections/TopRecommendationsSection";
import SuccessPlanSection from "@/components/sections/SuccessPlanSection";
import AgentSwotSection from "@/components/sections/AgentSwotSection";
import UatStatusSection from "@/components/sections/UatStatusSection";
import GovernanceSection from "@/components/sections/GovernanceSection";

/* ──────────────────────────────────────────────────────────────
 *  Customer Success Manager (CSM) workspace — /cs
 *
 *  A V2 builder, separate from the Sales /admin surface but inside
 *  the same app + auth. It authors the CE slices of a Customer record
 *  (performance, benchmarks, recommendations, accepted_initiatives,
 *  agent_swot, uat_status, governance, br_context, agentic_outcomes)
 *  via the nine input panels, with a live preview of the matching CE
 *  section beneath each. Persistence rides the same `engagements`
 *  table with audience="customer-success" — CE fields round-trip in
 *  the JSONB `data` column for free.
 * ────────────────────────────────────────────────────────────── */

type PanelProps = { form: Customer; update: (patch: Partial<Customer>) => void };
type PreviewProps = { customer?: Customer; sectionNumber?: string };

const PANELS: Record<string, ComponentType<PanelProps>> = {
  company: CompanyInputPanel,
  agenda: AgendaInputPanel,
  performance: PerformanceInputPanel,
  "agentic-before-after": AgenticOutcomeInputPanel,
  benchmarking: BenchmarkInputPanel,
  "top-recommendations": RecommendationsInputPanel,
  "success-plan": SuccessPlanInputPanel,
  "agent-swot": AgentSwotInputPanel,
  "uat-status": UatStatusInputPanel,
  governance: GovernanceInputPanel,
};

const PREVIEWS: Record<string, ComponentType<PreviewProps>> = {
  agenda: AgendaSection,
  performance: PerformanceSection,
  "agentic-before-after": AgenticBeforeAfterSection,
  benchmarking: BenchmarkingSection,
  "top-recommendations": TopRecommendationsSection,
  "success-plan": SuccessPlanSection,
  "agent-swot": AgentSwotSection,
  "uat-status": UatStatusSection,
  governance: GovernanceSection,
};

const CS_SECTIONS = AUDIENCE_DEFAULTS["customer-success"];

function emptyCustomer(): Customer {
  return {
    company_name: "",
    company_url: "",
    contact_name: "",
    contact_role: "",
    start_date: "",
    areas_of_interest: [],
    specific_requirements: "",
    channel_volumes: {},
    conversation_cost: "",
    currency: "USD",
    channels: "chat",
    pricing_model: "fixed",
    deployment_markets: 1,
    resources: { supporting_departments: [], knowledge_management: false },
    integrations: {},
    custom_notes: "",
  };
}

export default function CsWorkspacePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [form, setForm] = useState<Customer>(emptyCustomer);
  const update = (patch: Partial<Customer>) => setForm((prev) => ({ ...prev, ...patch }));

  const [addedSections, setAddedSections] = useState<string[]>([CS_WORKSPACE.initialSection]);
  const [activeSection, setActiveSection] = useState<string>(CS_WORKSPACE.initialSection);

  /* ─── Auto-populate rail from hasContent ───
   *  Any section whose hasContent flips true rains into the rail.
   *  Never auto-removes — removal stays a deliberate action. */
  useEffect(() => {
    setAddedSections((prev) => {
      const inferred = CS_WORKSPACE.sections.filter((s) => s.hasContent(form)).map((s) => s.id);
      let changed = false;
      const next = [...prev];
      for (const id of inferred) {
        if (!next.includes(id)) {
          next.push(id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [form]);

  const addNextSection = () => {
    const remaining = CS_WORKSPACE.sectionOrder.filter((id) => !addedSections.includes(id));
    if (remaining.length === 0) return;
    if (addedSections.length > 3) {
      setAddedSections((prev) => [...prev, ...remaining]);
      setActiveSection(remaining[0]);
    } else {
      setAddedSections((prev) => [...prev, remaining[0]]);
      setActiveSection(remaining[0]);
    }
  };
  const nextRemaining = CS_WORKSPACE.sectionOrder.filter((id) => !addedSections.includes(id));
  const nextDef = nextRemaining.length
    ? CS_WORKSPACE.sections.find((s) => s.id === nextRemaining[0])
    : undefined;

  /* ─── Engagement persistence (auto-save) ─── */
  const [engagementId, setEngagementId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const creatingRef = useRef(false);
  const engagementIdRef = useRef<string | null>(null);
  useEffect(() => { engagementIdRef.current = engagementId; }, [engagementId]);

  const hasIdentity = Boolean(form.company_name?.trim());

  useEffect(() => {
    if (!hasIdentity) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        setSaveStatus("saving");
        const existing = engagementIdRef.current;
        if (existing) {
          const res = await updateEngagement({
            id: existing,
            data: form,
            sections: CS_SECTIONS as string[],
            audience: "customer-success",
          });
          setSaveStatus(res.ok ? "saved" : "error");
        } else {
          if (creatingRef.current) return;
          creatingRef.current = true;
          const res = await createEngagement({
            data: form,
            sections: CS_SECTIONS as string[],
            audience: "customer-success",
          });
          creatingRef.current = false;
          if (res.ok) {
            setEngagementId(res.data.id);
            setSaveStatus("saved");
          } else {
            setSaveStatus("error");
          }
        }
      } catch {
        creatingRef.current = false;
        setSaveStatus("error");
      }
    }, 1200);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [form, hasIdentity]);

  /* ─── My Engagements (load / new / delete) ─── */
  const [showEngagements, setShowEngagements] = useState(false);
  const [engagementsList, setEngagementsList] = useState<EngagementSummary[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const handleOpenEngagements = async () => {
    setShowEngagements(true);
    setListLoading(true);
    const res = await listMyEngagements();
    // Surface only CSM-authored engagements in this workspace.
    setEngagementsList(res.ok ? res.data.filter((e) => e.audience === "customer-success") : []);
    setListLoading(false);
  };

  const handleLoadEngagement = async (id: string) => {
    const res = await getEngagement(id);
    if (!res.ok) return;
    setForm(res.data.data as Customer);
    setEngagementId(id);
    setSaveStatus("saved");
    setShowEngagements(false);
    setDetailEngagement(null);
  };

  const handleNewEngagement = () => {
    window.location.href = "/cs";
  };

  const handleDeleteEngagement = async (id: string) => {
    const res = await deleteEngagement(id);
    if (!res.ok) return;
    if (id === engagementIdRef.current) {
      handleNewEngagement();
      return;
    }
    setEngagementsList((prev) => prev.filter((e) => e.id !== id));
    if (detailEngagement?.id === id) setDetailEngagement(null);
  };

  /* ─── Engagement detail (collaborators + comments) ─── */
  const [detailEngagement, setDetailEngagement] = useState<EngagementSummary | null>(null);
  const [detailCollaborators, setDetailCollaborators] = useState<CollaboratorRow[]>([]);
  const [detailComments, setDetailComments] = useState<CommentRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newCollabEmail, setNewCollabEmail] = useState("");
  const [collabError, setCollabError] = useState<string | null>(null);

  const openDetail = async (e: EngagementSummary) => {
    setDetailEngagement(e);
    setDetailLoading(true);
    setCollabError(null);
    const [collabs, comments] = await Promise.all([listCollaborators(e.id), listComments(e.id)]);
    setDetailCollaborators(collabs.ok ? collabs.data : []);
    setDetailComments(comments.ok ? comments.data : []);
    setDetailLoading(false);
  };

  const handleAddCollaborator = async () => {
    if (!detailEngagement) return;
    setCollabError(null);
    const res = await addCollaborator(detailEngagement.id, newCollabEmail);
    if (!res.ok) {
      setCollabError(res.error);
      return;
    }
    setNewCollabEmail("");
    const refreshed = await listCollaborators(detailEngagement.id);
    setDetailCollaborators(refreshed.ok ? refreshed.data : []);
  };

  const handleRemoveCollaborator = async (email: string) => {
    if (!detailEngagement) return;
    const res = await removeCollaborator(detailEngagement.id, email);
    if (!res.ok) return;
    setDetailCollaborators((prev) => prev.filter((c) => c.email !== email));
  };

  /* ─── Generate ───
   *  Fragment-encoded payload (CDN size-cap safe). audience param
   *  threads the CS section defaults; ?sections= carries the explicit
   *  render list. */
  const canGenerate = hasIdentity;
  const handleGenerate = () => {
    const encoded = encodeGuideData(form);
    const fragment = new URLSearchParams();
    fragment.set("data", encoded);
    fragment.set("sections", (CS_SECTIONS as string[]).join(","));
    router.push(`/guide?audience=customer-success#${fragment.toString()}`);
  };

  const railItems = railItemsFor(CS_WORKSPACE, form, addedSections);
  const activeDef = CS_WORKSPACE.sections.find((s) => s.id === activeSection);
  const ActivePanel = PANELS[activeSection];
  const ActivePreview = PREVIEWS[activeSection];

  return (
    <div className="min-h-screen bg-boost-surface">
      {/* CSM banner */}
      <div className="bg-boost-purple text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
            Customer Success
          </span>
          <div className="flex items-center gap-3 flex-shrink-0">
            {saveStatus !== "idle" ? (
              <span
                className={`hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                  saveStatus === "error" ? "text-boost-gold" : "text-white/70"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`w-1.5 h-1.5 rounded-full ${
                    saveStatus === "saving"
                      ? "bg-white/50 animate-pulse"
                      : saveStatus === "saved"
                        ? "bg-boost-green-light"
                        : "bg-boost-gold"
                  }`}
                />
                {saveStatus === "saving" ? "Saving" : saveStatus === "saved" ? "Saved" : "Save failed"}
              </span>
            ) : null}
            <button
              type="button"
              onClick={handleOpenEngagements}
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 focus-visible:ring-offset-boost-purple rounded-sm px-2 py-0.5 whitespace-nowrap"
            >
              My engagements
            </button>
            {session?.user?.email ? (
              <span className="hidden md:inline text-[10px] font-medium tracking-[0.04em] text-white/60 truncate max-w-[160px]">
                {session.user.email}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 focus-visible:ring-offset-boost-purple rounded-sm px-2 py-0.5 whitespace-nowrap"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-boost-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <Link
            href="/"
            aria-label="Back to workspace picker"
            className="flex-shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 hover:opacity-80 transition-opacity"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={assetPath("/brand/boost_logo_purple-_main.svg")} alt="boost.ai" className="h-5 sm:h-6 w-auto" />
          </Link>
          {canGenerate ? (
            <button
              type="button"
              onClick={handleGenerate}
              className="px-3 sm:px-4 py-2 bg-boost-purple-deeper text-white text-[11px] font-bold uppercase tracking-[0.16em] rounded-lg hover:bg-boost-purple transition-colors shadow-sm flex items-center gap-1.5"
            >
              <span>Generate review</span>
              <span aria-hidden="true">→</span>
            </button>
          ) : null}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch lg:items-start">
        <Rail
          items={railItems}
          active={activeSection}
          onJump={setActiveSection}
          onAddNext={nextDef ? addNextSection : undefined}
          nextLabel={nextDef?.title}
          customer={{
            name: form.company_name,
            domain: form.company_url,
            category: form.areas_of_interest?.length ? `${form.areas_of_interest.length} agents tracked` : undefined,
          }}
        />

        <main className="flex-1 min-w-0 space-y-4">
          {activeDef && ActivePanel ? (
            <CollapsibleSection
              number={activeDef.number}
              title={activeDef.title}
              subtitle={activeDef.preview(form)}
              hasContent={activeDef.hasContent(form)}
            >
              <ActivePanel form={form} update={update} />
            </CollapsibleSection>
          ) : null}

          {/* Live preview of the matching CE section */}
          {ActivePreview ? (
            <div className="rounded-xl border border-boost-border bg-white overflow-hidden">
              <div className="px-4 py-2 border-b border-boost-border bg-boost-surface/40">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-boost-muted">
                  Live preview
                </p>
              </div>
              <div className="p-2 sm:p-4">
                <ActivePreview customer={form} sectionNumber={String(activeDef?.number ?? "")} />
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {/* My Engagements modal */}
      {showEngagements ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 bg-boost-dark/30 backdrop-blur-sm overflow-y-auto"
          role="presentation"
          onClick={() => { setShowEngagements(false); setDetailEngagement(null); }}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-boost-border bg-white shadow-xl animate-modal-in mt-8"
            onClick={(e) => e.stopPropagation()}
          >
            {detailEngagement ? (
              <EngagementDetail
                engagement={detailEngagement}
                isOwner={detailEngagement.role === "owner"}
                loading={detailLoading}
                collaborators={detailCollaborators}
                comments={detailComments}
                newCollabEmail={newCollabEmail}
                onNewCollabEmailChange={setNewCollabEmail}
                collabError={collabError}
                onAddCollaborator={handleAddCollaborator}
                onRemoveCollaborator={handleRemoveCollaborator}
                onBack={() => setDetailEngagement(null)}
                onOpen={() => handleLoadEngagement(detailEngagement.id)}
                onDelete={() => handleDeleteEngagement(detailEngagement.id)}
                isOpenEngagement={detailEngagement.id === engagementId}
              />
            ) : (
              <>
                <div className="flex items-center justify-between px-5 py-4 border-b border-boost-border">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-boost-muted">
                      Your work
                    </p>
                    <h2 className="text-base font-semibold text-boost-dark">My engagements</h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleNewEngagement}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-boost-purple px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white hover:bg-boost-purple/90 transition-colors"
                  >
                    <span aria-hidden="true">+</span> New
                  </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto p-2">
                  {listLoading ? (
                    <p className="px-4 py-8 text-center text-[13px] text-boost-muted">Loading…</p>
                  ) : engagementsList.length === 0 ? (
                    <p className="px-4 py-8 text-center text-[13px] text-boost-muted">
                      No saved reviews yet. Type a company name and it auto-saves here.
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {engagementsList.map((e) => {
                        const dom = (e.company_url || "")
                          .replace(/^https?:\/\//, "")
                          .replace(/\/.*$/, "")
                          .trim();
                        const src = dom ? `https://cdn.brandfetch.io/${dom}` : null;
                        const label = e.company_name || e.title || "Untitled review";
                        const initials = label.trim()[0]?.toUpperCase() ?? "?";
                        return (
                          <li key={e.id}>
                            <button
                              type="button"
                              onClick={() => openDetail(e)}
                              className={`group w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                                e.id === engagementId ? "bg-boost-surface" : "hover:bg-boost-surface/60"
                              }`}
                            >
                              <RailLogoTile src={src} initials={initials} alt={label} />
                              <span className="flex-1 min-w-0">
                                <span className="block text-[13px] font-semibold text-boost-dark truncate">{label}</span>
                                <span className="block text-[10px] text-boost-muted mt-0.5">
                                  {e.role === "owner" ? "Owner" : "Collaborator"}
                                  <span className="mx-1.5">·</span>
                                  {new Date(e.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                  {e.id === engagementId ? <span className="ml-1.5 text-boost-green font-semibold">· open</span> : null}
                                </span>
                              </span>
                              <span aria-hidden="true" className="text-boost-muted/50 group-hover:text-boost-purple transition-colors">→</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
