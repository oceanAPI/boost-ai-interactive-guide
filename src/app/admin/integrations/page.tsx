"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { assetPath } from "@/lib/asset-path";
import {
  AdminPrompt,
  AdminChip,
  AdminChipRow,
  AdminMiniLabel,
} from "@/components/admin/primitives";
import {
  listIntegrations,
  saveConnection,
  deleteConnection,
  saveFieldMap,
  testConnection,
  fetchPreview,
  introspectSchema,
  type ConnectionRow,
  type FieldMapRow,
  type Provider,
  type SourceKind,
} from "@/app/actions/integrations";

/* ──────────────────────────────────────────────────────────────
 *  Integrations admin (/admin/integrations).
 *
 *  Narrowly gated above the general boost.ai /admin* proxy gate to a
 *  hand-picked operator allow-list (the server actions enforce the same
 *  list — the client gate is cosmetic). Register a Planhat / AWS
 *  connection, map its fields onto the tool's Customer record, then test
 *  + fetch live data.
 *
 *  Persistence: Supabase via src/app/actions/integrations.ts.
 *  Secrets are NEVER entered here — the auth field holds the NAME of an
 *  env var (PLANHAT_API_TOKEN); the secret lives only in server env.
 * ────────────────────────────────────────────────────────────── */

const ALLOWED_INTEGRATION_EMAILS = [
  "dev@boost.ai",
  "mikal@boost.ai",
  "jakob@boost.ai",
];

type FieldOption = { value: string; label: string; group: string };

/* Fallback source-field catalogs per provider. For Planhat these are the
 * REAL top-level + common custom.* paths (verified against a live sample);
 * the "Discover fields from live data" button replaces them with the exact
 * shape of THIS connection, so fields not listed here still get picked up. */
