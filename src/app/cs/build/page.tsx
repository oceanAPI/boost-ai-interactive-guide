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
  getEngagement,
} from "@/app/actions/engagements";
import type { Customer } from "@/lib/types";
import { AUDIENCE_DEFAULTS } from "@/data/audience-sections";
import { CollapsibleSection } from "@/components/builder/CollapsibleSection";
import { Rail } from "@/components/builder/Rail";
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
import { PersonalisationInputPanel } from "@/components/builder/sections/cs/PersonalisationInputPanel";
import { RevenueInputPanel } from "@/components/builder/sections/cs/RevenueInputPanel";
import { ThoughtLeadershipInputPanel } from "@/components/builder/sections/cs/ThoughtLeadershipInputPanel";
import { SuccessStoriesInputPanel } from "@/components/builder/sections/cs/SuccessStoriesInputPanel";
import { IntentTrafficInputPanel } from "@/components/builder/sections/cs/IntentTrafficInputPanel";
import { DetectedIssuesInputPanel } from "@/components/builder/sections/cs/DetectedIssuesInputPanel";

import AgendaSection from "@/components/sections/AgendaSection";
import PerformanceSection from "@/components/sections/PerformanceSection";
import AgenticBeforeAfterSection from "@/components/sections/AgenticBeforeAfterSection";
import BenchmarkingSection from "@/components/sections/BenchmarkingSection";
import TopRecommendationsSection from "@/components/sections/TopRecommendationsSection";
import SuccessPlanSection from "@/components/sections/SuccessPlanSection";
import AgentSwotSection from "@/components/sections/AgentSwotSection";
import UatStatusSection from "@/components/sections/UatStatusSection";
import GovernanceSection from "@/components/sections/GovernanceSection";
import PersonalisationSection from "@/components/sections/PersonalisationSection";
import RevenueSection from "@/components/sections/RevenueSection";
import ThoughtLeadershipSection from "@/components/sections/ThoughtLeadershipSection";
import SuccessStoriesSection from "@/components/sections/SuccessStoriesSection";
import IntentTrafficSection from "@/components/sections/IntentTrafficSection";
import DetectedIssuesSection from "@/components/sections/DetectedIssuesSection";

