export interface ChannelVolumes {
  chat?: number;
  voice?: number;
  email?: number;
  social?: number;
}

export interface IntegrationSelections {
  channel?: string[];
  human_handover?: string[];
  openid?: string[];
  utility?: string[];
  voice?: string[];
}

export type PricingModel = "fixed" | "usage" | "outcome";

export interface ResourceAllocation {
  stakeholder_owners?: number;
  ai_trainers?: number;
  technical_resources?: number;
  supporting_departments?: string[];
  knowledge_management?: boolean;
}

export interface GuideData {
  id: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  company_url: string;
  contact_name: string;
  contact_role: string;
  start_date: string;
  areas_of_interest: string[];
  specific_requirements: string;
  channel_volumes: ChannelVolumes;
  conversation_cost: string;
  pricing_model: PricingModel;
  deployment_markets: number;
  resources: ResourceAllocation;
  integrations: IntegrationSelections;
  custom_notes: string;
  /** Selected case study IDs — empty means show all (industry-sorted) */
  selected_case_studies?: string[];
  /** Selected industry-variant keys (e.g. "insurance:mutual", "banking:retail")
   *  — empty means no variant filter (all agents of the selected industries shown). */
  selected_variants?: string[];
  custom_section?: {
    title: string;
    body: string;
    image_url?: string;
    video_url?: string;
  };
}

export interface GuideFormData {
  company_name: string;
  company_url: string;
  contact_name: string;
  contact_role: string;
  start_date: string;
  areas_of_interest: string[];
  specific_requirements: string;
  channel_volumes: ChannelVolumes;
  conversation_cost: string;
  pricing_model: PricingModel;
  deployment_markets: number;
  resources: ResourceAllocation;
  integrations: IntegrationSelections;
  custom_notes: string;
  /** Selected case study IDs — empty means show all (industry-sorted) */
  selected_case_studies?: string[];
  /** Selected industry-variant keys (e.g. "insurance:mutual", "banking:retail")
   *  — empty means no variant filter (all agents of the selected industries shown). */
  selected_variants?: string[];
  custom_section?: {
    title: string;
    body: string;
    image_url?: string;
    video_url?: string;
  };
  /** Which Chat Preview mode to render. See `DemoMode` below.
   *  Defaults to the simulated scripted demo when omitted — zero
   *  regression for existing share URLs. Set via admin "Demos". */
  demo_mode?: DemoMode;
  /** Only used when `demo_mode === "custom_live"` — the tenant
   *  domain (e.g. `"acme.boost.ai"`) for a customer's own chatbot.
   *  Ignored in other modes. */
  demo_tenant?: string;
}

/* ──────────────────────────────────────────────────────────────
 *  Unified Customer data model — spans Sales, Customer Excellence,
 *  and Professional Services work modes over a single record.
 *
 *  Design contract:
 *    - Additive-only schema. No existing field is ever removed or
 *      renamed; new fields land as optional. Old JSON stays valid.
 *    - JSON-serializable end-to-end. Timestamps are ISO 8601 strings,
 *      never Date objects. No functions on stored records.
 *    - Customer IS-A GuideFormData via structural extension — any code
 *      consuming GuideFormData accepts a Customer unchanged. Sales
 *      paths continue to work without migration.
 *    - Audience-agnostic storage. Any audience reads any field; the
 *      admin UI gates *editing* rights by audience, not visibility.
 *    - Recommendations logic lives in the external decision-engine
 *      platform. This tool only stores `accepted_initiatives` (FKs
 *      into that platform) and renders the recommendations it returns.
 * ────────────────────────────────────────────────────────────── */

/** Schema version emitted by this codebase. Additive-only evolution —
 *  fields are only added, never removed or renamed. Useful for
 *  consumer metrics / debugging; does not gate parsing. */
export const CUSTOMER_SCHEMA_VERSION = "v1.3.0";

/** Which Boost work mode is operating on this customer right now.
 *  Drives admin UI layout, default block library, landing-page route. */
export type Audience = "sales" | "customer-excellence" | "professional-services";

/** Customer workflow state. Loops are legitimate — a `live` customer
 *  can cycle back to `delivering` when expansion kicks off. See
 *  `handoffs[]` for the append-only audit trail. */
