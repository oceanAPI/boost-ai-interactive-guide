"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { assetPath } from "@/lib/asset-path";
import {
  AdminPrompt,
  AdminChip,
  AdminChipRow,
  AdminMiniLabel,
} from "@/components/admin/primitives";

/* ──────────────────────────────────────────────────────────────
 *  Integrations admin (/admin/integrations) — UI SHELL.
 *
 *  Narrowly gated above the general boost.ai /admin* proxy gate to a
 *  hand-picked operator allow-list. Lets an operator register a
 *  Planhat / AWS connection and map its fields onto the tool's
 *  Customer record.
 *
 *  STATUS: front-end shell only. Nothing here persists yet — saving
 *  connections + field maps is blocked on the Supabase project being
 *  recreated (the old project ref is gone / NXDOMAIN). When the DB is
 *  back, the local state below swaps for server actions, and the
 *  client-side allow-list gate becomes a server-side backstop (a
 *  client gate alone is cosmetic — never the security boundary).
 *
 *  Secrets are NOT entered here. API keys / service-role secrets live
 *  in env vars (Vercel + .env.local), never typed into the browser.
 * ────────────────────────────────────────────────────────────── */

const ALLOWED_INTEGRATION_EMAILS = [
  "dev@boost.ai",
  "mikal@boost.ai",
  "jakob@boost.ai",
];

type Provider = "planhat" | "aws";

type Connection = {
  id: string;
  name: string;
  provider: Provider;
  endpoint: string;
  authNote: string;
  status: "draft" | "connected";
};

type FieldOption = { value: string; label: string; group: string };

/* Sample source-field catalogs per provider — placeholder until the
 * live schema is fetched from the connection. */
const SOURCE_FIELDS: Record<Provider, FieldOption[]> = {
  planhat: [
    { group: "Company", value: "company.name", label: "company.name" },
    { group: "Company", value: "company.phase", label: "company.phase" },
    { group: "Company", value: "company.mrr", label: "company.mrr" },
    { group: "Company", value: "company.owner.email", label: "company.owner.email" },
    { group: "Company", value: "company.renewalDate", label: "company.renewalDate" },
    { group: "Metrics", value: "metrics.health", label: "metrics.health" },
    { group: "Metrics", value: "metrics.nps", label: "metrics.nps" },
    { group: "Metrics", value: "metrics.csat", label: "metrics.csat" },
    { group: "Custom", value: "custom.automationRate", label: "custom.automationRate" },
    { group: "Custom", value: "custom.unknownRate", label: "custom.unknownRate" },
    { group: "Custom", value: "custom.escalationRate", label: "custom.escalationRate" },
    { group: "Custom", value: "custom.monthlyConversations", label: "custom.monthlyConversations" },
    { group: "Custom", value: "custom.activeAgents", label: "custom.activeAgents" },
  ],
  aws: [
    { group: "Connect", value: "connect.contactsHandled", label: "connect.contactsHandled" },
    { group: "Connect", value: "connect.abandonRate", label: "connect.abandonRate" },
    { group: "Connect", value: "connect.avgHandleTime", label: "connect.avgHandleTime" },
    { group: "Lex", value: "lex.intentName", label: "lex.intentName" },
    { group: "Lex", value: "lex.missedUtterances", label: "lex.missedUtterances" },
    { group: "Lex", value: "lex.fulfilledCount", label: "lex.fulfilledCount" },
    { group: "S3", value: "s3.intentTrafficExport", label: "s3.intentTrafficExport (CSV)" },
    { group: "CloudWatch", value: "cloudwatch.escalationRate", label: "cloudwatch.escalationRate" },
    { group: "CloudWatch", value: "cloudwatch.automationRate", label: "cloudwatch.automationRate" },
    { group: "Instance", value: "instance.arn", label: "instance.arn" },
  ],
};

/* The full interactive-guide field catalog — every field the guide's
 * data-driven sections read off the Customer record (src/lib/types.ts:
 * GuideFormData + Customer). This is the map *target* universe. Grouped
 * for the searchable picker. `[]` denotes an array element field. */