/* ──────────────────────────────────────────────────────────────
 *  CSM builder — /cs/build
 *
 *  The authoring surface of the Customer Success workspace. Reached
 *  from the /cs chooser ("New engagement") or by opening an existing
 *  one (/cs/build?id=<uuid>). Authors the CE slices of a Customer
 *  record via the nine input panels with a live preview of the
 *  matching CE section beneath each. Persistence rides the shared
 *  `engagements` table with audience="customer-success".
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
  personalisation: PersonalisationInputPanel,
  revenue: RevenueInputPanel,
  "thought-leadership": ThoughtLeadershipInputPanel,
  "success-stories": SuccessStoriesInputPanel,
  "intent-traffic": IntentTrafficInputPanel,
  "detected-issues": DetectedIssuesInputPanel,
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
  personalisation: PersonalisationSection,
  revenue: RevenueSection,
  "thought-leadership": ThoughtLeadershipSection,
  "success-stories": SuccessStoriesSection,
  "intent-traffic": IntentTrafficSection,
  "detected-issues": DetectedIssuesSection,
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

export default function CsBuilderPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [form, setForm] = useState<Customer>(emptyCustomer);
  const update = (patch: Partial<Customer>) => setForm((prev) => ({ ...prev, ...patch }));

  const [addedSections, setAddedSections] = useState<string[]>([CS_WORKSPACE.initialSection]);
  const [activeSection, setActiveSection] = useState<string>(CS_WORKSPACE.initialSection);

  const [engagementId, setEngagementId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const creatingRef = useRef(false);
  const engagementIdRef = useRef<string | null>(null);
  useEffect(() => { engagementIdRef.current = engagementId; }, [engagementId]);

  /* ─── Load existing engagement from ?id= on mount ───
   *  Read from window.location (client-only) to avoid the
   *  useSearchParams Suspense requirement on this static route. */
  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return;
    (async () => {
      const res = await getEngagement(id);
      if (!res.ok) return;
      setForm(res.data.data as Customer);
      setEngagementId(id);
      setSaveStatus("saved");
    })();
  }, []);

  /* ─── Auto-populate rail from hasContent ─── */
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

  /* Guided + jumpable Next: advance through the section order one step
   *  at a time (adding the next section), or generate on the last one. */
  const orderIdx = CS_WORKSPACE.sectionOrder.indexOf(activeSection);
  const nextStepDef =
    orderIdx >= 0 && orderIdx < CS_WORKSPACE.sectionOrder.length - 1
      ? CS_WORKSPACE.sections.find((s) => s.id === CS_WORKSPACE.sectionOrder[orderIdx + 1])
      : undefined;
  const goNext = () => {
    if (!nextStepDef) { handleGenerate(); return; }
    setAddedSections((prev) => (prev.includes(nextStepDef.id) ? prev : [...prev, nextStepDef.id]));
    setActiveSection(nextStepDef.id);
  };
  /* Opt-out: drop the active section from the engagement (company is
   *  the anchor and can't be removed). Jumps to the previous added one. */
  const canRemove = activeSection !== CS_WORKSPACE.initialSection;
  const removeActiveSection = () => {
    if (!canRemove) return;
    setAddedSections((prev) => {
      const next = prev.filter((id) => id !== activeSection);
      const fallback = next[next.length - 1] ?? CS_WORKSPACE.initialSection;
      setActiveSection(fallback);
      return next;
    });
  };

  /* ─── Engagement persistence (auto-save) ─── */
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

  /* ─── Generate (read-only review render) ─── */
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
            <Link
              href="/cs/mine"
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 focus-visible:ring-offset-boost-purple rounded-sm px-2 py-0.5 whitespace-nowrap"
            >
              My engagements
            </Link>
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
            href="/cs"
            aria-label="Back to Customer Success home"
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
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="inline-flex items-center gap-1 rounded-md bg-boost-green-light/15 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-boost-green">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                  You edit here
                </span>
                <span className="text-[11px] text-boost-muted">
                  Type into this section — what you enter shows up in the preview below.
                </span>
              </div>
              <CollapsibleSection
                number={activeDef.number}
                title={activeDef.title}
                subtitle={activeDef.preview(form)}
                hasContent={activeDef.hasContent(form)}
              >
                <ActivePanel form={form} update={update} />
              </CollapsibleSection>
            </div>
          ) : null}

          {/* Guided Next + opt-out */}
          {activeDef ? (
            <div className="flex items-center justify-between gap-3">
              {canRemove ? (
                <button
                  type="button"
                  onClick={removeActiveSection}
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-boost-muted hover:text-boost-gold transition-colors"
                >
                  Remove from engagement
                </button>
              ) : <span />}
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-1.5 rounded-lg bg-boost-green-light px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-white hover:bg-boost-green-light/90 transition-colors shadow-sm"
              >
                {nextStepDef ? <>Confirm &amp; continue<span aria-hidden="true">→</span></> : <>Review &amp; generate<span aria-hidden="true">→</span></>}
              </button>
            </div>
          ) : null}

          {ActivePreview ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="inline-flex items-center gap-1 rounded-md bg-boost-purple/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-boost-purple">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Preview only
                </span>
                <span className="text-[11px] text-boost-muted">
                  Read-only — how this section looks in the finished guide. You can&apos;t type here.
                </span>
              </div>
              <div className="rounded-xl border-2 border-dashed border-boost-purple/25 bg-boost-surface/30 overflow-hidden">
                <div className="px-4 py-2 border-b border-boost-purple/15 bg-boost-purple/[0.04] flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-boost-purple/70" aria-hidden="true">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-boost-purple/70">
                    Live preview
                  </p>
                </div>
                <div className="p-2 sm:p-4 bg-white">
                  <ActivePreview customer={form} sectionNumber={String(activeDef?.number ?? "")} />
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