const SOURCE_FIELDS: Record<Provider, FieldOption[]> = {
  planhat: [
    { group: "Company", value: "name", label: "name : string" },
    { group: "Company", value: "phase", label: "phase : string" },
    { group: "Company", value: "status", label: "status : string" },
    { group: "Company", value: "country", label: "country : string" },
    { group: "Company", value: "description", label: "description : string" },
    { group: "Company", value: "owner", label: "owner : string" },
    { group: "Company", value: "customerTo", label: "customerTo : string (renewal)" },
    { group: "Company", value: "beatDate", label: "beatDate : string" },
    { group: "Metrics", value: "mrr", label: "mrr : number" },
    { group: "Metrics", value: "arr", label: "arr : number" },
    { group: "Metrics", value: "nps", label: "nps : number" },
    { group: "Metrics", value: "h", label: "h : number (health)" },
    { group: "Metrics", value: "csmScore", label: "csmScore : number" },
    { group: "Metrics", value: "nrrTotal", label: "nrrTotal : number" },
    { group: "Custom", value: "custom.Automation Rate (across instances, %)", label: "custom.Automation Rate (across instances, %)" },
    { group: "Custom", value: "custom.Unknown %", label: "custom.Unknown %" },
    { group: "Custom", value: "custom.Conversations (30d)", label: "custom.Conversations (30d)" },
    { group: "Custom", value: "custom.Automated conversations (30d)", label: "custom.Automated conversations (30d)" },
    { group: "Custom", value: "custom.Cost per conversation (engine, USD)", label: "custom.Cost per conversation (engine, USD)" },
    { group: "Custom", value: "custom.Number of servers", label: "custom.Number of servers" },
    { group: "Custom", value: "custom.Has Voice", label: "custom.Has Voice" },
    { group: "Custom", value: "custom.Industry", label: "custom.Industry" },
    { group: "Custom", value: "custom.Segment", label: "custom.Segment" },
    { group: "Custom", value: "custom.Region", label: "custom.Region" },
    { group: "Custom", value: "custom.ROI (% of ARR)", label: "custom.ROI (% of ARR)" },
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

type Mapping = {
  id: string;
  kind: SourceKind;
  source: string;
  target: string;
  transform: string;
};

/** Executable value transforms applied on pull/preview. Keep in sync with
 *  `applyTransform` in src/app/actions/integrations.ts. */
const TRANSFORMS: { value: string; label: string }[] = [
  { value: "", label: "— none —" },
  { value: "ratio_to_percent", label: "ratio → % (×100)" },
  { value: "percent_to_ratio", label: "% → ratio (÷100)" },
  { value: "round", label: "round to integer" },
  { value: "round1", label: "round to 1 decimal" },
  { value: "to_number", label: "to number" },
];

/** Shows which engagement (Customer) target fields are NOT covered by the
 *  current connection's field map, grouped exactly like the picker. Gives
 *  the operator a coverage view: anything listed here arrives empty on pull
 *  unless a manual override fills it. */
function UnmappedFields({ mappings }: { mappings: Mapping[] }) {
  const mapped = new Set(mappings.map((m) => m.target).filter(Boolean));
  const missing = TOOL_FIELDS.filter((f) => !mapped.has(f.value));
  const groups: { group: string; fields: FieldOption[] }[] = [];
  for (const f of missing) {
    let g = groups.find((x) => x.group === f.group);
    if (!g) {
      g = { group: f.group, fields: [] };
      groups.push(g);
    }
    g.fields.push(f);
  }

  return (
    <div className="mt-5 pt-4 border-t border-boost-border/60">
      <AdminMiniLabel className="mb-2">
        Unmapped engagement fields ({missing.length} of {TOOL_FIELDS.length})
      </AdminMiniLabel>
      {missing.length === 0 ? (
        <p className="text-[12px] text-boost-green-light">Every guide field has a mapping.</p>
      ) : (
        <div className="space-y-2.5">
          {groups.map((g) => (
            <div key={g.group}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-boost-muted/70 mb-1">
                {g.group}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {g.fields.map((f) => (
                  <span
                    key={f.value}
                    title={f.label}
                    className="rounded-md border border-boost-border/70 bg-boost-surface/40 px-2 py-1 text-[11px] font-mono text-boost-muted"
                  >
                    {f.value}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type PreviewResult = {
  company: { id?: string; name?: string };
  raw: unknown;
  mapped: { target: string; value: unknown; sourceLabel: string }[];
  unresolved: string[];
};

function providerLabel(p: Provider) {
  return p === "planhat" ? "Planhat" : "AWS";
}

/** Flag a value typed into the auth field. The field is for the env var
 *  NAME only (UPPER_SNAKE_CASE) — never the secret. Returns a problem
 *  string, or null when the value is empty/valid. */
function authFieldIssue(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^eyJ[A-Za-z0-9_-]+\./.test(s)) {
    return "That looks like a JWT secret. Enter only the env var NAME (e.g. PLANHAT_API_TOKEN) — the secret stays in server env, never here.";
  }
  if (s.length > 48 || /\s/.test(s) || (/[a-z]/.test(s) && /[0-9]/.test(s) && s.length > 24)) {
    return "That looks like a secret. Enter only the env var NAME (e.g. PLANHAT_API_TOKEN).";
  }
  if (!/^[A-Z][A-Z0-9_]*$/.test(s)) {
    return "Use an UPPER_SNAKE_CASE env var name, e.g. PLANHAT_API_TOKEN or AWS_ROLE_ARN.";
  }
  return null;
}

/* ─── Searchable field picker ───────────────────────────────────
 *  A combobox: shows the current value, opens a filterable grouped
 *  list on click. Used for both the source and tool field columns. */
function FieldCombo({
  value,
  options,
  placeholder,
  onChange,
  allowCustom = false,
}: {
  value: string;
  options: FieldOption[];
  placeholder: string;
  onChange: (v: string) => void;
  allowCustom?: boolean;
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
  const trimmed = query.trim();
  const canAddCustom =
    allowCustom &&
    trimmed.length > 0 &&
    !options.some((o) => o.value === trimmed);

  return (
    <div ref={wrapRef} className="relative w-full min-w-0">
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
            {canAddCustom ? (
              <button
                type="button"
                onClick={() => {
                  onChange(trimmed);
                  setOpen(false);
                  setQuery("");
                }}
                className="w-full text-left px-3 py-1.5 text-[12px] font-mono text-boost-purple hover:bg-boost-surface"
              >
                Use “{trimmed}” (custom path)
              </button>
            ) : null}
            {grouped.length === 0 ? (
              canAddCustom ? null : (
                <p className="px-3 py-2 text-[11px] text-boost-muted">No matches.</p>
              )
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

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [connections, setConnections] = useState<ConnectionRow[]>([]);
  const [mappingsByConn, setMappingsByConn] = useState<Record<string, Mapping[]>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  // Connection form (add / edit)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftProvider, setDraftProvider] = useState<Provider>("planhat");
  const [draftEndpoint, setDraftEndpoint] = useState("");
  const [draftAuth, setDraftAuth] = useState("");
  const [savingConn, setSavingConn] = useState(false);
  const [connError, setConnError] = useState<string | null>(null);

  // Field-map save
  const [savingMap, setSavingMap] = useState(false);
  const [mapMsg, setMapMsg] = useState<string | null>(null);

  // Live-discovered source fields per connection (overrides the static list)
  const [discoveredByConn, setDiscoveredByConn] = useState<Record<string, FieldOption[]>>({});
  const [discovering, setDiscovering] = useState(false);
  const [discoverMsg, setDiscoverMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Live test / fetch
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [previewQuery, setPreviewQuery] = useState("");
  const [fetching, setFetching] = useState(false);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  const reload = useCallback(async () => {
    const res = await listIntegrations();
    if (!res.ok) {
      setLoadError(res.error);
      setLoading(false);
      return;
    }
    setLoadError(null);
    setConnections(res.data.connections);
    const byConn: Record<string, Mapping[]> = {};
    for (const [cid, rows] of Object.entries(res.data.mapsByConnection)) {
      byConn[cid] = (rows as FieldMapRow[]).map((r) => ({
        id: r.id,
        kind: r.kind,
        source: r.source,
        target: r.target,
        transform: r.transform,
      }));
    }
    setMappingsByConn(byConn);
    setActiveId((cur) =>
      cur && res.data.connections.some((c) => c.id === cur)
        ? cur
        : res.data.connections[0]?.id ?? null,
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!allowed) {
      setLoading(false);
      return;
    }
    void reload();
  }, [status, allowed, reload]);

  const active = connections.find((c) => c.id === activeId) ?? null;
  const activeMappings = active ? mappingsByConn[active.id] ?? [] : [];
  const sourceOptions = useMemo(
    () =>
      active
        ? discoveredByConn[active.id] ?? SOURCE_FIELDS[active.provider]
        : [],
    [active, discoveredByConn],
  );
  const authIssue = authFieldIssue(draftAuth);

  function resetForm() {
    setEditingId(null);
    setDraftName("");
    setDraftProvider("planhat");
    setDraftEndpoint("");
    setDraftAuth("");
    setConnError(null);
  }

  function startEdit(c: ConnectionRow) {
    setEditingId(c.id);
    setDraftName(c.name);
    setDraftProvider(c.provider);
    setDraftEndpoint(c.endpoint ?? "");
    setDraftAuth(c.auth_env_key ?? "");
    setConnError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function submitConnection() {
    const name = draftName.trim();
    if (!name || authIssue) return;
    setSavingConn(true);
    setConnError(null);
    const res = await saveConnection({
      id: editingId ?? undefined,
      name,
      provider: draftProvider,
      endpoint: draftEndpoint,
      authEnvKey: draftAuth,
    });
    setSavingConn(false);
    if (!res.ok) {
      setConnError(res.error);
      return;
    }
    const newId = res.data.id;
    resetForm();
    await reload();
    setActiveId(newId);
  }

  async function removeConnection(id: string) {
    const conn = connections.find((c) => c.id === id);
    if (!conn) return;
    if (!window.confirm(`Delete connection "${conn.name}" and its field map?`)) return;
    const res = await deleteConnection(id);
    if (!res.ok) {
      setConnError(res.error);
      return;
    }
    if (editingId === id) resetForm();
    await reload();
  }

  async function runIntrospect() {
    if (!active) return;
    setDiscovering(true);
    setDiscoverMsg(null);
    const res = await introspectSchema(active.id);
    setDiscovering(false);
    if (!res.ok) {
      setDiscoverMsg({ ok: false, text: res.error });
      return;
    }
    setDiscoveredByConn((prev) => ({ ...prev, [active.id]: res.data.fields }));
    setDiscoverMsg({
      ok: true,
      text: `Discovered ${res.data.fields.length} fields from ${res.data.sampled} live companies.`,
    });
  }

  function addMapping() {
    if (!active) return;
    const row: Mapping = {
      id: `m-${Date.now()}`,
      kind: "provider",
      source: sourceOptions[0]?.value ?? "",
      target: TOOL_FIELDS[0].value,
      transform: "",
    };
    setMappingsByConn((prev) => ({
      ...prev,
      [active.id]: [...(prev[active.id] ?? []), row],
    }));
    setMapMsg(null);
  }

  function updateMapping(rowId: string, patch: Partial<Mapping>) {
    if (!active) return;
    setMappingsByConn((prev) => ({
      ...prev,
      [active.id]: (prev[active.id] ?? []).map((m) =>
        m.id === rowId ? { ...m, ...patch } : m,
      ),
    }));
    setMapMsg(null);
  }

  function setKind(rowId: string, kind: SourceKind) {
    if (!active) return;
    const nextSource = kind === "provider" ? sourceOptions[0]?.value ?? "" : "";
    updateMapping(rowId, { kind, source: nextSource });
  }

  function removeMapping(rowId: string) {
    if (!active) return;
    setMappingsByConn((prev) => ({
      ...prev,
      [active.id]: (prev[active.id] ?? []).filter((m) => m.id !== rowId),
    }));
    setMapMsg(null);
  }

  async function saveMap() {
    if (!active) return;
    setSavingMap(true);
    setMapMsg(null);
    const res = await saveFieldMap(
      active.id,
      activeMappings.map((m) => ({
        kind: m.kind,
        source: m.source,
        target: m.target,
        transform: m.transform,
      })),
    );
    setSavingMap(false);
    setMapMsg(res.ok ? `Saved ${res.data.count} mapping(s).` : res.error);
    if (res.ok) void reload();
  }

  async function runTest() {
    if (!active) return;
    setTesting(true);
    setTestMsg(null);
    const res = await testConnection(active.id);
    setTesting(false);
    setTestMsg(res.ok ? { ok: true, text: res.data.message } : { ok: false, text: res.error });
  }

  async function runFetch() {
    if (!active) return;
    setFetching(true);
    setPreview(null);
    setPreviewError(null);
    const res = await fetchPreview(active.id, previewQuery);
    setFetching(false);
    if (res.ok) setPreview(res.data);
    else setPreviewError(res.error);
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
                Register a Planhat or AWS connection, map its fields onto the
                tool&rsquo;s customer record, then test and fetch live data so the
                data-driven sections fill themselves.
              </p>
              <SecurityNote />
            </div>

            {loadError ? (
              <div className="rounded-xl border border-boost-orange/40 bg-boost-orange/5 px-4 py-3">
                <p className="text-[12px] text-boost-dark/80">
                  Couldn&rsquo;t load integrations: {loadError}
                </p>
              </div>
            ) : null}

            {/* Connections */}
            <section className="rounded-2xl border border-boost-border bg-white p-5 sm:p-6">
              <AdminPrompt
                question="Connections"
                helper="Pick one to edit its field map, or add a new connection below."
              />
              {loading ? (
                <p className="text-[13px] text-boost-muted">Loading connections…</p>
              ) : connections.length === 0 ? (
                <p className="text-[13px] text-boost-muted">
                  No connections yet. Add one below.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {connections.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveId(c.id)}
                      aria-pressed={c.id === activeId}
                      className={
                        "text-left rounded-xl border p-4 overflow-hidden min-w-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light " +
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
                      <p className="text-[14px] font-semibold text-boost-dark mt-1.5 truncate">{c.name}</p>
                      <p className="text-[11px] text-boost-muted mt-1 truncate">{c.endpoint || "—"}</p>
                      <p className="text-[10px] text-boost-muted/80 mt-1.5 truncate">
                        auth · <span className="font-mono">{c.auth_env_key || "(set in env)"}</span>
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {/* Active-connection toolbar: edit / delete / live test */}
              {active ? (
                <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-boost-border/70 bg-boost-surface/40 px-3 py-2.5">
                  <span className="text-[11px] text-boost-muted">
                    Selected: <span className="font-semibold text-boost-dark">{active.name}</span>
                  </span>
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={() => startEdit(active)}
                    className="rounded-md border border-boost-border bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-boost-dark hover:border-boost-purple/30 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeConnection(active.id)}
                    className="rounded-md border border-boost-orange/30 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-boost-orange hover:bg-boost-orange/5 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ) : null}

              {/* Add / edit connection */}
              <div ref={formRef} className="mt-6 pt-5 border-t border-boost-border/60">
                <AdminPrompt
                  question={editingId ? "Edit connection" : "Add a connection"}
                  helper="Secrets stay in env vars — paste the env key NAME here, never the secret itself."
                  action={
                    editingId ? (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="text-[10px] font-semibold uppercase tracking-[0.12em] text-boost-muted hover:text-boost-dark transition-colors"
                      >
                        Cancel
                      </button>
                    ) : null
                  }
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
                      aria-invalid={authIssue ? true : undefined}
                      className={
                        "w-full rounded-lg border bg-white px-3 py-2 text-[13px] font-mono text-boost-dark placeholder:text-boost-muted/50 focus:outline-none focus:ring-2 " +
                        (authIssue
                          ? "border-boost-orange/60 focus:ring-boost-orange/40"
                          : "border-boost-border focus:ring-boost-green-light/60")
                      }
                    />
                    {authIssue ? (
                      <p className="mt-1 text-[10px] leading-snug text-boost-orange">{authIssue}</p>
                    ) : (
                      <p className="mt-1 text-[10px] text-boost-muted/70">
                        Name only — the secret lives in <span className="font-mono">.env.local</span> / Vercel env.
                      </p>
                    )}
                  </div>
                </div>
                {connError ? (
                  <p className="mt-3 text-[11px] text-boost-orange">{connError}</p>
                ) : null}
                <button
                  type="button"
                  onClick={submitConnection}
                  disabled={!draftName.trim() || !!authIssue || savingConn}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-boost-purple px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-boost-purple/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {savingConn ? "Saving…" : editingId ? "Save changes" : "+ Add connection"}
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
                    <div className="flex flex-wrap items-center gap-2">
                      {active.provider === "planhat" ? (
                        <button
                          type="button"
                          onClick={runIntrospect}
                          disabled={discovering}
                          title="Sample live companies and load every field actually present (incl. fields not in the default list)."
                          className="inline-flex items-center gap-1.5 rounded-lg border border-boost-green-light/50 bg-boost-green-light/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-boost-dark hover:bg-boost-green-light/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {discovering ? "Discovering…" : "Discover fields from live data"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={addMapping}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-boost-purple/40 bg-boost-purple/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-boost-purple hover:bg-boost-purple/10 transition-colors"
                      >
                        <span aria-hidden="true">+</span> Add mapping
                      </button>
                    </div>
                  ) : null
                }
              />

              {discoverMsg ? (
                <p
                  className={
                    "mb-2 text-[11px] " +
                    (discoverMsg.ok ? "text-boost-green-dark" : "text-boost-orange")
                  }
                >
                  {discoverMsg.text}
                </p>
              ) : null}

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
                      <select
                        value={m.kind}
                        onChange={(e) => setKind(m.id, e.target.value as SourceKind)}
                        className="w-full rounded-md border border-boost-border bg-white px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-boost-dark focus:outline-none focus:ring-2 focus:ring-boost-green-light/60"
                      >
                        <option value="provider">{providerLabel(active.provider)}</option>
                        <option value="other">Other</option>
                        <option value="custom">Custom value</option>
                      </select>

                      {m.kind === "provider" ? (
                        <FieldCombo
                          value={m.source}
                          options={sourceOptions}
                          placeholder="Pick source field…"
                          allowCustom
                          onChange={(v) => updateMapping(m.id, { source: v })}
                        />
                      ) : (
                        <input
                          value={m.source}
                          onChange={(e) => updateMapping(m.id, { source: e.target.value })}
                          placeholder={m.kind === "custom" ? "Literal value…" : "Source field name…"}
                          className="w-full min-w-0 rounded-md border border-boost-border bg-white px-2.5 py-1.5 text-[12px] font-mono text-boost-dark placeholder:text-boost-muted/50 focus:outline-none focus:ring-2 focus:ring-boost-green-light/60"
                        />
                      )}

                      <span aria-hidden="true" className="hidden sm:block text-center text-boost-muted">→</span>

                      <FieldCombo
                        value={m.target}
                        options={TOOL_FIELDS}
                        placeholder="Pick tool field…"
                        onChange={(v) => updateMapping(m.id, { target: v })}
                      />

                      <select
                        value={m.transform}
                        onChange={(e) => updateMapping(m.id, { transform: e.target.value })}
                        title="Convert the value on pull (e.g. ratio → % multiplies by 100)."
                        className="w-full min-w-0 rounded-md border border-boost-border bg-white px-2 py-1.5 text-[12px] text-boost-dark focus:outline-none focus:ring-2 focus:ring-boost-green-light/60"
                      >
                        {TRANSFORMS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                        {m.transform && !TRANSFORMS.some((t) => t.value === m.transform) ? (
                          <option value={m.transform}>{`note: ${m.transform}`}</option>
                        ) : null}
                      </select>

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
                <div className="mt-5 pt-4 border-t border-boost-border/60 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={saveMap}
                    disabled={savingMap}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-boost-dark/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-boost-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {savingMap ? "Saving…" : "Save map"}
                  </button>
                  {mapMsg ? <span className="text-[11px] text-boost-muted">{mapMsg}</span> : null}
                </div>
              ) : null}

              {active ? <UnmappedFields mappings={activeMappings} /> : null}
            </section>

            {/* Live data */}
            {active ? (
              <section className="rounded-2xl border border-boost-border bg-white p-5 sm:p-6">
                <AdminPrompt
                  question="Test & fetch live data"
                  helper={
                    active.provider === "planhat"
                      ? "Test authenticates with the env token. Fetch pulls one company and runs your field map against the real response."
                      : "Live test/fetch currently supports Planhat connections only."
                  }
                />

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={runTest}
                    disabled={testing || active.provider !== "planhat"}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-boost-purple/40 bg-boost-purple/5 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-boost-purple hover:bg-boost-purple/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {testing ? "Testing…" : "Test connection"}
                  </button>
                  {testMsg ? (
                    <span
                      className={
                        "text-[11px] " + (testMsg.ok ? "text-boost-green-light" : "text-boost-orange")
                      }
                    >
                      {testMsg.text}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <div className="min-w-[220px] flex-1">
                    <AdminMiniLabel className="mb-1.5">Company (name or 24-char id)</AdminMiniLabel>
                    <input
                      value={previewQuery}
                      onChange={(e) => setPreviewQuery(e.target.value)}
                      placeholder="e.g. Haugaland — blank = first company"
                      className="w-full rounded-lg border border-boost-border bg-white px-3 py-2 text-[13px] text-boost-dark placeholder:text-boost-muted/50 focus:outline-none focus:ring-2 focus:ring-boost-green-light/60"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={runFetch}
                    disabled={fetching || active.provider !== "planhat"}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-boost-purple px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white hover:bg-boost-purple/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {fetching ? "Fetching…" : "Fetch sample"}
                  </button>
                </div>

                {previewError ? (
                  <div className="mt-4 rounded-xl border border-boost-orange/40 bg-boost-orange/5 px-4 py-3">
                    <p className="text-[12px] text-boost-dark/80 break-words">{previewError}</p>
                  </div>
                ) : null}

                {preview ? (
                  <div className="mt-4 space-y-4">
                    <p className="text-[12px] text-boost-muted">
                      Matched company:{" "}
                      <span className="font-semibold text-boost-dark">
                        {preview.company.name || "(unnamed)"}
                      </span>
                      {preview.company.id ? (
                        <span className="font-mono text-[11px] text-boost-muted/70"> · {preview.company.id}</span>
                      ) : null}
                    </p>

                    <div className="overflow-hidden rounded-xl border border-boost-border">
                      <table className="w-full text-left text-[12px]">
                        <thead className="bg-boost-surface/60">
                          <tr>
                            <th className="px-3 py-2 font-semibold text-boost-muted">Tool field</th>
                            <th className="px-3 py-2 font-semibold text-boost-muted">Source</th>
                            <th className="px-3 py-2 font-semibold text-boost-muted">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.mapped.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="px-3 py-3 text-boost-muted">
                                No mappings to apply — add some above and save.
                              </td>
                            </tr>
                          ) : (
                            preview.mapped.map((row, i) => {
                              const missing = row.value === undefined;
                              return (
                                <tr key={i} className="border-t border-boost-border/60">
                                  <td className="px-3 py-2 font-mono text-boost-dark">{row.target}</td>
                                  <td className="px-3 py-2 font-mono text-boost-muted/80 break-all">{row.sourceLabel}</td>
                                  <td className={"px-3 py-2 break-all " + (missing ? "text-boost-orange" : "text-boost-dark")}>
                                    {missing ? "— unresolved" : formatValue(row.value)}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {preview.unresolved.length > 0 ? (
                      <p className="text-[11px] text-boost-orange">
                        {preview.unresolved.length} source path(s) didn&rsquo;t resolve against the real
                        response. Check the raw JSON below and correct the source field.
                      </p>
                    ) : null}

                    <div>
                      <button
                        type="button"
                        onClick={() => setShowRaw((v) => !v)}
                        className="text-[11px] font-semibold uppercase tracking-[0.1em] text-boost-purple hover:underline"
                      >
                        {showRaw ? "Hide" : "Show"} raw Planhat response
                      </button>
                      {showRaw ? (
                        <pre className="mt-2 max-h-80 overflow-auto rounded-xl border border-boost-border bg-boost-dark/95 p-3 text-[11px] leading-relaxed text-white/90">
                          {JSON.stringify(preview.raw, null, 2)}
                        </pre>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}

function formatValue(v: unknown): string {
  if (v === null) return "null";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function SecurityNote() {
  return (
    <div className="mt-4 rounded-xl border border-boost-border bg-boost-surface/40 px-4 py-3">
      <p className="text-[12px] text-boost-dark/80 leading-relaxed">
        <span className="font-semibold text-boost-dark">Secrets never enter this page.</span>{" "}
        The auth field records the <span className="font-medium">env-var name</span> only (e.g.{" "}
        <span className="font-mono">PLANHAT_API_TOKEN</span>); the token itself lives in{" "}
        <span className="font-mono">.env.local</span> / Vercel env and is read server-side at fetch time.
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
