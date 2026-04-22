"use client";

/* ──────────────────────────────────────────────────────────────
 *  DataFunnelPanel — live view of Chat API v2 data for the
 *  right-hand side of the live-demo section.
 *
 *  Stateless-ish: derives everything from the `messages`,
 *  `conversationState`, and `lastRawResponse` props. Uses local
 *  UI state only for expanded turn rows + raw-wire disclosure.
 *
 *  Phase 2a: Chat API v2 data (signals, provenance, timeline) —
 *  shown automatically once the chat has had one client→bot turn.
 *
 *  Phase 2b: Export API v4 trace — gated behind an "Analyze"
 *  button. The button fires `onAnalyze` in the parent (which calls
 *  the Cloudflare Worker proxy). On success the panel renders a
 *  "Routing & NLU trace" block below the timeline. If the user
 *  keeps typing after analyzing, the button flips to
 *  "Refresh analysis · +N new turns".
 * ────────────────────────────────────────────────────────────── */

import { useMemo, useState } from "react";
import type {
  ChatConversationState,
  ChatElement,
  ChatMessage,
  PostResponse,
  HtmlPayload,
} from "@/lib/boost-chat";
import type { ExportTraceSuccess, ExportTurnTrace } from "@/lib/boost-export";
import type { AnalyzePhase } from "./LiveChatSection";

interface DataFunnelPanelProps {
  messages: ChatMessage[];
  conversationState: ChatConversationState | null;
  reference: string | null;
  tenant: string;
  lastRawResponse: PostResponse | null;
  /** Phase 2b wiring — see module header. */
  postedIds: number[];
  exportTrace: ExportTraceSuccess | null;
  analyzePhase: AnalyzePhase;
  /** How many postedIds were part of the last successful analyze.
   *  postedIds.length - analyzedPostedCount = new turns since. */
  analyzedPostedCount: number;
  onAnalyze: () => void;
  /** False when NEXT_PUBLIC_FEED_API_URL / TOKEN are unset. In
   *  that case we skip the Analyze button entirely — no point
   *  teasing a feature the client can't reach. */
  exportEnabled: boolean;
}

type Provenance = "curated" | "generated" | "other";

function classifyHtmlStyle(style: string | null | undefined): Provenance {
  const s = (style ?? "").toLowerCase().trim();
  if (s === "curated") return "curated";
  if (s === "generated") return "generated";
  return "other";
}

function describeElements(elements: ChatElement[]): {
  counts: Record<string, number>;
  styleChip: "curated" | "generated" | "links" | "media" | "json" | "other";
} {
  const counts: Record<string, number> = {};
  let hasLinks = false;
  let hasMedia = false;
  let hasJson = false;
  let hasCurated = false;
  let hasGenerated = false;
  for (const el of elements) {
    counts[el.type] = (counts[el.type] ?? 0) + 1;
    if (el.type === "links") hasLinks = true;
    if (el.type === "image" || el.type === "video") hasMedia = true;
    if (el.type === "json") hasJson = true;
    if (el.type === "html") {
      const prov = classifyHtmlStyle((el.payload as HtmlPayload).style);
      if (prov === "curated") hasCurated = true;
      if (prov === "generated") hasGenerated = true;
    }
  }
  // Precedence: generated > curated > links > media > json > other.
  // Why: "generated" is the headline story (LLM-in-context).
  let chip: "curated" | "generated" | "links" | "media" | "json" | "other" =
    "other";
  if (hasGenerated) chip = "generated";
  else if (hasCurated) chip = "curated";
  else if (hasLinks) chip = "links";
  else if (hasMedia) chip = "media";
  else if (hasJson) chip = "json";
  return { counts, styleChip: chip };
}

function relativeTime(iso: string, now: number = Date.now()): string {
  const t = new Date(iso).getTime();
  const delta = Math.max(0, now - t);
  if (delta < 2_000) return "just now";
  if (delta < 60_000) return `${Math.round(delta / 1_000)}s ago`;
  if (delta < 3_600_000) return `${Math.round(delta / 60_000)}m ago`;
  return `${Math.round(delta / 3_600_000)}h ago`;
}

function formatCount(counts: Record<string, number>): string {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return entries.map(([k, v]) => `${v} × ${k}`).join(", ");
}