const TOOL_FIELDS: FieldOption[] = [
  // Company / identity
  { group: "Company", value: "company_name", label: "company_name" },
  { group: "Company", value: "company_url", label: "company_url" },
  { group: "Company", value: "contact_name", label: "contact_name" },
  { group: "Company", value: "contact_role", label: "contact_role" },
  { group: "Company", value: "start_date", label: "start_date" },
  { group: "Company", value: "lifecycle", label: "lifecycle" },
  { group: "Company", value: "touch_level", label: "touch_level" },
  { group: "Company", value: "has_cs_package", label: "has_cs_package" },
  { group: "Company", value: "currency", label: "currency" },
  { group: "Company", value: "channels", label: "channels (chat/voice/both)" },
  { group: "Company", value: "deployment_markets", label: "deployment_markets" },
  // Channels / volumes / pricing
  { group: "Volumes", value: "channel_volumes.chat", label: "channel_volumes.chat" },
  { group: "Volumes", value: "channel_volumes.voice", label: "channel_volumes.voice" },
  { group: "Volumes", value: "channel_volumes.email", label: "channel_volumes.email" },
  { group: "Volumes", value: "channel_volumes.social", label: "channel_volumes.social" },
  { group: "Volumes", value: "conversation_cost", label: "conversation_cost" },
  { group: "Volumes", value: "voice_cost_per_minute", label: "voice_cost_per_minute" },
  { group: "Volumes", value: "pricing_model", label: "pricing_model" },
  { group: "Volumes", value: "fte_capacity_per_month", label: "fte_capacity_per_month" },
  { group: "Volumes", value: "automation_ramp_months", label: "automation_ramp_months" },
  // Performance (current)
  { group: "Performance", value: "performance.automation_rate", label: "performance.automation_rate" },
  { group: "Performance", value: "performance.unknown_rate", label: "performance.unknown_rate" },
  { group: "Performance", value: "performance.csat_score", label: "performance.csat_score" },
  { group: "Performance", value: "performance.escalation_rate", label: "performance.escalation_rate" },
  { group: "Performance", value: "performance.monthly_conversations", label: "performance.monthly_conversations" },
  { group: "Performance", value: "performance.markets_live", label: "performance.markets_live" },
  { group: "Performance", value: "performance.active_agents", label: "performance.active_agents" },
  { group: "Performance", value: "performance.measured_from", label: "performance.measured_from" },
  { group: "Performance", value: "performance.measured_to", label: "performance.measured_to" },
  // Performance (previous-period, for trend deltas)
  { group: "Performance (prev)", value: "performance.previous_automation_rate", label: "performance.previous_automation_rate" },
  { group: "Performance (prev)", value: "performance.previous_unknown_rate", label: "performance.previous_unknown_rate" },
  { group: "Performance (prev)", value: "performance.previous_csat_score", label: "performance.previous_csat_score" },
  { group: "Performance (prev)", value: "performance.previous_escalation_rate", label: "performance.previous_escalation_rate" },
  { group: "Performance (prev)", value: "performance.previous_monthly_conversations", label: "performance.previous_monthly_conversations" },
  { group: "Performance (prev)", value: "performance.previous_markets_live", label: "performance.previous_markets_live" },
  { group: "Performance (prev)", value: "performance.previous_active_agents", label: "performance.previous_active_agents" },
  // Intent traffic
  { group: "Intent traffic", value: "intent_traffic", label: "intent_traffic (full summary)" },
  { group: "Intent traffic", value: "intent_traffic.period", label: "intent_traffic.period" },
  { group: "Intent traffic", value: "intent_traffic.intentCount", label: "intent_traffic.intentCount" },
  { group: "Intent traffic", value: "intent_traffic.totals.traffic", label: "intent_traffic.totals.traffic" },
  { group: "Intent traffic", value: "intent_traffic.totals.reviewed", label: "intent_traffic.totals.reviewed" },
  { group: "Intent traffic", value: "intent_traffic.totals.automated", label: "intent_traffic.totals.automated" },
  { group: "Intent traffic", value: "intent_traffic.totals.escalated", label: "intent_traffic.totals.escalated" },
  { group: "Intent traffic", value: "intent_traffic.totals.unsolved", label: "intent_traffic.totals.unsolved" },
  { group: "Intent traffic", value: "intent_traffic.totals.handover", label: "intent_traffic.totals.handover" },
  { group: "Intent traffic", value: "intent_traffic.totals.noPrediction", label: "intent_traffic.totals.noPrediction" },
  { group: "Intent traffic", value: "intent_traffic.totals.positiveFeedback", label: "intent_traffic.totals.positiveFeedback" },
  { group: "Intent traffic", value: "intent_traffic.totals.negativeFeedback", label: "intent_traffic.totals.negativeFeedback" },
  { group: "Intent traffic", value: "intent_traffic.totals.immediateUnknown", label: "intent_traffic.totals.immediateUnknown" },
  { group: "Intent traffic", value: "intent_traffic.roots[]", label: "intent_traffic.roots[] (per-root rollup)" },
  // Benchmarks
  { group: "Benchmarks", value: "benchmarks[].peer", label: "benchmarks[].peer" },
  { group: "Benchmarks", value: "benchmarks[].industry", label: "benchmarks[].industry" },
  { group: "Benchmarks", value: "benchmarks[].percentile", label: "benchmarks[].percentile" },
  // Governance
  { group: "Governance", value: "governance.executive_review_frequency", label: "governance.executive_review_frequency" },
  { group: "Governance", value: "governance.business_review_frequency", label: "governance.business_review_frequency" },
  { group: "Governance", value: "governance.operational_review_frequency", label: "governance.operational_review_frequency" },
  { group: "Governance", value: "governance.executive_sponsor", label: "governance.executive_sponsor" },
  { group: "Governance", value: "governance.last_business_review", label: "governance.last_business_review" },
  { group: "Governance", value: "governance.next_business_review", label: "governance.next_business_review" },
  { group: "Governance", value: "governance.stakeholders[]", label: "governance.stakeholders[]" },
  { group: "Governance", value: "governance.next_business_review_focus", label: "governance.next_business_review_focus" },
  // Recommendations
  { group: "Recommendations", value: "recommendations[].title", label: "recommendations[].title" },
  { group: "Recommendations", value: "recommendations[].rationale", label: "recommendations[].rationale" },
  { group: "Recommendations", value: "recommendations[].weight", label: "recommendations[].weight" },
  { group: "Recommendations", value: "recommendations[].urgency", label: "recommendations[].urgency" },
  { group: "Recommendations", value: "recommendations[].confidence", label: "recommendations[].confidence" },
  { group: "Recommendations", value: "recommendations[].effort", label: "recommendations[].effort" },
  { group: "Recommendations", value: "recommendations[].value_label", label: "recommendations[].value_label" },
  { group: "Recommendations", value: "recommendations_display_count", label: "recommendations_display_count" },
  // Success plan / initiatives
  { group: "Success plan", value: "accepted_initiatives[].initiative_id", label: "accepted_initiatives[].initiative_id" },
  { group: "Success plan", value: "accepted_initiatives[].title", label: "accepted_initiatives[].title" },
  { group: "Success plan", value: "accepted_initiatives[].status", label: "accepted_initiatives[].status" },
  { group: "Success plan", value: "accepted_initiatives[].owner", label: "accepted_initiatives[].owner" },
  { group: "Success plan", value: "accepted_initiatives[].theme", label: "accepted_initiatives[].theme" },
  { group: "Success plan", value: "accepted_initiatives[].start_date", label: "accepted_initiatives[].start_date" },
  { group: "Success plan", value: "accepted_initiatives[].end_date", label: "accepted_initiatives[].end_date" },
  // Agentic before/after
  { group: "Agentic before/after", value: "agentic_outcomes[].topic", label: "agentic_outcomes[].topic" },
  { group: "Agentic before/after", value: "agentic_outcomes[].before", label: "agentic_outcomes[].before" },
  { group: "Agentic before/after", value: "agentic_outcomes[].after", label: "agentic_outcomes[].after" },
  // Personalisation
  { group: "Personalisation", value: "personalisation_opportunities[].intent", label: "personalisation_opportunities[].intent" },
  { group: "Personalisation", value: "personalisation_opportunities[].solution", label: "personalisation_opportunities[].solution" },
  { group: "Personalisation", value: "personalisation_opportunities[].impact_180d", label: "personalisation_opportunities[].impact_180d" },
  { group: "Personalisation", value: "personalisation_opportunities[].requests", label: "personalisation_opportunities[].requests" },
  // Revenue
  { group: "Revenue", value: "revenue_story.lead_metrics[]", label: "revenue_story.lead_metrics[]" },
  { group: "Revenue", value: "revenue_story.sell_journeys[]", label: "revenue_story.sell_journeys[]" },
  // Agents / UAT
  { group: "Agents", value: "agent_swot", label: "agent_swot (per-agent SWOT)" },
  { group: "Agents", value: "uat_status[]", label: "uat_status[]" },
  // BR context
  { group: "Meeting", value: "br_context.meeting_title", label: "br_context.meeting_title" },
  { group: "Meeting", value: "br_context.meeting_date", label: "br_context.meeting_date" },
  { group: "Meeting", value: "br_context.attendees", label: "br_context.attendees" },
  { group: "Meeting", value: "br_context.agenda_items", label: "br_context.agenda_items" },
  // Architecture (PS)
  { group: "Architecture", value: "architecture.auth_methods", label: "architecture.auth_methods" },
  { group: "Architecture", value: "architecture.data_residency", label: "architecture.data_residency" },
  { group: "Architecture", value: "architecture.integration_specifics", label: "architecture.integration_specifics" },
  // Instances / scope
  { group: "Scope", value: "selected_instance_ids", label: "selected_instance_ids" },
  { group: "Scope", value: "areas_of_interest", label: "areas_of_interest" },
  { group: "Scope", value: "selected_variants", label: "selected_variants" },
];