export type Lifecycle =
  | "prospect"
  | "scoping"
  | "delivering"
  | "live"
  | "expansion"
  | "at-risk";

/** Boost-side service tier assigned to the customer. Affects default
 *  team composition, review cadence, and which blocks the admin
 *  pre-selects for common artifacts. */
export type TouchLevel = "low" | "mid" | "high" | "strategic";

/** Append-only record of a lifecycle handoff between audiences.
 *  Loops (e.g. live → delivering → live) append new entries rather
 *  than mutating earlier ones — the trail stays visible on purpose. */
export interface LifecycleHandoff {
  from: Audience;
  to: Audience;
  /** ISO 8601 timestamp. */
  at: string;
  /** Short summary — e.g. "Expansion kicked off, PS picking up architecture". */
  summary: string;
  /** Author display name or email. */
  by: string;
  /** Optional link to the triggering artifact (SOW, BR, recommendation). */
  artifact_url?: string;
}

/** PS-owned technical detail. Sales reads it (for expansion conversations),
 *  CE reads it (to avoid re-asking during reviews). */
export interface ArchitectureDetails {
  /** e.g. ["BankID", "SSO", "OAuth2"] */
  auth_methods?: string[];
  /** e.g. "EU", "NO/SE/FI", "US-East" */
  data_residency?: string;
  /** Link to a diagram asset (Lucid, Miro, stored image). */
  system_diagram_url?: string;
  /** Structured integration inventory — what system, what pattern, why. */
  integration_specifics?: Array<{
    system: string;          // e.g. "Salesforce", "Avaya"
    purpose: string;         // e.g. "CRM for ticket handover"
    pattern: "api" | "webhook" | "middleware" | "event-bus";
    notes?: string;
  }>;
  /** Freeform technical notes — the rich context PS captures so CE
   *  doesn't spend hours re-discovering it during a BR. */
  technical_notes?: string;
}

/** Rich sidecar for a single PerformanceMetrics field — drives the
 *  drill-down modal in PerformanceSection. Keyed on Customer by the
 *  matching metric field name (e.g. "automation_rate"). All fields
 *  optional; render only what's present. */
export interface PerformanceMetricDetail {
  /** One-paragraph explanation of what drove the current value + delta.
   *  e.g. "Q1 jump from 62 → 68 came from the returns agent rollout
   *  absorbing ~8k agent-hours." */
  narrative?: string;
  /** Chronological data points for the tile-click mini sparkline.
   *  Most-recent last. Each point: { at: ISO date, value: number }. */
  history?: Array<{ at: string; value: number }>;
  /** Initiative IDs from accepted_initiatives that are credited with
   *  moving this metric. Rendered as linked cards in the modal. */
  linked_initiative_ids?: string[];
}

/** CE-owned performance telemetry, populated from the customer's
 *  live deployment (either manually during BR prep or — future — via
 *  API pull from Planhat / the customer's analytics stack). */
export interface PerformanceMetrics {
  /** Percentage, 0–100. */
  automation_rate?: number;
  /** Percentage of unknown / un-predicted messages, 0–100. */
  unknown_rate?: number;
  /** CSAT score on the customer's own scale (e.g. 4.7 out of 5). */
  csat_score?: number;
  /** Percentage escalated to human, 0–100. */
  escalation_rate?: number;
  /** Rolling average of monthly conversation volume. */
  monthly_conversations?: number;
  /** Number of markets the customer has deployed to. */
  markets_live?: number;
  /** Number of active specialist agents in production. */
  active_agents?: number;
  /** ISO 8601 of the measurement window (helps distinguish a Q1 metric
   *  from a Q3 metric when both are stored on the same record). */
  measured_from?: string;
  measured_to?: string;

  /* ─── Previous-period values for trend deltas ─────────────────
   * Optional — populated when a comparison window (previous quarter,
   * previous BR) is available. PerformanceSection reads these to
   * render up/down/flat trend arrows. Upgrade path to a richer
   * `performance_history: Snapshot[]` later without breaking
   * callers that only read the current + previous fields. */
  previous_automation_rate?: number;
  previous_unknown_rate?: number;
  previous_csat_score?: number;
  previous_escalation_rate?: number;
  previous_monthly_conversations?: number;
  previous_markets_live?: number;
  previous_active_agents?: number;
}

