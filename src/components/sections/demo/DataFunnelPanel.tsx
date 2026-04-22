"use client";

/* ──────────────────────────────────────────────────────────────
 *  DataFunnelPanel — live view of Chat API v2 data for the
 *  right-hand side of the live-demo section.
 *
 *  Stateless-ish: derives everything from the `messages`,
 *  `conversationState`, and `lastRawResponse` props. Uses local
 *  UI state only for expanded turn rows + raw-wire disclosure.
 *
 *  Phase 2a: Chat API v2 only. No NLU / classification — that
 *  comes in Phase 2b via Cloudflare Worker + Export API v4.
 * ────────────────────────────────────────────────────────────── */

import { useMemo, useState } from "react";
import type {
  ChatConversationState,
  ChatElement,
  ChatMessage,
  PostResponse,
  HtmlPayload,
} from "@/lib/boost-chat";

interface DataFunnelPanelProps {
  messages: ChatMessage[];
  conversationState: ChatConversationState | null;
  reference: string | null;
  tenant: string;
  lastRawResponse: PostResponse | null;
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
}: DataFunnelPanelProps) {
  const [expandedTurn, setExpandedTurn] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState<Record<string, boolean>>({});
  const [rawFooterOpen, setRawFooterOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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