/* How a single row sources its value:
 *   provider — from the connection's source-field catalog
 *   other    — a source field the catalog doesn't list yet (free text)
 *   custom   — a literal value typed by the operator (no source) */
type SourceKind = "provider" | "other" | "custom";

type Mapping = {
  id: string;
  kind: SourceKind;
  /** provider field value | free-text source name | literal custom value */
  source: string;
  /** tool field path (TOOL_FIELDS value) */
  target: string;
  transform: string;
};

const SAMPLE_CONNECTIONS: Connection[] = [
  {
    id: "c-planhat",
    name: "Planhat — CS metrics",
    provider: "planhat",
    endpoint: "https://api.planhat.com",
    authNote: "PLANHAT_API_TOKEN (env)",
    status: "draft",
  },
  {
    id: "c-aws",
    name: "AWS — Connect + Lex",
    provider: "aws",
    endpoint: "eu-north-1 · contact-flow + lex-v2",
    authNote: "AWS_ROLE_ARN (env)",
    status: "draft",
  },
];

const SAMPLE_MAPPINGS: Record<string, Mapping[]> = {
  "c-planhat": [
    { id: "m1", kind: "provider", source: "company.name", target: "company_name", transform: "—" },
    { id: "m2", kind: "provider", source: "custom.automationRate", target: "performance.automation_rate", transform: "round to integer %" },
    { id: "m3", kind: "provider", source: "metrics.csat", target: "performance.csat_score", transform: "—" },
    { id: "m4", kind: "custom", source: "NOK", target: "currency", transform: "literal" },
  ],
  "c-aws": [
    { id: "m5", kind: "provider", source: "s3.intentTrafficExport", target: "intent_traffic", transform: "parseIntentTrafficCsv()" },
    { id: "m6", kind: "provider", source: "cloudwatch.escalationRate", target: "performance.escalation_rate", transform: "×100, round" },
  ],
};