function statusMeta(status: ChatConversationState["chat_status"] | null) {
  if (status === "assigned_to_human") {
    return {
      label: "Assigned to agent",
      dot: "bg-boost-purple",
      text: "text-boost-purple",
      bg: "bg-boost-purple/5 border-boost-purple/20",
    };
  }
  if (status === "in_human_chat_queue") {
    return {
      label: "In handover queue",
      dot: "bg-amber-500",
      text: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
    };
  }
  // default + virtual_agent
  return {
    label: "Virtual agent",
    dot: "bg-boost-green-light",
    text: "text-boost-green",
    bg: "bg-boost-green/5 border-boost-green/20",
  };
}

/* ─── Component ─────────────────────────────────────────────── */

export default function DataFunnelPanel({
  messages,
  conversationState,
  reference,
  tenant,
  lastRawResponse,
  postedIds,
  exportTrace,
  analyzePhase,
  analyzedPostedCount,
  onAnalyze,
  exportEnabled,
}: DataFunnelPanelProps) {
  const [expandedTurn, setExpandedTurn] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState<Record<string, boolean>>({});
  const [rawFooterOpen, setRawFooterOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  /** Index Export API turns by their integer message.id so we can
   *  join per-turn extras into the timeline drawer. */
  const traceByMsgId = useMemo(() => {
    if (!exportTrace) return new Map<number, ExportTurnTrace>();
    const out = new Map<number, ExportTurnTrace>();
    for (const t of exportTrace.turns) out.set(t.id, t);
    return out;
  }, [exportTrace]);

  /** A turn is "analyzable" if the chat has at least one user turn.
   *  START's welcome alone doesn't qualify. */
  const canAnalyze = postedIds.length > 0;
  const newTurnsSinceAnalysis = Math.max(
    0,
    postedIds.length - analyzedPostedCount,
  );

  /* ─── Derived metrics ─── */
  const turnCount = messages.length;
  const clientTurnCount = messages.filter((m) => m.source === "client").length;
  const botTurnCount = messages.filter((m) => m.source === "bot").length;
  const humanTurnCount = messages.filter((m) => m.source === "agent").length;

  const provenance = useMemo(() => {
    let curated = 0;
    let generated = 0;
    let other = 0;
    for (const m of messages) {
      if (m.source !== "bot" && m.source !== "agent") continue;
      for (const el of m.elements) {
        if (el.type !== "html") {
          // Count non-html elements as "other" — they count toward
          // the funnel denominator so the donut reflects the full
          // mix of what the bot returned.
          other += 1;
          continue;
        }
        const prov = classifyHtmlStyle((el.payload as HtmlPayload).style);
        if (prov === "curated") curated += 1;
        else if (prov === "generated") generated += 1;
        else other += 1;
      }
    }
    const total = curated + generated + other;
    return { curated, generated, other, total };
  }, [messages]);

  const latenciesMs = useMemo(() => {
    const out: Record<string, number> = {};
    for (let i = 1; i < messages.length; i++) {
      const prev = messages[i - 1];
      const curr = messages[i];
      if (prev.source === "client" && curr.source !== "client") {
        const t0 = new Date(prev.date_created).getTime();
        const t1 = new Date(curr.date_created).getTime();
        const delta = t1 - t0;
        if (delta >= 0 && delta < 60_000) {
          out[curr.key] = delta;
        }
      }
    }
    return out;
  }, [messages]);

  const language =
    [...messages].reverse().find((m) => m.source !== "client")?.language ?? null;

  const status = conversationState?.chat_status ?? null;
  const sm = statusMeta(status);

  const shortRef = reference ? `${reference.slice(0, 8)}…${reference.slice(-4)}` : null;

  const handleCopyRef = async () => {
    if (!reference) return;
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1_500);
    } catch {
      // Clipboard permission denied — silently ignore
    }
  };

  return (
    <div
      data-testid="data-funnel-panel"
      className="flex flex-col rounded-2xl border border-boost-border bg-white overflow-hidden shadow-sm"
      style={{ height: "600px", maxHeight: "80vh" }}
    >
      {/* Header */}
      <div className="bg-boost-surface px-4 py-3 border-b border-boost-border flex items-center justify-between flex-shrink-0">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-boost-dark">Data funnel</p>
          <p className="text-[10px] text-boost-muted truncate">
            Live · Chat API v2 ·{" "}
            <span className="font-mono text-boost-dark/70">{tenant}</span>
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-green flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-boost-green-light animate-pulse" />
          Live
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* 1. Signals strip */}
        <section aria-labelledby="funnel-signals">
          <p
            id="funnel-signals"
            className="text-[10px] font-bold text-boost-muted uppercase tracking-wider mb-2"
          >
            Conversation signals
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={handleCopyRef}
              disabled={!reference}
              data-testid="data-funnel-reference"
              title={reference ? `Click to copy · ${reference}` : "No reference yet"}
              className="flex flex-col items-start gap-0.5 px-2.5 py-2 rounded-lg border border-boost-border bg-white hover:bg-boost-surface transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-[9px] font-semibold uppercase tracking-wider text-boost-muted">
                Reference
              </span>
              <span className="text-[11px] font-mono text-boost-dark truncate w-full">
                {copied ? "Copied ✓" : (shortRef ?? "—")}
              </span>
            </button>
            <div
              data-testid="data-funnel-status-pill"
              className={`flex flex-col items-start gap-0.5 px-2.5 py-2 rounded-lg border ${sm.bg}`}
            >
              <span className="text-[9px] font-semibold uppercase tracking-wider text-boost-muted">
                Status
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                <span className={`text-[11px] font-semibold ${sm.text}`}>
                  {sm.label}
                </span>
              </span>
            </div>
            <div className="flex flex-col items-start gap-0.5 px-2.5 py-2 rounded-lg border border-boost-border bg-white">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-boost-muted">
                Language
              </span>
              <span className="text-[11px] font-mono text-boost-dark">
                {language ?? "—"}
              </span>
            </div>
            <div className="flex flex-col items-start gap-0.5 px-2.5 py-2 rounded-lg border border-boost-border bg-white">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-boost-muted">
                Turns
              </span>
              <span className="text-[11px] text-boost-dark">
                <span className="font-mono">{turnCount}</span>
                <span className="text-boost-muted">
                  {" "}
                  ({clientTurnCount}↑ {botTurnCount}↓
                  {humanTurnCount > 0 ? ` ${humanTurnCount}◇` : ""})
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* 2. Provenance donut */}
        <section aria-labelledby="funnel-provenance" data-testid="data-funnel-provenance">
          <p
            id="funnel-provenance"
            className="text-[10px] font-bold text-boost-muted uppercase tracking-wider mb-2"
          >
            Response provenance
          </p>
          <div className="flex items-center gap-3">
            <ProvenanceDonut {...provenance} />
            <div className="min-w-0 flex-1 space-y-1">
              <LegendRow
                color="bg-boost-green"
                label="Curated"
                count={provenance.curated}
                total={provenance.total}
              />
              <LegendRow
                color="bg-boost-purple"
                label="Generated"
                count={provenance.generated}
                total={provenance.total}
              />
              <LegendRow
                color="bg-boost-muted/40"
                label="Other"
                count={provenance.other}
                total={provenance.total}
              />
            </div>
          </div>
          <p className="text-[10px] text-boost-muted leading-relaxed mt-2">
            Curated answers come from verified knowledge. Generated answers are
            composed by the LLM in context — both powered by the same platform.
          </p>
        </section>

        {/* 2.5 — Analyze / Routing block (Phase 2b).
              Gated behind the button so the Chat API v2 data (above)
              renders free of cost, and the paid Export API fetch is
              explicit. Hidden entirely when the client can't reach
              the worker proxy. */}
        {exportEnabled && (
          <AnalyzeOrRouting
            postedIds={postedIds}
            exportTrace={exportTrace}
            analyzePhase={analyzePhase}
            canAnalyze={canAnalyze}
            newTurnsSinceAnalysis={newTurnsSinceAnalysis}
            onAnalyze={onAnalyze}
          />
        )}

        {/* 3. Turn timeline */}
        <section aria-labelledby="funnel-timeline">
          <p
            id="funnel-timeline"
            className="text-[10px] font-bold text-boost-muted uppercase tracking-wider mb-2"
          >
            Turn timeline
          </p>
          {messages.length === 0 ? (
            <p className="text-[11px] text-boost-muted italic">
              No turns yet — send a message to see the funnel.
            </p>
          ) : (
            <ol className="space-y-1">
              {messages.map((m, i) => {
                const meta = describeElements(m.elements);
                const latency = latenciesMs[m.key];
                const isExpanded = expandedTurn === m.key;
                const sourceLabel =
                  m.source === "client"
                    ? "You"
                    : m.source === "agent"
                      ? "Human agent"
                      : "Agent";
                const sourceDot =
                  m.source === "client"
                    ? "bg-boost-purple"
                    : m.source === "agent"
                      ? "bg-amber-500"
                      : "bg-boost-green-light";
                const styleChipMeta = chipMeta(meta.styleChip);
                return (
                  <li key={m.key}>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedTurn(isExpanded ? null : m.key)
                      }
                      aria-expanded={isExpanded}
                      data-testid={`data-funnel-turn-${String(i + 1).padStart(2, "0")}`}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                        isExpanded
                          ? "border-boost-purple/40 bg-boost-purple/5"
                          : "border-boost-border bg-white hover:bg-boost-surface"
                      }`}
                    >
                      <span className="text-[9px] font-mono text-boost-muted w-6 flex-shrink-0">
                        #{String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sourceDot}`}
                        aria-hidden="true"
                      />
                      <span className="text-[11px] font-semibold text-boost-dark flex-shrink-0 w-[76px]">
                        {sourceLabel}
                      </span>
                      <span className="text-[10px] text-boost-muted flex-shrink-0 w-[58px]">
                        {relativeTime(m.date_created)}
                      </span>
                      {typeof latency === "number" && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-boost-surface text-boost-muted flex-shrink-0">
                          {latency < 1000
                            ? `${latency}ms`
                            : `${(latency / 1000).toFixed(1)}s`}
                        </span>
                      )}
                      <span
                        className={`ml-auto text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border flex-shrink-0 ${styleChipMeta.className}`}
                      >
                        {styleChipMeta.label}
                      </span>
                    </button>

                    {/* Expanded drawer */}
                    <div
                      className="grid transition-all duration-300 ease-out"
                      style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        {isExpanded && (
                          <div className="mt-1 ml-8 p-2.5 rounded-lg border border-boost-border bg-boost-surface/40 space-y-1.5">
                            <Kv label="Message ID" value={m.id ?? "(client echo)"} mono />
                            <Kv label="Timestamp" value={m.date_created} mono />
                            <Kv
                              label="Elements"
                              value={formatCount(meta.counts) || "(none)"}
                            />
                            {m.language && (
                              <Kv label="Language" value={m.language} mono />
                            )}
                            {/* Export API extras — only when Analyze has
                                  run and the ID matches. We look up by the
                                  Chat API v2 response.id which equals
                                  Export API's message.id. */}
                            <DrawerExportExtras
                              messageId={m.id}
                              traceByMsgId={traceByMsgId}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowRawJson((prev) => ({
                                  ...prev,
                                  [m.key]: !prev[m.key],
                                }));
                              }}
                              className="text-[10px] font-semibold text-boost-purple hover:text-boost-green transition-colors mt-1"
                            >
                              {showRawJson[m.key]
                                ? "Hide raw JSON"
                                : "View raw JSON"}
                            </button>
                            {showRawJson[m.key] && (
                              <pre
                                tabIndex={0}
                                className="mt-1 p-2 rounded bg-white border border-boost-border text-[10px] font-mono leading-snug whitespace-pre-wrap overflow-x-auto max-h-60 focus:outline-none focus:ring-2 focus:ring-boost-green-light"
                              >
                                {JSON.stringify(
                                  {
                                    id: m.id,
                                    source: m.source,
                                    date_created: m.date_created,
                                    language: m.language,
                                    avatar_url: m.avatar_url,
                                    elements: m.elements,
                                  },
                                  null,
                                  2,
                                )}
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* 4. Raw wire footer */}
        <section aria-labelledby="funnel-raw">
          <button
            type="button"
            onClick={() => setRawFooterOpen((v) => !v)}
            aria-expanded={rawFooterOpen}
            data-testid="data-funnel-raw-toggle"
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-boost-border bg-white hover:bg-boost-surface transition-colors"
          >
            <span
              id="funnel-raw"
              className="text-[10px] font-bold text-boost-muted uppercase tracking-wider"
            >
              Raw response (last)
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              className={`text-boost-muted transition-transform duration-200 ${
                rawFooterOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div
            className="grid transition-all duration-300 ease-out"
            style={{ gridTemplateRows: rawFooterOpen ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              {rawFooterOpen && (
                <pre
                  tabIndex={0}
                  className="mt-1.5 p-2.5 rounded-lg bg-boost-dark text-white text-[10px] font-mono leading-snug whitespace-pre-wrap overflow-x-auto max-h-80 focus:outline-none focus:ring-2 focus:ring-boost-green-light"
                >
                  {lastRawResponse
                    ? JSON.stringify(lastRawResponse, null, 2)
                    : "(no response yet)"}
                </pre>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ─── Small presentational helpers ─────────────────────────── */

function LegendRow({
  color,
  label,
  count,
  total,
}: {
  color: string;
  label: string;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
      <span className="text-boost-dark flex-1 truncate">{label}</span>
      <span className="font-mono text-boost-muted tabular-nums">
        {count} <span className="text-boost-muted/60">·</span> {pct}%
      </span>
    </div>
  );
}

function Kv({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 text-[10px]">
      <span className="text-boost-muted uppercase tracking-wider font-semibold flex-shrink-0 w-[70px]">
        {label}
      </span>
      <span
        className={`text-boost-dark break-all min-w-0 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

/* ─── SVG donut ─────────────────────────────────────────────── */

function ProvenanceDonut({
  curated,
  generated,
  other,
  total,
}: {
  curated: number;
  generated: number;
  other: number;
  total: number;
}) {
  const size = 92;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;

  const segments = total === 0
    ? []
    : [
        { pct: curated / total, color: "var(--color-boost-green, #36b595)" },
        { pct: generated / total, color: "var(--color-boost-purple, #59195d)" },
        { pct: other / total, color: "rgba(107, 114, 128, 0.35)" },
      ].filter((s) => s.pct > 0);

  let accum = 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="flex-shrink-0"
      aria-label={`Provenance: ${curated} curated, ${generated} generated, ${other} other`}
    >
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--color-boost-border, #e5e7eb)"
        strokeWidth={stroke}
      />
      {/* Segments */}
      {segments.map((s, i) => {
        const dash = s.pct * C;
        const gap = C - dash;
        const offset = -accum * C;
        accum += s.pct;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={offset}
            // Rotate so first segment starts at 12 o'clock
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        );
      })}
      {/* Center label */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-boost-dark"
        style={{ fontSize: 18, fontWeight: 700, fontFamily: "ui-sans-serif, system-ui" }}
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 15}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-boost-muted"
        style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: "0.1em" }}
      >
        responses
      </text>
    </svg>
  );
}

