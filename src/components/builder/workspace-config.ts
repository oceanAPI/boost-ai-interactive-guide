/* ──────────────────────────────────────────────────────────────
 *  Workspace configuration
 *
 *  A WorkspaceConfig describes a builder surface (rail + section
 *  panels + Generate target) declaratively, so the shared shell in
 *  `src/components/builder/` can drive more than one route without a
 *  parameterized mega-component.
 *
 *  Why a config object and not a refactor of admin/page.tsx:
 *    The Sales builder (`/admin`) is a ~4000-line, SWC-parse-fragile
 *    file whose section registry is welded to dozens of inline
 *    `has*` booleans and `form`-derived previews. Lifting that whole
 *    state graph into a config would be high-risk for zero user-facing
 *    gain. So admin keeps its inline registry; this config exists for
 *    *new* surfaces — today the Customer Success Manager workspace
 *    (`/cs`) — that are built fresh against the shared leaves
 *    (Rail / CollapsibleSection / RailItemDescriptor).
 *
 *  Contract:
 *    - `sections[].id` is the rail row + the active-panel key.
 *    - `preview(form)` and `hasContent(form)` are PURE functions of
 *      the builder's form object. They feed RailItemDescriptor.
 *    - `sectionOrder` drives the "+ Add next" walk; `initialSection`
 *      is the row the rail opens on.
 *    - Additive-only. New sections append to `sections` + `sectionOrder`.
 * ────────────────────────────────────────────────────────────── */

import type { Audience, Customer } from "@/lib/types";
import type { RailItemDescriptor } from "./Rail";

/** One section in a workspace, declared as data. `TForm` is the
 *  builder's mutable form object (Sales: GuideFormData; CS: Customer). */
export interface WorkspaceSectionDef<TForm> {
  /** Stable id — rail row key + active-panel selector. */
  id: string;
  /** Display number on the rail row. Stable for back-compat. */
  number: number;
  title: string;
  /** One-liner shown under the rail row title. Pure on form. */
  preview: (form: TForm) => string;
  /** True once the section holds user-entered content — drives the
   *  green check + the auto-add-to-rail effect. Pure on form. */
  hasContent: (form: TForm) => boolean;
}

export interface WorkspaceConfig<TForm> {
  /** Internal handle — "sales" | "customer-success". */
  workspace: string;
  /** Audience param threaded into the Generate URL + banner chrome. */
  audience: Audience;
  /** Route base for the builder, e.g. "/cs". */
  routeBase: string;
  /** Ordered section catalogue. */
  sections: WorkspaceSectionDef<TForm>[];
  /** Recommended progressive-add order (ids). */
  sectionOrder: string[];
  /** Section the rail opens on. */
  initialSection: string;
}

/** Build the rail descriptor list for a config + current form. Shared
 *  by every workspace route so the rail render path stays identical. */
export function railItemsFor<TForm>(
  config: WorkspaceConfig<TForm>,
  form: TForm,
  visibleIds: string[],
): RailItemDescriptor[] {
  const order = new Map(visibleIds.map((id, i) => [id, i]));
  return config.sections
    .filter((s) => order.has(s.id))
    .sort((a, b) => (order.get(a.id)! - order.get(b.id)!))
    .map((s) => ({
      id: s.id,
      number: s.number,
      title: s.title,
      preview: s.preview(form),
      hasContent: s.hasContent(form),
    }));
}

/* ─── Customer Success Manager (CSM) workspace ───────────────────
 *  The post-sale value narrative. Manual customer entry (no Planhat
 *  / fixture pull yet) plus the nine CE-authoring panels that write
 *  the CE slices of the Customer record (performance, benchmarks,
 *  recommendations, accepted_initiatives, agent_swot, uat_status,
 *  governance, br_context, agentic_outcomes). Read/render half is
 *  free — the CE section components already consume these fields.
 *
 *  Render order mirrors CS_DEFAULTS in src/data/audience-sections.ts.
 *  platform-vision / resources / next-steps are render-only (no
 *  authoring panel) so they have no rail row here — they're emitted
 *  to the guide via ?sections= but aren't part of the authoring rail. */