function providerLabel(p: Provider) {
  return p === "planhat" ? "Planhat" : "AWS";
}

/* ─── Searchable field picker ───────────────────────────────────
 *  A combobox: shows the current value, opens a filterable grouped
 *  list on click. Used for both the source and tool field columns. */
function FieldCombo({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: FieldOption[];
  placeholder: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter(
        (o) => o.label.toLowerCase().includes(q) || o.group.toLowerCase().includes(q),
      )
    : options;

  // Group the filtered list by `group`, preserving first-seen order.
  const grouped: { group: string; items: FieldOption[] }[] = [];
  for (const o of filtered) {
    let g = grouped.find((x) => x.group === o.group);
    if (!g) {
      g = { group: o.group, items: [] };
      grouped.push(g);
    }
    g.items.push(o);
  }

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={wrapRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left rounded-md border border-boost-border bg-white px-2.5 py-1.5 text-[12px] font-mono text-boost-dark focus:outline-none focus:ring-2 focus:ring-boost-green-light/60 flex items-center justify-between gap-2"
      >
        <span className={selected ? "truncate" : "truncate text-boost-muted/60"}>
          {selected ? selected.label : value || placeholder}
        </span>
        <span aria-hidden="true" className="text-boost-muted shrink-0">▾</span>
      </button>
      {open ? (
        <div className="absolute z-30 mt-1 w-full min-w-[240px] rounded-lg border border-boost-border bg-white shadow-lg overflow-hidden">
          <div className="p-2 border-b border-boost-border/60">
            {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fields…"
              className="w-full rounded-md border border-boost-border bg-white px-2.5 py-1.5 text-[12px] text-boost-dark placeholder:text-boost-muted/50 focus:outline-none focus:ring-2 focus:ring-boost-green-light/60"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {grouped.length === 0 ? (
              <p className="px-3 py-2 text-[11px] text-boost-muted">No matches.</p>
            ) : (
              grouped.map((g) => (
                <div key={g.group}>
                  <p className="px-3 pt-2 pb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-boost-muted/70">
                    {g.group}
                  </p>
                  {g.items.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => {
                        onChange(o.value);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={
                        "w-full text-left px-3 py-1.5 text-[12px] font-mono transition-colors " +
                        (o.value === value
                          ? "bg-boost-green-light/15 text-boost-dark"
                          : "text-boost-dark hover:bg-boost-surface")
                      }
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function IntegrationsAdminPage() {
  const { data: session, status } = useSession();
  const email = session?.user?.email?.toLowerCase() ?? "";
  const allowed = ALLOWED_INTEGRATION_EMAILS.includes(email);

  const [connections, setConnections] = useState<Connection[]>(SAMPLE_CONNECTIONS);
  const [mappingsByConn, setMappingsByConn] =
    useState<Record<string, Mapping[]>>(SAMPLE_MAPPINGS);
  const [activeId, setActiveId] = useState<string>(SAMPLE_CONNECTIONS[0].id);

  // New-connection form state
  const [draftName, setDraftName] = useState("");
  const [draftProvider, setDraftProvider] = useState<Provider>("planhat");
  const [draftEndpoint, setDraftEndpoint] = useState("");
  const [draftAuth, setDraftAuth] = useState("");

  const active = connections.find((c) => c.id === activeId) ?? null;
  const activeMappings = active ? mappingsByConn[active.id] ?? [] : [];
  const sourceOptions = useMemo(
    () => (active ? SOURCE_FIELDS[active.provider] : []),
    [active],
  );

  function addConnection() {
    const name = draftName.trim();
    if (!name) return;
    const id = `c-${Date.now()}`;
    const conn: Connection = {
      id,
      name,
      provider: draftProvider,
      endpoint: draftEndpoint.trim() || "—",
      authNote: draftAuth.trim() || "(set in env)",
      status: "draft",
    };
    setConnections((prev) => [...prev, conn]);
    setMappingsByConn((prev) => ({ ...prev, [id]: [] }));
    setActiveId(id);
    setDraftName("");
    setDraftEndpoint("");
    setDraftAuth("");
  }

  function addMapping() {
    if (!active) return;
    const row: Mapping = {
      id: `m-${Date.now()}`,
      kind: "provider",
      source: sourceOptions[0]?.value ?? "",
      target: TOOL_FIELDS[0].value,
      transform: "—",
    };
    setMappingsByConn((prev) => ({
      ...prev,
      [active.id]: [...(prev[active.id] ?? []), row],
    }));
  }

  function updateMapping(rowId: string, patch: Partial<Mapping>) {
    if (!active) return;
    setMappingsByConn((prev) => ({
      ...prev,
      [active.id]: (prev[active.id] ?? []).map((m) =>
        m.id === rowId ? { ...m, ...patch } : m,
      ),
    }));
  }

  function setKind(rowId: string, kind: SourceKind) {
    if (!active) return;
    // Reset source to a sensible default for the new kind.
    const nextSource =
      kind === "provider" ? sourceOptions[0]?.value ?? "" : "";
    updateMapping(rowId, { kind, source: nextSource });
  }

  function removeMapping(rowId: string) {
    if (!active) return;
    setMappingsByConn((prev) => ({
      ...prev,
      [active.id]: (prev[active.id] ?? []).filter((m) => m.id !== rowId),
    }));
  }

  return (
    <div className="min-h-screen bg-boost-surface">
      {/* Banner */}
      <div className="bg-boost-purple text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
            Integrations · Admin
          </span>
          <div className="flex items-center gap-3 flex-shrink-0">
            {email ? (
              <span className="hidden md:inline text-[10px] font-medium tracking-[0.04em] text-white/60 truncate max-w-[180px]">
                {email}
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
      <header className="border-b border-boost-border bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <Link
            href="/"
            aria-label="Back to workspace picker"
            className="flex-shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 hover:opacity-80 transition-opacity"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={assetPath("/brand/boost_logo_purple-_main.svg")} alt="boost.ai" className="h-5 sm:h-6 w-auto" />
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {status === "loading" ? (
          <p className="text-[13px] text-boost-muted">Checking access…</p>
        ) : !allowed ? (
          <RestrictedCard email={email} />
        ) : (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-boost-dark">
                Integrations
              </h1>
              <p className="text-[14px] text-boost-muted mt-2 max-w-2xl">
                Register a Planhat or AWS connection, then map its fields onto the
                tool&rsquo;s customer record so the data-driven sections fill
                themselves.
              </p>
              <ShellBanner />
            </div>

            {/* Connections */}
            <section className="rounded-2xl border border-boost-border bg-white p-5 sm:p-6">
              <AdminPrompt
                question="Connections"
                helper="Pick one to edit its field map, or add a new connection below."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {connections.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    aria-pressed={c.id === activeId}
                    className={
                      "text-left rounded-xl border p-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light " +
                      (c.id === activeId
                        ? "border-boost-purple/40 bg-boost-purple/5 shadow-sm"
                        : "border-boost-border bg-white hover:border-boost-purple/30")
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-boost-muted">
                        {providerLabel(c.provider)}
                      </span>
                      <span
                        className={
                          "text-[9px] font-bold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded " +
                          (c.status === "connected"
                            ? "bg-boost-green-light/15 text-boost-green-light"
                            : "bg-boost-gold/15 text-boost-gold")
                        }
                      >
                        {c.status}
                      </span>
                    </div>
                    <p className="text-[14px] font-semibold text-boost-dark mt-1.5">{c.name}</p>
                    <p className="text-[11px] text-boost-muted mt-1 truncate">{c.endpoint}</p>
                    <p className="text-[10px] text-boost-muted/80 mt-1.5">
                      auth · <span className="font-mono">{c.authNote}</span>
                    </p>
                  </button>
                ))}
              </div>

              {/* Add connection */}
              <div className="mt-6 pt-5 border-t border-boost-border/60">
                <AdminPrompt
                  question="Add a connection"
                  helper="Secrets stay in env vars — paste the env key name here, never the secret itself."
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <AdminMiniLabel className="mb-1.5">Name</AdminMiniLabel>
                    <input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="e.g. Planhat — CS metrics"
                      className="w-full rounded-lg border border-boost-border bg-white px-3 py-2 text-[13px] text-boost-dark placeholder:text-boost-muted/50 focus:outline-none focus:ring-2 focus:ring-boost-green-light/60"
                    />
                  </div>
                  <div>
                    <AdminMiniLabel className="mb-1.5">Provider</AdminMiniLabel>
                    <AdminChipRow>
                      <AdminChip
                        active={draftProvider === "planhat"}
                        onClick={() => setDraftProvider("planhat")}
                      >
                        Planhat
                      </AdminChip>
                      <AdminChip
                        active={draftProvider === "aws"}
                        onClick={() => setDraftProvider("aws")}
                      >
                        AWS
                      </AdminChip>
                    </AdminChipRow>
                  </div>
                  <div>
                    <AdminMiniLabel className="mb-1.5">Endpoint / region</AdminMiniLabel>
                    <input
                      value={draftEndpoint}
                      onChange={(e) => setDraftEndpoint(e.target.value)}
                      placeholder={draftProvider === "planhat" ? "https://api.planhat.com" : "eu-north-1 · lex-v2"}
                      className="w-full rounded-lg border border-boost-border bg-white px-3 py-2 text-[13px] text-boost-dark placeholder:text-boost-muted/50 focus:outline-none focus:ring-2 focus:ring-boost-green-light/60"
                    />
                  </div>
                  <div>
                    <AdminMiniLabel className="mb-1.5">Auth · env key name</AdminMiniLabel>
                    <input
                      value={draftAuth}
                      onChange={(e) => setDraftAuth(e.target.value)}
                      placeholder={draftProvider === "planhat" ? "PLANHAT_API_TOKEN" : "AWS_ROLE_ARN"}
                      className="w-full rounded-lg border border-boost-border bg-white px-3 py-2 text-[13px] font-mono text-boost-dark placeholder:text-boost-muted/50 focus:outline-none focus:ring-2 focus:ring-boost-green-light/60"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addConnection}
                  disabled={!draftName.trim()}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-boost-purple px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-boost-purple/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span aria-hidden="true">+</span> Add connection
                </button>
              </div>
            </section>

            {/* Field mapping */}
            <section className="rounded-2xl border border-boost-border bg-white p-5 sm:p-6">
              <AdminPrompt
                question={active ? `Field map · ${active.name}` : "Field map"}
                helper="Tag each row's source (provider field / other / custom value), pick the tool field it fills, and note any transform."
                action={
                  active ? (
                    <button
                      type="button"
                      onClick={addMapping}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-boost-purple/40 bg-boost-purple/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-boost-purple hover:bg-boost-purple/10 transition-colors"
                    >
                      <span aria-hidden="true">+</span> Add mapping
                    </button>
                  ) : null
                }
              />

              {!active ? (
                <p className="text-[13px] text-boost-muted">Select a connection above.</p>
              ) : activeMappings.length === 0 ? (
                <p className="text-[13px] text-boost-muted">
                  No mappings yet. Use <span className="font-semibold">Add mapping</span> to create one.
                </p>
              ) : (
                <div className="space-y-2">
                  {activeMappings.map((m) => (
                    <div
                      key={m.id}
                      className="grid grid-cols-1 sm:grid-cols-[7rem_1fr_auto_1fr_8rem_auto] items-center gap-2 sm:gap-2.5 rounded-xl border border-boost-border/70 bg-boost-surface/30 p-2.5"
                    >
                      {/* Source kind tag */}
                      <select
                        value={m.kind}
                        onChange={(e) => setKind(m.id, e.target.value as SourceKind)}
                        className="w-full rounded-md border border-boost-border bg-white px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-boost-dark focus:outline-none focus:ring-2 focus:ring-boost-green-light/60"
                      >
                        <option value="provider">{providerLabel(active.provider)}</option>
                        <option value="other">Other</option>
                        <option value="custom">Custom value</option>
                      </select>

                      {/* Source cell — adapts to kind */}
                      {m.kind === "provider" ? (
                        <FieldCombo
                          value={m.source}
                          options={sourceOptions}
                          placeholder="Pick source field…"
                          onChange={(v) => updateMapping(m.id, { source: v })}
                        />
                      ) : (
                        <input
                          value={m.source}
                          onChange={(e) => updateMapping(m.id, { source: e.target.value })}
                          placeholder={m.kind === "custom" ? "Literal value…" : "Source field name…"}
                          className="w-full rounded-md border border-boost-border bg-white px-2.5 py-1.5 text-[12px] font-mono text-boost-dark placeholder:text-boost-muted/50 focus:outline-none focus:ring-2 focus:ring-boost-green-light/60"
                        />
                      )}

                      <span aria-hidden="true" className="hidden sm:block text-center text-boost-muted">→</span>

                      {/* Tool field — searchable over the whole guide catalog */}
                      <FieldCombo
                        value={m.target}
                        options={TOOL_FIELDS}
                        placeholder="Pick tool field…"
                        onChange={(v) => updateMapping(m.id, { target: v })}
                      />

                      <input
                        value={m.transform}
                        onChange={(e) => updateMapping(m.id, { transform: e.target.value })}
                        placeholder="transform"
                        className="w-full rounded-md border border-boost-border bg-white px-2.5 py-1.5 text-[12px] text-boost-dark placeholder:text-boost-muted/50 focus:outline-none focus:ring-2 focus:ring-boost-green-light/60"
                      />

                      <button
                        type="button"
                        onClick={() => removeMapping(m.id)}
                        aria-label="Remove mapping"
                        className="justify-self-end rounded-md px-2 py-1 text-[16px] leading-none text-boost-muted hover:text-boost-orange transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {active ? (
                <div className="mt-5 pt-4 border-t border-boost-border/60 flex items-center gap-3">
                  <button
                    type="button"
                    disabled
                    title="Saving is enabled once Supabase is reconnected."
                    className="inline-flex items-center gap-1.5 rounded-lg bg-boost-dark/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white opacity-40 cursor-not-allowed"
                  >
                    Save map
                  </button>
                  <span className="text-[11px] text-boost-muted">
                    Saving is disabled until the backend is reconnected.
                  </span>
                </div>
              ) : null}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function ShellBanner() {
  return (
    <div className="mt-4 rounded-xl border border-boost-gold/30 bg-boost-gold/5 px-4 py-3">
      <p className="text-[12px] text-boost-dark/80 leading-relaxed">
        <span className="font-semibold text-boost-dark">Preview shell.</span>{" "}
        Connections and field maps are local to this session — persistence is
        blocked until the Supabase project is recreated. Secrets are never entered
        here; only the env-var key name is recorded.
      </p>
    </div>
  );
}

function RestrictedCard({ email }: { email: string }) {
  return (
    <div className="max-w-md mx-auto mt-10 rounded-2xl border border-boost-border bg-white p-6 text-center">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-boost-surface text-boost-purple">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h1 className="text-lg font-semibold text-boost-dark">Restricted</h1>
      <p className="text-[13px] text-boost-muted mt-2">
        The integrations admin is limited to a named operator list.
        {email ? (
          <>
            {" "}You&rsquo;re signed in as{" "}
            <span className="font-medium text-boost-dark">{email}</span>.
          </>
        ) : null}
      </p>
      <Link
        href="/"
        className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-boost-purple hover:underline"
      >
        ← Back to workspace
      </Link>
    </div>
  );
}