/* ─── Phase 2b — Analyze / Routing block ────────────────────
 *
 * Renders one of three states depending on what Phase 2b fetching
 * has produced:
 *
 *   A. No trace yet → Analyze invitation card.
 *   B. Analyzing    → Same card with shimmer + disabled button.
 *   C. Loaded       → "Routing & NLU trace" summary block with a
 *                     Refresh affordance in its header.
 *
 * Kept visually distinct from the Chat-API sections above so the
 * viewer mentally separates "free live data" from "deep analysis".
 * ────────────────────────────────────────────────────────────── */

function AnalyzeOrRouting({
  postedIds,
  exportTrace,
  analyzePhase,
  canAnalyze,
  newTurnsSinceAnalysis,
  onAnalyze,
}: {
  postedIds: number[];
  exportTrace: ExportTraceSuccess | null;
  analyzePhase: AnalyzePhase;
  canAnalyze: boolean;
  newTurnsSinceAnalysis: number;
  onAnalyze: () => void;
}) {
  // State C — trace loaded
  if (exportTrace) {
    return (
      <RoutingBlock
        trace={exportTrace}
        analyzePhase={analyzePhase}
        newTurnsSinceAnalysis={newTurnsSinceAnalysis}
        onAnalyze={onAnalyze}
      />
    );
  }
  // State A / B — invitation card
  const loading = analyzePhase.kind === "loading";
  const error = analyzePhase.kind === "error" ? analyzePhase.message : null;
  return (
    <section
      aria-labelledby="funnel-analyze"
      data-testid="data-funnel-analyze-card"
      className="relative overflow-hidden rounded-xl border border-boost-purple/30 bg-gradient-to-br from-boost-purple/5 via-white to-boost-green/5 p-3.5"
    >
      {loading && (
        <span
          aria-hidden="true"
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(89, 25, 93, 0.08), transparent)",
            backgroundSize: "200% 100%",
            animation: "funnel-shimmer 1.4s linear infinite",
          }}
        />
      )}
      <div className="relative flex items-start gap-3">
        <div
          aria-hidden="true"
          className="flex-shrink-0 w-8 h-8 rounded-lg bg-boost-purple/10 text-boost-purple flex items-center justify-center"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
            <path
              d="m17 17 4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p
            id="funnel-analyze"
            className="text-[11px] font-bold text-boost-dark leading-tight"
          >
            Analyze with Export API
          </p>
          <p className="text-[10px] text-boost-muted leading-relaxed mt-0.5">
            Reveal routing, predicted intents, handover signals, and session
            metadata for this conversation.
          </p>
          {error && (
            <p className="text-[10px] text-boost-orange mt-1.5 leading-relaxed">
              {error}
            </p>
          )}
        </div>
      </div>
      <div className="relative mt-2.5 flex items-center justify-end">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!canAnalyze || loading}
          data-testid="data-funnel-analyze-btn"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-boost-purple text-white text-[11px] font-semibold hover:bg-boost-purple/90 disabled:bg-boost-muted/30 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
              Analyzing…
            </>
          ) : (
            <>
              Analyze
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 12h14m0 0-5-5m5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          )}
        </button>
      </div>
      {/* Keyframes lived in a <style jsx> previously; Turbopack
          doesn't support styled-jsx, so we inline them via a
          <style> tag local to this component. Single definition is
          fine since the panel is typically mounted once. */}
      <style>{`
        @keyframes funnel-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </section>
  );
}

function RoutingBlock({
  trace,
  analyzePhase,
  newTurnsSinceAnalysis,
  onAnalyze,
}: {
  trace: ExportTraceSuccess;
  analyzePhase: AnalyzePhase;
  newTurnsSinceAnalysis: number;
  onAnalyze: () => void;
}) {
  const loading = analyzePhase.kind === "loading";
  const error = analyzePhase.kind === "error" ? analyzePhase.message : null;

  /* Distribution of action_type across bot turns. Used for the
     horizontal bar and the legend. */
  const actionDist = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    for (const t of trace.turns) {
      if (t.role === "user") continue;
      const k = t.action_type ?? "unknown";
      counts[k] = (counts[k] ?? 0) + 1;
      total += 1;
    }
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return { total, entries };
  }, [trace.turns]);

  /* User-turn intent roll-up. Empty when tenant has no classical
     intents (e.g. financewizard — everything falls through to
     generative). We still show the row, just with em-dashes. */
  const userTurns = useMemo(
    () => trace.turns.filter((t) => t.role === "user"),
    [trace.turns],
  );

  /* Handover events — rendered only if any appear. Keeps the panel
     clean for the common case (no handover in the demo). */
  const handoverTurns = useMemo(
    () =>
      trace.turns.filter(
        (t) => t.is_human_chat || t.is_human_chat_queue || t.skill,
      ),
    [trace.turns],
  );

  const category = trace.session.category?.automatic ?? null;

  return (
    <section
      aria-labelledby="funnel-routing"
      data-testid="data-funnel-routing"
      className="rounded-xl border border-boost-purple/30 bg-white p-3 space-y-3"
    >
      {/* Header row */}
      <header className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p
            id="funnel-routing"
            className="text-[10px] font-bold text-boost-muted uppercase tracking-wider"
          >
            Routing & NLU trace
          </p>
          <p className="text-[10px] text-boost-muted/80 mt-0.5 truncate">
            Session{" "}
            <span className="font-mono text-boost-dark/70">
              #{trace.session.id}
            </span>{" "}
            · <span className="font-mono">{trace.session.duration || "—"}</span>
            {trace.session.reviewed && (
              <span className="ml-1.5 text-boost-green">· reviewed</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={loading}
          data-testid="data-funnel-refresh-btn"
          className="relative flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md border border-boost-border text-[10px] font-semibold text-boost-purple hover:bg-boost-purple hover:text-white transition-colors disabled:cursor-not-allowed disabled:text-boost-muted"
          title={
            newTurnsSinceAnalysis > 0
              ? `${newTurnsSinceAnalysis} new turn${newTurnsSinceAnalysis === 1 ? "" : "s"} since last analysis`
              : "Refresh analysis"
          }
        >
          {loading ? (
            "Analyzing…"
          ) : (
            <>
              Refresh
              {newTurnsSinceAnalysis > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center px-1 rounded-full bg-boost-orange text-white text-[9px] font-bold leading-none h-3.5">
                  +{newTurnsSinceAnalysis}
                </span>
              )}
            </>
          )}
        </button>
      </header>

      {error && (
        <p className="text-[10px] text-boost-orange leading-relaxed">{error}</p>
      )}

      {/* Actions dispatched */}
      {actionDist.total > 0 && (
        <div>
          <p className="text-[9px] font-semibold text-boost-muted uppercase tracking-wider mb-1">
            Actions dispatched
          </p>
          <ActionTypeBar entries={actionDist.entries} total={actionDist.total} />
        </div>
      )}

      {/* Intent trace (user turns) */}
      <div>
        <p className="text-[9px] font-semibold text-boost-muted uppercase tracking-wider mb-1">
          Intent trace
        </p>
        {userTurns.length === 0 ? (
          <p className="text-[10px] text-boost-muted italic">
            No user turns yet.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {userTurns.map((t, i) => (
              <li
                key={t.id}
                className="flex items-baseline gap-2 text-[10px] leading-snug"
              >
                <span className="font-mono text-boost-muted flex-shrink-0 w-4 text-right">
                  {i + 1}.
                </span>
                <span className="text-boost-dark font-medium min-w-0 flex-1 truncate">
                  {t.original_question || "(no text)"}
                </span>
                <span className="flex-shrink-0">
                  {t.predicted_intent?.title ? (
                    <span className="font-mono text-boost-purple">
                      {t.predicted_intent.title}
                    </span>
                  ) : (
                    <span className="text-boost-muted/60">—</span>
                  )}
                </span>
                {t.language && (
                  <span className="font-mono text-[9px] text-boost-muted flex-shrink-0">
                    {t.language}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Handover (conditional) */}
      {handoverTurns.length > 0 && (
        <div>
          <p className="text-[9px] font-semibold text-boost-muted uppercase tracking-wider mb-1">
            Handover
          </p>
          <ul className="space-y-0.5">
            {handoverTurns.map((t) => (
              <li
                key={t.id}
                className="flex items-baseline gap-2 text-[10px] leading-snug"
              >
                <span
                  aria-hidden="true"
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    t.is_human_chat
                      ? "bg-boost-purple"
                      : t.is_human_chat_queue
                        ? "bg-amber-500"
                        : "bg-boost-green-light"
                  }`}
                />
                <span className="text-boost-dark">
                  {t.is_human_chat_queue
                    ? "In queue"
                    : t.is_human_chat
                      ? "With human agent"
                      : "Skill assigned"}
                </span>
                {t.skill?.title && (
                  <span className="font-mono text-boost-muted">
                    · {t.skill.title}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Category — shown only if present (auto-review is a delayed
          batch job; may be empty for a just-completed conversation) */}
      {category && (
        <div className="pt-2 border-t border-boost-border">
          <p className="text-[9px] font-semibold text-boost-muted uppercase tracking-wider mb-1">
            Classification
          </p>
          <span className="inline-block px-2 py-0.5 rounded-full bg-boost-green/10 text-boost-green text-[10px] font-semibold">
            {formatCategory(category)}
          </span>
        </div>
      )}
    </section>
  );
}