/** Recurring meeting cadence — the Governance Model pyramid
 *  (Executive / BR / Operational / SLA / Delivery) expressed as data. */
export interface GovernanceCadence {
  executive_review_frequency?: "annual" | "semi-annual" | "quarterly";
  business_review_frequency?: "monthly" | "quarterly" | "semi-annual";
  operational_review_frequency?: "weekly" | "biweekly" | "monthly";
  /** Customer-side executive sponsor. Used for escalation + BR invites.
   *  When `stakeholders` is populated, that richer list is the source
   *  of truth; this field stays for back-compat and is shown if
   *  stakeholders has no sponsor flagged. */
  executive_sponsor?: string;
  /** ISO 8601 of the last completed Business Review. */
  last_business_review?: string;
  /** ISO 8601 of the next scheduled Business Review. */
  next_business_review?: string;
  /** Named customer-side stakeholders — powering the sponsor-card
   *  detail modal. At least one should typically be flagged
   *  `is_sponsor: true`. */
  stakeholders?: Array<{
    name: string;
    role?: string;
    email?: string;
    phone?: string;
    /** True marks this person as the escalation / BR-invitee sponsor. */
    is_sponsor?: boolean;
  }>;
  /** Short summary of what was agreed / decided at the last BR.
   *  Rendered inline when the Last-BR card is expanded. */
  last_business_review_summary?: string;
  /** Preview of the planned focus topics for the next BR. Rendered
   *  inline when the Next-BR card is expanded. */
  next_business_review_focus?: string[];
}

/** Free-form note attached to a customer by any audience.
 *  Append-only — notes never get edited or deleted through the admin
 *  UI, so the history stays honest. */
export interface AudienceNote {
  audience: Audience;
  author: string;
  /** ISO 8601 timestamp. */
  at: string;
  /** Markdown body. */
  body: string;
  attachments?: Array<{
    name: string;
    url: string;
    kind?: "image" | "pdf" | "doc" | "link";
  }>;
}

/** Reference to an initiative from the external decision-engine platform
 *  that this customer has accepted as active work. Recommendations are
 *  produced by the decision engine (270 initiatives across 40–60
 *  weighted issues); this record captures *which ones this customer
 *  agreed to* during a review, and their execution status. */
export interface AcceptedInitiative {
  /** FK into the decision-engine platform's initiative catalogue. */
  initiative_id: string;
  /** FK into the decision-engine platform's issue taxonomy. */
  issue_id: string;
  /** ISO 8601 of when the customer + CSM agreed to pursue this. */
  accepted_at: string;
  accepted_by: string;
  /** Optional target, e.g. "2026-Q2" or "2026-06". */
  target_quarter?: string;
  status: "proposed" | "accepted" | "in-progress" | "done" | "dropped";
  /** Optional short summary of the outcome, written on close. */
  outcome_notes?: string;

  /* ─── Optional plan metadata (drives SuccessPlanSection) ──────
   * Populated when an initiative is being tracked as a time-boxed
   * deliverable (Gantt bar, owner pill, theme swim-lane). Kept
   * optional so "accepted but not yet planned" initiatives remain
   * valid. */

  /** Human-readable display title. Falls back to initiative_id if absent. */
  title?: string;
  /** ISO 8601 of planned start. */
  start_date?: string;
  /** ISO 8601 of planned completion. */
  end_date?: string;
  /** Person accountable on the customer side. */
  owner?: string;
  /** Swim-lane classification — e.g. "automation", "quality", "expansion",
   * "adoption", "integration". SuccessPlanSection colours lanes by theme. */
  theme?: string;
  /** One-line impact statement shown below the title. */
  business_impact?: string;
  /** Sub-tasks inside this initiative. Rendered in the
   *  InitiativeDetailModal as a checklist. Optional so thin
   *  initiatives (just a title + dates) still round-trip fine. */
  tasks?: Array<{ title: string; done?: boolean }>;
  /** Current health — surfaced as a RAG badge in the detail modal
   *  + (later) on the Gantt bar as a secondary indicator. */
  rag_status?: "green" | "amber" | "red";
  /** Optional free-form notes the CSM has captured — rendered in
   *  the detail modal below the tasks. */
  notes?: string;
}

/** SWOT quadrant for a single specialist agent. Rendered by
 *  AgentSwotSection, one card per agent keyed by agent_key. */