export const CS_WORKSPACE: WorkspaceConfig<Customer> = {
  workspace: "customer-success",
  audience: "customer-success",
  routeBase: "/cs",
  initialSection: "company",
  sectionOrder: [
    "company",
    "agenda",
    "performance",
    "agentic-before-after",
    "benchmarking",
    "top-recommendations",
    "success-plan",
    "agent-swot",
    "uat-status",
    "governance",
  ],
  sections: [
    {
      id: "company",
      number: 1,
      title: "Customer",
      preview: (f) => f.company_name || "Identity, industry, agents",
      hasContent: (f) => !!f.company_name?.trim(),
    },
    {
      id: "agenda",
      number: 2,
      title: "Meeting Agenda",
      preview: (f) => {
        const n = f.br_context?.agenda_items?.length ?? 0;
        return n ? `${n} agenda item${n === 1 ? "" : "s"}` : "BR title, date, agenda";
      },
      hasContent: (f) =>
        !!f.br_context?.meeting_title?.trim() ||
        (f.br_context?.agenda_items?.length ?? 0) > 0,
    },
    {
      id: "performance",
      number: 3,
      title: "Performance",
      preview: (f) => {
        const p = f.performance;
        if (!p) return "Automation, CSAT, volumes";
        return p.automation_rate != null
          ? `${p.automation_rate}% automation`
          : "Metrics added";
      },
      hasContent: (f) =>
        !!f.performance && Object.values(f.performance).some((v) => v != null),
    },
    {
      id: "agentic-before-after",
      number: 4,
      title: "Agentic Transformation",
      preview: (f) => {
        const n = f.agentic_outcomes?.length ?? 0;
        return n ? `${n} before/after pair${n === 1 ? "" : "s"}` : "Pre vs post-Boost outcomes";
      },
      hasContent: (f) => (f.agentic_outcomes?.length ?? 0) > 0,
    },
    {
      id: "benchmarking",
      number: 5,
      title: "Benchmarking",
      preview: (f) => {
        const n = Object.keys(f.benchmarks ?? {}).length;
        return n ? `${n} metric${n === 1 ? "" : "s"} benchmarked` : "Peer / industry averages";
      },
      hasContent: (f) => Object.keys(f.benchmarks ?? {}).length > 0,
    },
    {
      id: "top-recommendations",
      number: 6,
      title: "Recommendations",
      preview: (f) => {
        const n = f.recommendations?.length ?? 0;
        return n ? `${n} recommendation${n === 1 ? "" : "s"}` : "Ranked next moves";
      },
      hasContent: (f) => (f.recommendations?.length ?? 0) > 0,
    },
    {
      id: "success-plan",
      number: 7,
      title: "Success Plan",
      preview: (f) => {
        const n = f.accepted_initiatives?.length ?? 0;
        return n ? `${n} initiative${n === 1 ? "" : "s"}` : "Committed initiatives + progress";
      },
      hasContent: (f) => (f.accepted_initiatives?.length ?? 0) > 0,
    },
    {
      id: "agent-swot",
      number: 8,
      title: "Agent SWOT",
      preview: (f) => {
        const n = Object.keys(f.agent_swot ?? {}).length;
        return n ? `${n} agent${n === 1 ? "" : "s"}` : "Per-agent strengths / gaps";
      },
      hasContent: (f) => Object.keys(f.agent_swot ?? {}).length > 0,
    },
    {
      id: "uat-status",
      number: 9,
      title: "UAT / Rollout Status",
      preview: (f) => {
        const n = f.uat_status?.length ?? 0;
        return n ? `${n} status entr${n === 1 ? "y" : "ies"}` : "Rollout health per agent";
      },
      hasContent: (f) => (f.uat_status?.length ?? 0) > 0,
    },
    {
      id: "governance",
      number: 10,
      title: "Governance & Cadence",
      preview: (f) => {
        const g = f.governance;
        if (!g) return "Sponsor, review cadence";
        return g.business_review_frequency
          ? `${g.business_review_frequency} BR`
          : g.executive_sponsor || "Cadence set";
      },
      hasContent: (f) =>
        !!f.governance && Object.values(f.governance).some((v) => v != null),
    },
  ],
};