function ActionTypeBar({
  entries,
  total,
}: {
  entries: [string, number][];
  total: number;
}) {
  const palette = [
    "#59195d", // purple
    "#36b595", // green-light
    "#e8a23b", // gold
    "#e37547", // orange
    "#8a6ca8", // lavender
    "#6b7280", // muted
  ];
  return (
    <div>
      <div className="flex h-2 w-full rounded-full overflow-hidden bg-boost-surface">
        {entries.map(([k, v], i) => (
          <div
            key={k}
            title={`${k}: ${v}`}
            style={{
              width: `${(v / total) * 100}%`,
              backgroundColor: palette[i % palette.length],
            }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
        {entries.map(([k, v], i) => (
          <span
            key={k}
            className="inline-flex items-center gap-1 text-[10px]"
          >
            <span
              aria-hidden="true"
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: palette[i % palette.length] }}
            />
            <span className="text-boost-dark font-medium">{k}</span>
            <span className="text-boost-muted font-mono">{v}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function formatCategory(cat: string): string {
  // boost.ai's category enum uses underscores. "automated_transactional"
  // → "Automated transactional"
  const words = cat.split("_");
  if (words.length === 0) return cat;
  return words
    .map((w, i) =>
      i === 0
        ? w.charAt(0).toUpperCase() + w.slice(1)
        : w.toLowerCase(),
    )
    .join(" ");
}

function DrawerExportExtras({
  messageId,
  traceByMsgId,
}: {
  messageId: string | undefined;
  traceByMsgId: Map<number, ExportTurnTrace>;
}) {
  if (!messageId) return null;
  const idNum = Number(messageId);
  if (!Number.isFinite(idNum)) return null;
  const trace = traceByMsgId.get(idNum);
  if (!trace) return null;

  // Only show rows that carry a value. Avoids the drawer becoming a
  // parade of em-dashes on tenants with sparse NLU data.
  const rows: Array<{ label: string; value: string; mono?: boolean }> = [];
  if (trace.action_type)
    rows.push({ label: "Action", value: trace.action_type, mono: true });
  if (trace.system_action_trigger) {
    rows.push({
      label: "Trigger",
      value:
        trace.system_action_trigger.title ??
        `#${trace.system_action_trigger.id}`,
    });
  }
  if (trace.predicted_intent) {
    rows.push({
      label: "Intent",
      value:
        trace.predicted_intent.title ?? `#${trace.predicted_intent.id}`,
      mono: true,
    });
  }
  if (trace.prediction_types && trace.prediction_types.length > 0) {
    rows.push({
      label: "Match",
      value: trace.prediction_types.join(" · "),
    });
  }
  if (trace.matched_filter) {
    rows.push({
      label: "Filter",
      value: trace.matched_filter.title ?? `#${trace.matched_filter.id}`,
    });
  }
  if (trace.skill) {
    rows.push({
      label: "Skill",
      value: trace.skill.title ?? `#${trace.skill.id}`,
    });
  }
  if (trace.is_unknown) {
    rows.push({ label: "State", value: "Unknown (fallback)" });
  }

  if (rows.length === 0) return null;

  return (
    <div className="pt-1.5 mt-1 border-t border-boost-border/60 space-y-1">
      <p className="text-[9px] font-semibold text-boost-muted uppercase tracking-wider">
        Export API
      </p>
      {rows.map((r) => (
        <Kv key={r.label} label={r.label} value={r.value} mono={r.mono} />
      ))}
    </div>
  );
}

function chipMeta(
  chip: "curated" | "generated" | "links" | "media" | "json" | "other",
): { label: string; className: string } {
  switch (chip) {
    case "curated":
      return {
        label: "Curated",
        className: "bg-boost-green/5 text-boost-green border-boost-green/20",
      };
    case "generated":
      return {
        label: "Generated",
        className: "bg-boost-purple/5 text-boost-purple border-boost-purple/15",
      };
    case "links":
      return {
        label: "Links",
        className: "bg-boost-surface text-boost-dark border-boost-border",
      };
    case "media":
      return {
        label: "Media",
        className: "bg-boost-surface text-boost-dark border-boost-border",
      };
    case "json":
      return {
        label: "JSON",
        className: "bg-boost-surface text-boost-dark border-boost-border",
      };
    default:
      return {
        label: "—",
        className: "bg-boost-surface text-boost-muted border-boost-border",
      };
  }
}