export interface AgentSwot {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

/** Rollout / UAT health signal per agent (and optionally per market).
 *  Traffic-light status + short note. Rendered by UatStatusSection. */
export interface UatStatusEntry {
  /** Matches a SpecialistAgent.key from `src/data/agents/`. */
  agent_key: string;
  /** Optional market code (e.g. "NO", "SE", "FI") — blank = all markets. */
  market?: string;
  status: "green" | "amber" | "red";
  /** Short explanation of the current status. */
  note?: string;
  /** Chronological status history. Most-recent entries first. Rendered
   *  as an inline timeline when the user expands the row. Optional —
   *  omit for entries where only the current status matters. */
  history?: Array<{
    /** ISO 8601 timestamp when this status was set. */
    at: string;
    status: "green" | "amber" | "red";
    /** Why the status changed (optional). */
    note?: string;
  }>;
}

/** Peer / industry benchmark values keyed by metric name. Metric key
 *  matches a field on PerformanceMetrics (e.g. "automation_rate",
 *  "csat_score"). BenchmarkingSection draws the customer's own value
 *  against these averages. */
export interface BenchmarkEntry {
  peer_avg?: number;
  industry_avg?: number;
  /** Optional display label if the metric key isn't self-explanatory. */
  label?: string;
  /** One-liner defining the metric — what does it measure, what's a
   *  good score. Shown in the benchmark detail modal so the reader
   *  doesn't have to guess. */
  definition?: string;
  /** Who's in the peer cohort and how it's constructed —
   *  e.g. "12 Nordic retailers with >5M monthly customer interactions".
   *  Calibrates the reader's trust in the comparison. */
  peer_cohort_description?: string;
  /** Short narrative about how the customer sits relative to peers —
   *  e.g. "Strongly ahead on automation; investment in the returns
   *  agent is paying off." Rendered in the modal below the chart. */
  interpretation?: string;
  /** Optional percentile (0–100) showing where the customer falls
   *  within the peer distribution. Renders as a "ahead of N% of
   *  peers" chip when populated. */
  percentile?: number;
}

/** Recommendation shape. Today this is populated manually by the CSM;
 *  tomorrow the same shape will arrive from the external
 *  decision-engine API (~270 initiatives across weighted issues).
 *  Keeping the shape stable now means the API swap is config-only. */
export interface Recommendation {
  title: string;
  rationale: string;
  /** 0–1 normalized weight. Higher = more relevant. */
  weight?: number;
  urgency?: "immediate" | "this-quarter" | "this-year" | "exploratory";
  confidence?: "high" | "medium" | "low";
  tags?: string[];

  /** What "done" looks like — concrete, scannable bullets. Populated
   *  manually now; engine-authored once wired. Rendered in the
   *  detail modal. */
  expected_outcomes?: string[];
  /** Things that must be true for this recommendation to succeed.
   *  `met: true` renders as a checkmark (already in place), `false`
   *  renders as a warning dot (still pending). */
  prerequisites?: Array<{ label: string; met?: boolean }>;
}

/** Single agenda row. Used for both CE business reviews and Sales
 *  discovery/demo meetings. Style decided per-section (timed uses
 *  `time`; numbered ignores it). */
export interface AgendaItem {
  /** "11:00" etc. — used when the agenda style is "timed". */
  time?: string;
  topic: string;
  subtitle?: string;
  owner?: string;
  /** Optional duration hint for length estimation. */
  minutes?: number;
  /** Longer talking points / context shown when the CSM or customer
   *  clicks the item to expand. Bullets authored as free-form text;
   *  AgendaSection renders as a short prose block beneath the row. */
  notes?: string;
}

/** Business Review / meeting context — drives AgendaSection and any
 *  meeting-opener chrome (attendee strip, meeting title in header).
 *  Present on CE customers every BR; optional on Sales. */
export interface BrContext {
  meeting_title?: string;
  /** ISO 8601 of the meeting date. */
  meeting_date?: string;
  attendees?: string[];
  agenda_items?: AgendaItem[];
  /** "timed" = hh:mm gutter; "numbered" = 01/02/03 gutter. */
  agenda_style?: "timed" | "numbered";
}

/** End-user / stakeholder feedback captured during a BR cycle.
 *  Ranges from verbatim quotes to thematic summaries. Rendered via
 *  CustomSection until usage data justifies a dedicated surface. */
export interface CustomerFeedbackEntry {
  theme: string;
  sentiment: "positive" | "neutral" | "negative";
  quote: string;
  /** Boost-side response or planned action, if any. */
  response?: string;
}

/** Before/after pair for the agentic transformation story.
 *  Pre-boost vs post-boost outcomes per topic. The "before" and
 *  "after" values are intentionally string-typed so the CSM can
 *  author mixed units ("2 min avg handle time" / "35 sec") without
 *  forcing a rigid schema. Drives AgenticBeforeAfterSection. */
export interface AgenticOutcome {
  /** The topic / agent this before-after is about.
   *  e.g. "Order status", "Returns", "Card operations". */
  topic: string;
  before: { label: string; value: string };
  after: { label: string; value: string };
  /** One-line narrative explaining why this transformation matters. */
  narrative?: string;
  /** Data points that validate the "after" claim — shown in the
   *  detail modal as a scannable evidence list. e.g.
   *  ["84% of queries contained in 4 weeks post-launch",
   *   "CSAT lift from 4.1 → 4.3 in the returns flow"]. Optional. */
  evidence?: string[];
  /** ISO 8601 of when the "after" value was measured. Calibrates
   *  freshness — a number measured 6 months ago is weaker evidence
   *  than a number measured last quarter. */
  validated_on?: string;
}

/**
 * Customer — unified record spanning all three audiences.
 *
 * IS-A GuideFormData via structural extension — admin and guide code
 * paths accept a Customer transparently. CE/PS surfaces, the future
 * decision-engine connector, and the persistence layer all operate
 * on the superset.
 */
export interface Customer extends GuideFormData {
  /** Stable customer identifier. Generated on first persistence. */
  id?: string;
  /** ISO 8601 of record creation. */
  created_at?: string;
  /** ISO 8601 of most recent write. */
  updated_at?: string;
  /** Schema version this record was written under. Defaults to
   *  CUSTOMER_SCHEMA_VERSION when omitted. */
  schema_version?: string;

  /** Current workflow state. Drives default audience + admin layout. */
  lifecycle?: Lifecycle;
  /** Boost-side service tier. Affects team composition + cadence defaults. */
  touch_level?: TouchLevel;
  /** Whether the customer has a paid CS package
   *  (changes default governance cadence + admin block availability). */
  has_cs_package?: boolean;

  /** Append-only audit trail of audience-to-audience handoffs. */
  handoffs?: LifecycleHandoff[];

  /** PS-owned technical context. */
  architecture?: ArchitectureDetails;

  /** CE-owned performance telemetry. */
  performance?: PerformanceMetrics;

  /** Per-metric narrative + history for the Performance tile
   *  drill-downs. Key = matching PerformanceMetrics field name. */
  performance_details?: Partial<Record<keyof PerformanceMetrics, PerformanceMetricDetail>>;

  /** Review cadence / executive sponsor. */
  governance?: GovernanceCadence;

  /** Free-form cross-audience notes, append-only. */
  audience_notes?: AudienceNote[];

  /** Initiatives from the decision engine the customer has accepted. */
  accepted_initiatives?: AcceptedInitiative[];

  /* ─── CE-surface fields ──────────────────────────────────────
   * All optional, additive-only. CE sections render only when the
   * corresponding field is populated; Sales and PS ignore them. */

  /** Per-agent SWOT, keyed by agent_key. Drives AgentSwotSection. */
  agent_swot?: Record<string, AgentSwot>;

  /** Rollout / UAT health entries. Drives UatStatusSection. */
  uat_status?: UatStatusEntry[];

  /** Peer / industry benchmarks keyed by metric name. Drives
   *  BenchmarkingSection. */
  benchmarks?: Record<string, BenchmarkEntry>;

  /** Ranked recommendations surfaced in the CE guide. Today: manual;
   *  tomorrow: hydrated from the decision-engine API with the same
   *  shape. Drives TopRecommendationsSection. */
  recommendations?: Recommendation[];

  /** Business Review / meeting context. Drives AgendaSection +
   *  meeting-opener chrome. */
  br_context?: BrContext;

  /** End-user feedback captured during the BR cycle. */
  customer_feedback?: CustomerFeedbackEntry[];

  /** Pre-boost vs post-boost outcome pairs. Drives
   *  AgenticBeforeAfterSection — the "agentic transformation"
   *  story told as side-by-side tiles. */
  agentic_outcomes?: AgenticOutcome[];

  /* ─── Scope-of-Work fields ───────────────────────────────────
   * All optional, additive-only. Cross-audience by design: most of
   * this content is captured by Sales (sometimes by CE for expansion
   * or custom work), then enriched by PS with technical detail
   * (auth specifics, voice gateway, customer APIs, architecture
   * detail, RACI hours, out-of-scope). Together these fields form
   * the in-guide Scope of Work surfaced primarily in the PS view. */

  /** Handoff checklist — the 5 "did Sales / CE give us what we need"
   *  items Pre-sales or CSM marks before PS picks up work. Drives the
   *  sticky handoff chip at the top of the PS guide. */
  handoff_checklist?: PsHandoffChecklist;

  /** Project framing — introduction, goals, success criteria, KPIs,
   *  and example use-cases. Authored during Sales; PS may refine.
   *  Drives ProjectFramingSection. */
  project_framing?: PsFraming;

  /** Project details — type, instances, traffic mix, volume
   *  projections. Authored during Sales. Drives ProjectDetailsSection. */
  project_details?: PsProjectDetails;

  /** Build scope — hosting, languages, knowledge coverage, channels,
   *  GenAI config, environments, plus auth / voice / customer API
   *  delivery components. Sales-authored "what"; PS-authored "how".
   *  Drives the tabbed BuildScopeSection. */
  build_scope?: PsBuildScope;

  /** Roles × responsibilities × allocation across Customer / boost.ai /
   *  3rd Party. Expectations set by Sales; hour numbers added by PS.
   *  Drives RolesAndResponsibilitiesSection. */
  roles_and_responsibilities?: PsRaci;

  /** Solution architecture composition — which blocks / connectors /
   *  channels are in play. PS-authored in most engagements. Drives
   *  the interactive SolutionArchitectureSection. */
  solution_architecture?: PsArchitecture;

  /** Explicit exclusions list — "not this". Often emerges during
   *  PS scoping. Drives OutOfScopeSection. */
  out_of_scope?: string[];

  /* `demo_mode` + `demo_tenant` live on GuideFormData (see above)
   * so Customer inherits them via extension. No duplicate fields
   * needed here — admin's `updateField` can set them via the
   * GuideFormData key set. */
}

/** Demo mode for the Chat Preview section.
 *
 *  - `"simulated"` — default. The existing scripted demo with the
 *    AI Review analyzer panel. Zero external deps; works on every
 *    shared URL regardless of whether a customer tenant exists.
 *  - `"live"` — real chat against the shared demo tenant
 *    (`financewizard.boost.ai`). Phase 2 adds a raw-data side panel.
 *  - `"custom_live"` — real chat against the customer's own tenant
 *    (Customer.demo_tenant). Chat only; no raw-data panel (MVP).
 */
export type DemoMode = "simulated" | "live" | "custom_live";

/* ──────────────────────────────────────────────────────────────
 *  Scope-of-Work schema — supporting types for the 7 SoW fields
 *  above. All shapes additive-only. Cross-audience by design.
 * ────────────────────────────────────────────────────────────── */

/** 5-item handoff checklist filled by Sales/CSM before PS engagement.
 *  `required` captures whether the item applies at all; `notes` / `which`
 *  holds the free-text detail when required=true. */
export interface PsHandoffChecklist {
  authentication?: { required: boolean; notes?: string };
  crm_integration?: { required: boolean; which?: string };
  contact_center?: { required: boolean; which?: string };
  additional_integrations?: { required: boolean; which?: string[] };
  partner?: { required: boolean; which?: string };
}

export type PsProjectType = "external_chat" | "internal_chat" | "agent_assist" | "voice" | "other";

export interface PsKpi {
  /** Short label shown on the KPI tile (e.g. "Automation rate"). */
  label: string;
  /** Target value / threshold as display string (e.g. "≥ 72%"). */
  target: string;
  /** Optional narrative explaining how the KPI is measured. */
  notes?: string;
}

export interface PsUseCase {
  title: string;
  /** The current-state experience the VA replaces or augments. */
  today: string;
  /** The post-launch experience this use-case creates. */
  tomorrow: string;
  /** Optional example call / chat flow narrative. */
  call_flow?: string;
}

export interface PsFraming {
  /** 1–3 paragraph introduction — what this project looks like, what
   *  we're solving. Markdown-capable. */
  introduction?: string;
  /** Overriding success criteria + main user journey + objectives. */
  goals?: string;
  /** Target KPIs (typical: automation rate, containment, escalation). */
  kpis?: PsKpi[];
  /** 1–5 example use-cases with today/tomorrow deltas. */
  use_cases?: PsUseCase[];
}

export interface PsTrafficMix {
  /** Share of current volume handled by existing chat / live chat. 0–100. */
  existing_chat?: number;
  telephony?: number;
  email?: number;
  tickets?: number;
  other?: number;
}

export interface PsProjectDetails {
  /** Which project modes are in scope — multi-select. */
  project_type: PsProjectType[];
  /** New boost.ai instance or use of an existing one. */
  instances: "new" | "existing";
  /** Current traffic distribution across channels before go-live. */
  traffic_mix?: PsTrafficMix;
  /** Volume projections 12 months post go-live — projections only,
   *  not contractual commitments. */
  projections?: {
    monthly_chat_sessions?: number;
    monthly_voice_minutes?: number;
    monthly_tokens?: number;
  };
}

export type PsHosting = "aws" | "customer_on_prem" | "boost_on_prem";

export type PsGenAiProvider = "openai_boost" | "openai_own" | "azure_boost" | "azure_own";
export type PsGenAiFeature = "ai_trainer_efficiency" | "generative_action" | "ai_review" | "handover_summary";

export interface PsChatChannel {
  /** Display label (e.g. "Web", "WhatsApp", "Microsoft Teams"). */
  label: string;
  /** URLs or identifiers relevant to this channel. */
  urls?: string[];
  notes?: string;
}

export interface PsAuthentication {
  /** Method summary (e.g. "OAuth2 → BankID", "SAML", "JWT bearer"). */
  method: string;
  provider?: string;
  notes?: string;
}

export interface PsVoiceConfig {
  telephony_provider: string;
  gateway_type: string;
  notes?: string;
}

export interface PsCustomerApi {
  /** API name (e.g. "Order Status API"). */
  name: string;
  /** HTTP verb + intent of use (e.g. "GET · resolve order status"). */
  method: string;
  /** What this API enables in the VA flow. */
  purpose: string;
}

export interface PsBuildScope {
  /** Deliverables — the "what" of the SoW. */
  hosting?: PsHosting;
  languages?: string[];
  /** High-level knowledge coverage (e.g. ["Cards", "Accounts", "Loans"]). */
  knowledge_coverage?: string[];
  expected_intents?: number;
  /** Filters on deployment (e.g. ["authenticated", "web only"]). */
  filters?: string[];
  chat_channels?: PsChatChannel[];
  generative_ai?: {
    enabled: boolean;
    provider?: PsGenAiProvider;
    features?: PsGenAiFeature[];
    knowledge_sync_sources?: string[];
  };
  staging?: boolean;
  test_environment?: boolean;

  /** Delivery components — the "how" of the SoW. Each sub-section
   *  renders as a tab inside BuildScopeSection. */
  authentication?: PsAuthentication;
  voice?: PsVoiceConfig;
  customer_apis?: PsCustomerApi[];
}

/** A single RACI role row with allocation commitments. */
export interface PsRoleEntry {
  role: string;
  responsibilities: string[];
  /** Allocation during implementation + hypercare (e.g. "20% FTE", "X hrs/month"). */
  implementation?: string;
  /** Allocation once in production (e.g. "Customer preference", "n/a"). */
  production?: string;
}

export interface PsRaci {
  customer_roles: PsRoleEntry[];
  boost_roles: PsRoleEntry[];
  third_party?: PsRoleEntry[];
}

/** A group of related architecture blocks, rendered as a column or
 *  cluster in the interactive diagram. */
export interface PsArchitectureGroup {
  key: string;
  label: string;
  items: string[];
}

export interface PsArchitecture {
  /** Architecture composition — channels, boost core, backend, etc.
   *  Each group maps to a cluster in the diagram. */
  groups: PsArchitectureGroup[];
  /** Free-form notes, caveats, or deviations from the standard. */
  notes?: string;
}
