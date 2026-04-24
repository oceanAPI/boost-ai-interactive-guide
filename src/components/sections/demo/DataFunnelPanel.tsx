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

import { Fragment, useMemo, useState, type ReactNode } from "react";
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
      {/* Header — just the title, minimal chrome */}
      <div className="px-4 py-3 border-b border-boost-border flex-shrink-0">
        <p className="text-xs font-semibold text-boost-dark">Data funnel</p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Hero — one-sentence session summary. Silent until the
            Export trace lands; otherwise draws the CE audience to
            the headline signals the rest of the panel unpacks. */}
        {exportTrace && (
          <HeroSummary
            trace={exportTrace}
            exchangeCount={groupExchanges(exportTrace.turns).length}
          />
        )}

        {/* Session context — personalisation signals (filters, sent
            profile, goals, verdict). Silent when nothing to say. */}
        {exportTrace && <SessionChromeStrip trace={exportTrace} />}

        {/* Analyze / routing block — per-exchange cards live here
            once Analyze has run; before that it's the CTA. */}
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

        {/* Empty state — nothing to analyse yet. */}
        {messages.length === 0 && !exportTrace && (
          <p className="text-[11px] text-boost-muted italic">
            Send a message to see the funnel come alive.
          </p>
        )}

        {/* Educational tile — what responses can include */}
        {messages.length > 0 && <RichResponsesTile />}

        {/* Educational tile — auto-classification pitch. Hides if the
            session already has an auto-review verdict. */}
        {messages.length > 0 &&
          (!exportTrace || !exportTrace.session.category?.automatic) && (
            <AutoClassificationTile tenant={tenant} />
          )}
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
  // State A/B — pre-Analyze. The analysis ALSO kicks off automatically
  // 15 s after the first posted message (Export indexing window), so
  // by the time the user notices this button their trace is usually
  // already in-flight. The button is an affordance — a visible handle
  // on a thing that's already happening — and a way to skip the wait
  // if the user wants it now.
  const loading = analyzePhase.kind === "loading";
  const error = analyzePhase.kind === "error" ? analyzePhase.message : null;

  if (!canAnalyze && !loading && !error) return null;

  return (
    <section
      aria-live="polite"
      data-testid="data-funnel-analyze-card"
      className="rounded-xl border border-boost-border bg-white p-3 flex items-center justify-between gap-3"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-boost-dark leading-tight">
          {loading ? "Analysing the conversation" : "Analyze this conversation"}
        </p>
        <p className="text-[10.5px] text-boost-muted leading-snug mt-0.5">
          {loading
            ? "Reading intents, routing, goals, and handover signals from the Export API…"
            : error
              ? error
              : "It's auto-running in the background already — click to run it now."}
        </p>
      </div>
      <button
        type="button"
        onClick={onAnalyze}
        disabled={!canAnalyze || loading}
        data-testid="data-funnel-analyze-btn"
        className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-boost-purple text-white text-[11px] font-semibold hover:bg-boost-purple/90 disabled:bg-boost-muted/30 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <>
            <span
              aria-hidden
              className="inline-flex gap-0.5"
            >
              <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
              <span
                className="w-1 h-1 rounded-full bg-white animate-pulse"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1 h-1 rounded-full bg-white animate-pulse"
                style={{ animationDelay: "300ms" }}
              />
            </span>
            Analysing
          </>
        ) : error ? (
          "Retry"
        ) : (
          <>
            Analyze
            <svg
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
              className="w-2.5 h-2.5"
            >
              <path
                d="M3 8h10m0 0-4-4m4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </>
        )}
      </button>
    </section>
  );
}

/* ─── RoutingBlock — per-exchange card layout ──────────────────
 *
 *  Design intent: each user→bot round trip becomes one "exchange
 *  card" showing the puzzle pieces that fired — Routed to, Flow,
 *  Think time, Triggers, API call — followed by a short reply
 *  preview. Makes "boost.ai picked generative fallback in 840 ms"
 *  scannable in a sales conversation.
 *
 *  Whole-conversation visibility is the rule — not just the last
 *  turn. Cards render every user-initiated exchange plus a compact
 *  opener card when the session starts with a bot welcome.
 * ────────────────────────────────────────────────────────────── */

interface Exchange {
  kind: "welcome" | "turn";
  /** 1-based turn index as shown to the user. */
  index: number;
  /** User message that initiated this exchange. Null on "welcome". */
  userTurn: ExportTurnTrace | null;
  /** Bot turns that followed (first is the primary reply). */
  botTurns: ExportTurnTrace[];
}

/** Group turns into exchanges. A "welcome" exchange is any leading
 *  bot turn before the first user turn. Subsequent bot turns are
 *  grouped under whichever user turn preceded them. */
function groupExchanges(turns: ExportTurnTrace[]): Exchange[] {
  const out: Exchange[] = [];
  let idx = 0;
  let bucket: ExportTurnTrace[] = [];

  for (const t of turns) {
    if (t.role === "user") {
      // Flush any leading bot-only chunk as the welcome exchange.
      if (out.length === 0 && bucket.length > 0) {
        idx += 1;
        out.push({ kind: "welcome", index: idx, userTurn: null, botTurns: bucket });
        bucket = [];
      }
      idx += 1;
      out.push({ kind: "turn", index: idx, userTurn: t, botTurns: [] });
    } else {
      // bot or agent — attach to the current exchange if any, else
      // accumulate for the upcoming welcome bucket.
      const current = out[out.length - 1];
      if (current) current.botTurns.push(t);
      else bucket.push(t);
    }
  }
  // Trailing bot-only turns with no user before them (edge case on
  // conversations that haven't received any user input yet).
  if (out.length === 0 && bucket.length > 0) {
    out.push({ kind: "welcome", index: 1, userTurn: null, botTurns: bucket });
  }
  return out;
}

/** Convert a Chat API v2 `ChatMessage` into an `ExportTurnTrace`-shaped
 *  turn by deriving what we can from the response elements. Unknown
 *  Export-only fields (intent, filter, goals, skill, human_agent,
 *  feedback, translations, system_action_trigger, flow id) are set to
 *  null. Used when Export hasn't been fetched yet so the panel can
 *  still render showroom cards from Chat API v2 alone. */
function chatMessageToSyntheticTurn(m: ChatMessage): ExportTurnTrace {
  const role: "user" | "bot" | "agent" =
    m.source === "client" ? "user" : m.source === "agent" ? "agent" : "bot";

  // Derive an action_type surrogate from html.style.
  let actionType: string | null = null;
  for (const el of m.elements) {
    if (el.type === "html") {
      const style = (el.payload as HtmlPayload).style;
      if (style === "generated") {
        actionType = "generative";
        break;
      }
      if (style === "curated") {
        actionType = "content";
        break;
      }
    }
  }

  // Grab text content: first text element, else strip the first html.
  let textContent: string | null = null;
  for (const el of m.elements) {
    if (el.type === "text") {
      const t = (el.payload as { text?: string }).text;
      if (typeof t === "string" && t.length > 0) {
        textContent = t;
        break;
      }
    }
    if (el.type === "html") {
      const html = ((el.payload as HtmlPayload).html ?? "") as string;
      const plain = html
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (plain.length > 0) {
        textContent = plain;
        break;
      }
    }
  }

  const idNum = Number(m.id);

  return {
    id: Number.isFinite(idNum) ? idNum : -1,
    role,
    created: m.date_created,
    language: m.language ?? null,
    action_type: actionType,
    intent_action_meta_id: null,
    transfer_to_human: false,
    came_from: null,
    content_snippet:
      role === "bot" && textContent
        ? textContent.length > 160
          ? `${textContent.slice(0, 157)}…`
          : textContent
        : null,
    system_action_trigger: null,
    predicted_intent: null,
    prediction_types: null,
    matched_filter: null,
    skill: null,
    human_agent: null,
    goals: [],
    sent_filters: null,
    feedback: null,
    link_text: null,
    translations: null,
    original_question: role === "user" ? textContent : null,
    is_human_chat: role === "agent",
    is_human_chat_queue: false,
    is_unknown: false,
    clicked_button_id: null,
  };
}

/** Build showroom exchanges from Chat API v2 messages alone. Used
 *  pre-Analyze so cards render immediately as the conversation unfolds
 *  — Export data enriches them later. */
function buildSyntheticExchanges(messages: ChatMessage[]): Exchange[] {
  const turns = messages.map(chatMessageToSyntheticTurn);
  return groupExchanges(turns);
}

/** One insight to render in the journey-reveal list. Tight data,
 *  colour-tagged, rendered as a puzzle-piece tile. */
type PieceColor =
  | "neutral"
  | "green"
  | "purple"
  | "orange"
  | "gold"
  | "dark";

interface InsightPiece {
  id: string;
  text: string;
  subtitle?: string;
  color: PieceColor;
}

function pieceTone(color: PieceColor): {
  container: string;
  icon: string;
  text: string;
  subtitle: string;
} {
  switch (color) {
    case "green":
      return {
        container: "bg-boost-green/8 border-boost-green/25",
        icon: "text-boost-green",
        text: "text-boost-dark",
        subtitle: "text-boost-muted",
      };
    case "purple":
      return {
        container: "bg-boost-purple/8 border-boost-purple/25",
        icon: "text-boost-purple",
        text: "text-boost-dark",
        subtitle: "text-boost-muted",
      };
    case "orange":
      return {
        container: "bg-boost-orange/8 border-boost-orange/25",
        icon: "text-boost-orange",
        text: "text-boost-dark",
        subtitle: "text-boost-muted",
      };
    case "gold":
      return {
        container: "bg-boost-gold/10 border-boost-gold/30",
        icon: "text-boost-gold",
        text: "text-boost-dark",
        subtitle: "text-boost-muted",
      };
    case "dark":
      return {
        container: "bg-boost-dark border-boost-dark/40",
        icon: "text-boost-green-light",
        text: "text-white",
        subtitle: "text-white/60",
      };
    default:
      return {
        container: "bg-boost-surface border-boost-border",
        icon: "text-boost-muted",
        text: "text-boost-dark",
        subtitle: "text-boost-muted",
      };
  }
}

/** Compose the ordered list of puzzle pieces for the journey reveal.
 *  Order: aggregate stats first (hero-adjacent), then per-turn
 *  events in chronological order (welcome / per-exchange), then the
 *  session verdict if the auto-review has run. */
function buildInsightPieces(trace: ExportTraceSuccess): InsightPiece[] {
  const exchanges = groupExchanges(trace.turns);
  const pieces: InsightPiece[] = [];

  // ── AGGREGATES ───────────────────────────────────────────
  let handovers = 0;
  let goalEventCount = 0;
  const latencies: number[] = [];
  const languages = new Set<string>();

  for (let i = 0; i < trace.turns.length; i++) {
    const t = trace.turns[i];
    if (t.is_human_chat_queue || t.is_human_chat) handovers += 1;
    if (Array.isArray(t.goals)) goalEventCount += t.goals.length;
    if (t.language) languages.add(t.language);
    if (t.role === "user") {
      const next = trace.turns[i + 1];
      if (next && next.role !== "user") {
        const ms = thinkTimeMs(t.created, next.created);
        if (ms != null) latencies.push(ms);
      }
    }
  }

  pieces.push({
    id: "agg-moments",
    text: `${exchanges.length} moment${exchanges.length === 1 ? "" : "s"} in the conversation`,
    color: "neutral",
  });

  if (latencies.length > 0) {
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    pieces.push({
      id: "agg-latency",
      text: `Avg response ${formatLatency(Math.round(avg))}`,
      color: "neutral",
    });
  }

  pieces.push({
    id: "agg-handover",
    text:
      handovers === 0
        ? "No human handover"
        : `${handovers} human handover${handovers === 1 ? "" : "s"}`,
    color: handovers === 0 ? "green" : "dark",
  });

  if (languages.size > 1) {
    pieces.push({
      id: "agg-languages",
      text: `${languages.size} languages detected`,
      subtitle: Array.from(languages).sort().join(" · "),
      color: "neutral",
    });
  }

  if (goalEventCount > 0) {
    pieces.push({
      id: "agg-goals",
      text: `${goalEventCount} goal event${goalEventCount === 1 ? "" : "s"}`,
      color: "green",
    });
  }

  // ── PER-EXCHANGE EVENTS ──────────────────────────────────
  for (const exchange of exchanges) {
    const primary = exchange.botTurns[0] ?? null;
    if (exchange.kind === "welcome") {
      pieces.push({
        id: `ex-${exchange.index}-welcome`,
        text: "Welcome greeting pre-fixed",
        color: "gold",
      });
      continue;
    }
    if (!primary) continue;

    const templateId = primary.intent_action_meta_id ?? null;
    const filter = primary.matched_filter?.title ?? null;
    const intent = exchange.userTurn?.predicted_intent?.title ?? null;

    if (
      primary.is_human_chat ||
      primary.is_human_chat_queue ||
      primary.transfer_to_human
    ) {
      const team = primary.skill?.title ?? null;
      const agent = primary.human_agent?.title ?? null;
      pieces.push({
        id: `ex-${exchange.index}-human`,
        text: team ? `Passed to ${team} team` : "Passed to human agent",
        subtitle: agent ?? undefined,
        color: "dark",
      });
      continue;
    }

    switch (primary.action_type) {
      case "generative":
      case "llm":
        pieces.push({
          id: `ex-${exchange.index}-gen`,
          text: intent
            ? `Generative response · ${intent}`
            : "Generative response composed",
          subtitle: [
            templateId ? `Template ${templateId}` : null,
            filter ? `Filter ${filter}` : null,
          ]
            .filter(Boolean)
            .join(" · ") || undefined,
          color: "purple",
        });
        break;
      case "content":
        pieces.push({
          id: `ex-${exchange.index}-content`,
          text: intent
            ? `Pre-defined response · ${intent}`
            : templateId
              ? `Pre-defined response · id ${templateId}`
              : "Pre-defined response served",
          subtitle: filter ? `Filter ${filter}` : undefined,
          color: "green",
        });
        break;
      case "api_connector":
      case "legacy_api":
        pieces.push({
          id: `ex-${exchange.index}-api`,
          text: "Triggered integration",
          subtitle: "Live data pulled from a connected system",
          color: "orange",
        });
        break;
      case "orchestrator":
        pieces.push({
          id: `ex-${exchange.index}-orch`,
          text: primary.skill?.title
            ? `Orchestrator · routed to ${primary.skill.title}`
            : "Orchestrator · routed to a specialist",
          subtitle:
            "Routed the conversation to the right specialist agent across the VA network",
          color: "purple",
        });
        break;
      case "entity_extraction":
        pieces.push({
          id: `ex-${exchange.index}-entity`,
          text: "Captured a detail",
          subtitle: "Saved context for the next turn",
          color: "gold",
        });
        break;
      default:
        if (primary.action_type) {
          pieces.push({
            id: `ex-${exchange.index}-other`,
            text: `Action · ${primary.action_type}`,
            color: "neutral",
          });
        }
    }
  }

  // ── VERDICT ──────────────────────────────────────────────
  const category = trace.session.category?.automatic ?? null;
  if (category) {
    pieces.push({
      id: "verdict",
      text: `Verdict · ${formatCategory(category)}`,
      subtitle: "Auto-classified by the platform",
      color: "green",
    });
  }

  return pieces;
}

/** Small jigsaw-piece icon — the puzzle metaphor user asked for. */
function PuzzlePieceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M5 2.5h2.2c.5 0 .8.4.8.8v.5c0 .7.6 1.2 1.2 1.2s1.2-.5 1.2-1.2V3.3c0-.4.4-.8.8-.8h2c.5 0 .8.4.8.8V5c0 .4.4.7.8.7s.7-.3.7-.7v-.3c.5 0 .8.3.8.8v0c0 .4-.3.7-.8.7v-.3c-.4 0-.7.3-.7.7s.3.8.7.8h.3c.5 0 .8.3.8.8V11c0 .4-.3.8-.8.8h-1.8c-.4 0-.8.3-.8.8v2c0 .4-.3.8-.8.8H9.5c-.5 0-.8-.4-.8-.8v-.5c0-.7-.6-1.2-1.2-1.2s-1.2.5-1.2 1.2v.5c0 .4-.4.8-.8.8H3.3c-.5 0-.8-.4-.8-.8V11c0-.4-.4-.8-.8-.8H1.3c-.5 0-.8-.3-.8-.8V7.3c0-.5.3-.8.8-.8h.5c.5 0 .8-.4.8-.8V3.3c0-.5.3-.8.8-.8H5z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.12"
      />
    </svg>
  );
}

/** Single puzzle-piece tile — one insight, colour-tagged. */
function PuzzleTile({ piece }: { piece: InsightPiece }) {
  const t = pieceTone(piece.color);
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border ${t.container} px-3 py-2.5`}
    >
      <PuzzlePieceIcon className={`w-4 h-4 flex-shrink-0 ${t.icon}`} />
      <div className="min-w-0 flex-1">
        <p className={`text-[12px] font-semibold leading-tight ${t.text}`}>
          {piece.text}
        </p>
        {piece.subtitle && (
          <p className={`text-[10.5px] leading-snug mt-0.5 ${t.subtitle}`}>
            {piece.subtitle}
          </p>
        )}
      </div>
    </div>
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

  const pieces = useMemo(() => buildInsightPieces(trace), [trace]);

  return (
    <section
      aria-label="Analyze journey"
      data-testid="data-funnel-routing"
      className="space-y-2"
    >
      {/* Subtle refresh control */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={loading}
          data-testid="data-funnel-refresh-btn"
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-boost-muted hover:text-boost-purple transition-colors disabled:cursor-not-allowed"
          title={
            newTurnsSinceAnalysis > 0
              ? `${newTurnsSinceAnalysis} new turn${newTurnsSinceAnalysis === 1 ? "" : "s"} since last analysis`
              : "Refresh analysis"
          }
        >
          {loading ? (
            "Analysing…"
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
      </div>

      {error && (
        <p className="text-[10px] text-boost-orange leading-relaxed">{error}</p>
      )}

      {/* Journey reveal — puzzle pieces fade in one at a time */}
      <ol className="space-y-1.5">
        {pieces.map((piece, i) => (
          <li
            key={piece.id}
            className="animate-modal-in"
            style={{
              animationDelay: `${Math.min(i * 140, 1800)}ms`,
              animationFillMode: "both",
            }}
          >
            <PuzzleTile piece={piece} />
          </li>
        ))}
      </ol>
    </section>
  );
}

/** The five answer-type buckets we expose to stakeholders. */
type AnswerType =
  | "pre_defined"   // action_type: content — curated knowledge matched
  | "generated"     // action_type: generative | llm — LLM composed on the fly
  | "api"           // action_type: api_connector | legacy_api
  | "human"         // is_human_chat | transfer_to_human
  | "system"        // system_action_trigger fired (welcome / fallback / error / timeout)
  | "orchestrator"  // action_type: orchestrator
  | "other";        // fallback

interface CardMeta {
  answerType: AnswerType;
  /** TIER 1 — who handled this moment. */
  tierOne: string;
  /** TIER 2 — how it was answered. */
  tierTwo: string;
  /** Background + text colour classes for the card's coloured top
   *  band (mirrors SoW phase-card pattern). */
  bandBg: string;
  /** Outer card border colour class. */
  cardBorder: string;
  /** Marketing-voice context sentence. Null when not meaningful. */
  context: string | null;
}

/** Classify the exchange into an AnswerType + Tier labels + copy.
 *  Priority:
 *    1. System trigger (welcome / fallback / error / timeout)
 *    2. Handover (human chat / queue / transfer_to_human)
 *    3. Predicted intent title → TIER 1 = intent title; TIER 2 from action
 *    4. action_type fallback → TIER 1 = tenant agent name; TIER 2 from action
 */
function resolveCardMeta(
  kind: Exchange["kind"],
  userTurn: ExportTurnTrace | null,
  primary: ExportTurnTrace | null,
  tenant: string,
): CardMeta {
  // 1. System trigger — welcome / fallback / error / timeout.
  //    The system_action_trigger on a bot turn takes priority: the
  //    conversation didn't happen because a user asked a question,
  //    it happened because the platform fired a trigger.
  const trigger = primary?.system_action_trigger;
  if (trigger && (kind === "welcome" || !userTurn)) {
    const title = (trigger.title ?? "").toLowerCase();
    if (title.includes("welcome") || kind === "welcome") {
      return {
        answerType: "system",
        tierOne: "System trigger",
        tierTwo: "Welcome greeting",
        bandBg: "bg-boost-dark text-white",
        cardBorder: "border-boost-dark/20",
        context:
          "The agent's scripted welcome fired when the conversation opened — no user input was needed.",
      };
    }
    if (title.includes("fallback") || title.includes("unknown")) {
      return {
        answerType: "system",
        tierOne: "System trigger",
        tierTwo: "Fallback",
        bandBg: "bg-boost-dark text-white",
        cardBorder: "border-boost-dark/20",
        context:
          "The agent fell back to its safety net — no scripted answer matched the customer's input.",
      };
    }
    if (title.includes("error") || title.includes("timeout")) {
      return {
        answerType: "system",
        tierOne: "System trigger",
        tierTwo: title.includes("timeout") ? "Timeout" : "Error recovery",
        bandBg: "bg-boost-dark text-white",
        cardBorder: "border-boost-dark/20",
        context:
          "The agent handled an unexpected state gracefully and kept the conversation going.",
      };
    }
    return {
      answerType: "system",
      tierOne: "System trigger",
      tierTwo: trigger.title ?? "System event",
      bandBg: "bg-boost-dark text-white",
      cardBorder: "border-boost-dark/20",
      context: null,
    };
  }

  // 2. Handover — human response.
  if (primary?.is_human_chat || primary?.is_human_chat_queue || primary?.transfer_to_human) {
    const team = primary.skill?.title ?? null;
    return {
      answerType: "human",
      tierOne: team ? `${team} team` : "Handover",
      tierTwo: "Human response",
      bandBg: "bg-boost-dark text-white",
      cardBorder: "border-boost-dark/20",
      context: primary.is_human_chat_queue
        ? team
          ? `Queued for the ${team} team.`
          : "Queued for a human agent."
        : team
          ? `Passed the conversation to the ${team} team.`
          : "Passed the conversation to a human agent.",
    };
  }

  // 3. Intent matched — TIER 1 = intent title, TIER 2 from action
  if (userTurn?.predicted_intent?.title) {
    const inner = answerTypeMeta(primary?.action_type, userTurn);
    return {
      ...inner,
      tierOne: userTurn.predicted_intent.title,
    };
  }

  // 4. Fallback — TIER 1 = tenant agent name, TIER 2 from action
  const inner = answerTypeMeta(primary?.action_type, userTurn);
  return {
    ...inner,
    tierOne: tierOneFallback(primary?.action_type, tenant),
  };
}

/** TIER 2 label + colours + context sentence, driven by action_type. */
function answerTypeMeta(
  actionType: string | null | undefined,
  userTurn: ExportTurnTrace | null,
): CardMeta {
  const q = userTurn?.original_question?.trim() ?? null;
  const quoted = q
    ? `"${q.length > 56 ? `${q.slice(0, 53)}…` : q}"`
    : null;
  switch (actionType) {
    case "generative":
    case "llm":
      return {
        answerType: "generated",
        tierOne: "", // caller fills
        tierTwo: "Generated answer",
        bandBg: "bg-boost-purple text-white",
        cardBorder: "border-boost-purple/20",
        context: quoted
          ? `The customer asked ${quoted}. No scripted answer matched, so the language model composed a reply in context.`
          : "The language model composed a reply in context, on the fly.",
      };
    case "content":
      return {
        answerType: "pre_defined",
        tierOne: "",
        tierTwo: "Pre-defined answer",
        bandBg: "bg-boost-green text-white",
        cardBorder: "border-boost-green/20",
        context: quoted
          ? `Matched ${quoted} to a curated answer from the knowledge base.`
          : "Served a curated answer from the knowledge base.",
      };
    case "api_connector":
    case "legacy_api":
      return {
        answerType: "api",
        tierOne: "",
        tierTwo: "API response",
        bandBg: "bg-boost-orange text-white",
        cardBorder: "border-boost-orange/20",
        context:
          "Called out to a connected system and returned live data.",
      };
    case "entity_extraction":
      return {
        answerType: "other",
        tierOne: "",
        tierTwo: "Detail captured",
        bandBg: "bg-boost-gold text-white",
        cardBorder: "border-boost-gold/20",
        context:
          "Captured a detail from the customer into the conversation state.",
      };
    case "orchestrator":
      return {
        answerType: "orchestrator",
        tierOne: "",
        tierTwo: "Routed to a specialist",
        bandBg: "bg-boost-purple text-white",
        cardBorder: "border-boost-purple/20",
        context:
          "Routed the conversation to the right specialist agent across the VA network.",
      };
    default:
      return {
        answerType: "other",
        tierOne: "",
        tierTwo: actionType ?? "A turn happened",
        bandBg: "bg-boost-surface text-boost-dark",
        cardBorder: "border-boost-border",
        context: null,
      };
  }
}

/** TIER 1 label when no predicted intent exists. Financewizard's
 *  generative-default surfaces as "Banking agent"; orchestrator turns
 *  always read as "Orchestrator"; future industries plug in here. */
function tierOneFallback(
  actionType: string | null | undefined,
  tenant: string,
): string {
  if (actionType === "orchestrator") return "Orchestrator";
  const t = tenant.toLowerCase();
  if (t.includes("financewizard") || t.includes("banking") || t.includes("bank")) {
    return "Banking agent";
  }
  return "Agent";
}

/** Translate boost.ai's prediction-type labels into stakeholder voice. */
function prettyPrediction(types: string[] | null | undefined): string {
  if (!types || types.length === 0) return "";
  const joined = types.join(" ").toLowerCase();
  if (joined.includes("perfect")) return "Exact match";
  if (joined.includes("fine-tuned") && joined.includes("unknown")) return "Partial match";
  if (joined.includes("unknown")) return "No match";
  return types[0];
}

function ExchangeCard({
  exchange,
  tenant,
  conversationId,
}: {
  exchange: Exchange;
  tenant: string;
  conversationId: number | null;
}) {
  const { kind, index, userTurn, botTurns } = exchange;
  const primary = botTurns[0] ?? null;
  const [inspectOpen, setInspectOpen] = useState(false);

  // Derive tier labels + context sentence + colours from the exchange
  const meta = resolveCardMeta(kind, userTurn, primary, tenant);

  // Conditional rows — only appear when content is populated and
  // actually relevant to this answer type. User's rule: no em-dash
  // parade; skip confidence + language on generative turns, surface
  // handover team only when handed over, etc.
  const rows: Array<{ label: string; value: ReactNode }> = [];

  // Confidence — only meaningful on pre-defined (NLU-matched) turns
  const predTypes = userTurn?.prediction_types ?? null;
  if (meta.answerType === "pre_defined" && predTypes && predTypes.length > 0) {
    const pretty = prettyPrediction(predTypes);
    if (pretty) {
      rows.push({ label: "Confidence", value: <span>{pretty}</span> });
    }
  }

  // Language — only on pre-defined / system trigger turns. For
  // generative answers language isn't known, so hide rather than
  // mislead.
  if (
    (meta.answerType === "pre_defined" || meta.answerType === "system") &&
    userTurn?.language
  ) {
    rows.push({
      label: "Language",
      value: <span className="font-mono">{userTurn.language}</span>,
    });
  }

  // Personalised for — matched audience filter from the session.
  if (primary?.matched_filter?.title) {
    rows.push({
      label: "Personalised for",
      value: (
        <span className="font-mono">{primary.matched_filter.title}</span>
      ),
    });
  }

  // Customer context — filter values the client sent with the turn.
  if (userTurn?.sent_filters && userTurn.sent_filters.length > 0) {
    rows.push({
      label: "Customer context",
      value: (
        <span className="font-mono">
          {userTurn.sent_filters.join(" · ")}
        </span>
      ),
    });
  }

  // Goals — one row lists every goal event fired in this exchange.
  const allGoals = botTurns.flatMap((t) => t.goals ?? []);
  if (allGoals.length > 0) {
    rows.push({
      label: "Goal reached",
      value: (
        <span className="flex flex-wrap gap-x-3 gap-y-0.5 text-boost-green font-medium">
          {allGoals.map((g, i) => (
            <span
              key={`${g.id}-${g.event_type}-${i}`}
              className="inline-flex items-center gap-1"
            >
              {formatGoalEvent(g.name, g.event_type)}
              {g.value != null && g.value > 0 && (
                <span className="text-boost-muted font-normal">
                  · €{g.value.toFixed(2)}
                </span>
              )}
            </span>
          ))}
        </span>
      ),
    });
  }

  // CSAT — per-message feedback thumbs.
  const fb = primary?.feedback ?? null;
  if (fb) {
    const positive = fb === "thumbs_up";
    rows.push({
      label: "CSAT",
      value: (
        <span
          className={`inline-flex items-center gap-1.5 font-medium ${
            positive ? "text-boost-green" : "text-boost-orange"
          }`}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            className={`w-3 h-3 ${positive ? "" : "rotate-180"}`}
          >
            <path
              d="M2 7h3v7H2z M5 14h6.5a1.5 1.5 0 0 0 1.48-1.24l.76-5a1.5 1.5 0 0 0-1.48-1.76H9l.5-2.5A1.5 1.5 0 0 0 8 1.75 7 7 0 0 1 5 7v7z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
              fill="currentColor"
              fillOpacity="0.15"
            />
          </svg>
          {positive ? "Positive" : "Negative"}
        </span>
      ),
    });
  }

  // Think time — right-aligned next to Tier 1 (not a row). Compute here
  // so we can render it in the header.
  const thinkMs =
    userTurn && primary ? thinkTimeMs(userTurn.created, primary.created) : null;

  // User quote — truncated preview of the question that drove this
  // exchange. Rendered as the first diamond bullet in the body.
  const userQuote = userTurn?.original_question ?? null;
  const userQuoteShort = userQuote
    ? userQuote.length > 80
      ? `${userQuote.slice(0, 77)}…`
      : userQuote
    : null;

  // Eyebrow for the card's coloured band.
  const eyebrow = kind === "welcome" ? "Welcome" : `Exchange ${index}`;

  return (
    <article
      data-testid={`routing-exchange-${index}`}
      className={`rounded-xl border ${meta.cardBorder} bg-white overflow-hidden transition-shadow duration-200 hover:shadow-sm animate-modal-in`}
    >
      {/* Coloured header band — SoW phase-card pattern. Eyebrow +
          tier-2 headline + tier-1 / time subtitle. */}
      <div className={`${meta.bandBg} px-4 py-2.5`}>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
            {eyebrow}
          </p>
          {thinkMs != null && (
            <p className="text-[10px] font-mono opacity-75 tabular-nums">
              {formatLatency(thinkMs)}
            </p>
          )}
        </div>
        <p className="text-sm font-bold leading-snug mt-0.5">{meta.tierTwo}</p>
        {meta.tierOne && (
          <p className="text-[10.5px] opacity-80 mt-0.5">{meta.tierOne}</p>
        )}
      </div>

      {/* Body — bullet list: diamond for primary items (user quote +
          context sentence), middle dot for secondary data rows. */}
      <div className="p-3 space-y-1.5">
        {userQuoteShort && (
          <div className="flex items-start gap-2">
            <span
              aria-hidden
              className="text-boost-green-light text-[10px] mt-0.5 shrink-0"
            >
              ◆
            </span>
            <p className="text-[11.5px] text-boost-dark font-medium leading-snug">
              You wrote: &ldquo;{userQuoteShort}&rdquo;
            </p>
          </div>
        )}

        {meta.context && (
          <div className="flex items-start gap-2">
            <span
              aria-hidden
              className="text-boost-green-light text-[10px] mt-0.5 shrink-0"
            >
              ◆
            </span>
            <p className="text-[11.5px] text-boost-dark leading-snug">
              {meta.context}
            </p>
          </div>
        )}

        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-2">
            <span
              aria-hidden
              className="text-boost-muted text-[10px] mt-0.5 shrink-0"
            >
              ·
            </span>
            <p className="text-[11px] text-boost-muted leading-snug">
              <span className="text-boost-dark font-medium">{r.label}:</span>{" "}
              {r.value}
            </p>
          </div>
        ))}
      </div>

      {/* Footer — small links, no box chrome. */}
      <div className="px-3 pb-2.5 pt-0 flex items-center justify-between gap-3 text-[10px]">
        <button
          type="button"
          onClick={() => setInspectOpen((v) => !v)}
          aria-expanded={inspectOpen}
          data-testid={`routing-exchange-${index}-inspect`}
          className="text-boost-muted hover:text-boost-purple transition-colors"
        >
          {inspectOpen ? "Hide details" : "Behind the scenes"}
        </button>
        {conversationId != null && (
          <a
            href={`https://${tenant}/admin/conversations/${conversationId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-boost-muted hover:text-boost-purple transition-colors inline-flex items-center gap-1"
            title="Open this conversation in the boost.ai admin panel"
          >
            Open in admin
            <svg
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
              className="w-2.5 h-2.5"
            >
              <path
                d="M6 3h7v7M13 3 5 11M3 6v7h7"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        )}
      </div>

      {/* Drawer — raw turn JSON, includes flow / template IDs for
          power users. */}
      {inspectOpen && (
        <pre className="mx-3 mb-3 p-3 rounded-lg bg-boost-surface font-mono text-[10px] text-boost-dark overflow-x-auto leading-snug">
          {JSON.stringify({ user: userTurn, bots: botTurns }, null, 2)}
        </pre>
      )}
    </article>
  );
}

/** Single-line "where did boost.ai send this?" label.
 *
 *  Priority:
 *    1. Matched classical intent → its title (or #id)
 *    2. Bot's action type → "Generative fallback" / "Scripted
 *       content" / the raw action_type name for exotic ones
 *    3. Welcome trigger → "VA welcome"
 *    4. Unknown fallback state
 */
function routedToLabel(
  userTurn: ExportTurnTrace | null,
  primary: ExportTurnTrace | null,
): ReactNode {
  if (userTurn?.predicted_intent?.title) {
    return (
      <span className="font-mono text-boost-purple font-semibold">
        Intent · {userTurn.predicted_intent.title}
      </span>
    );
  }
  if (userTurn?.predicted_intent?.id != null) {
    return (
      <span className="font-mono text-boost-purple font-semibold">
        Intent · #{userTurn.predicted_intent.id}
      </span>
    );
  }

  const action = primary?.action_type ?? null;
  if (action === "generative" || action === "llm") {
    return <span className="text-boost-purple">Generative fallback</span>;
  }
  if (action === "content") {
    return <span className="text-boost-green">Scripted content</span>;
  }
  if (action === "api_connector") {
    return <span className="text-boost-orange">API connector</span>;
  }
  if (action === "entity_extraction") {
    return <span className="text-boost-gold">Entity extraction</span>;
  }
  if (action) {
    return <span className="font-mono text-boost-dark">{action}</span>;
  }
  if (userTurn?.is_unknown) {
    return <span className="text-boost-muted italic">Unknown (fallback)</span>;
  }
  return <span className="text-boost-muted italic">—</span>;
}

function thinkTimeMs(userCreated: string, botCreated: string): number | null {
  const u = Date.parse(userCreated);
  const b = Date.parse(botCreated);
  if (!Number.isFinite(u) || !Number.isFinite(b)) return null;
  const diff = b - u;
  if (diff < 0 || diff > 60_000) return null; // sanity-cap
  return diff;
}

function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
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

/* ─── Phase B — hero + session chrome components ──────────────── */

/** Compose a verdict + narrative sentence for the session, in
 *  marketing voice. Replaces the old stats-ladder ("N exchanges · N
 *  scripted · N handovers · avg Xs") with something that actually
 *  reads as a story. */
function composeVerdict(trace: ExportTraceSuccess): {
  label: string;
  sublabel: string;
  narrative: string;
  tone: "automated" | "escalated" | "mixed" | "api" | "neutral";
} | null {
  const exchanges = groupExchanges(trace.turns);
  if (exchanges.length === 0) return null;

  const actionCounts: Record<string, number> = {};
  const languages = new Set<string>();
  const latencies: number[] = [];
  let handovers = 0;
  let apiCalls = 0;
  let goalEvents = 0;

  for (let i = 0; i < trace.turns.length; i++) {
    const t = trace.turns[i];
    if (t.language) languages.add(t.language);
    if (t.is_human_chat_queue || t.is_human_chat) handovers += 1;
    if (t.action_type === "api_connector" || t.action_type === "legacy_api") apiCalls += 1;
    if (t.action_type && t.role !== "user") {
      actionCounts[t.action_type] = (actionCounts[t.action_type] ?? 0) + 1;
    }
    if (Array.isArray(t.goals)) goalEvents += t.goals.length;
    if (t.role === "user") {
      const next = trace.turns[i + 1];
      if (next && next.role !== "user") {
        const ms = thinkTimeMs(t.created, next.created);
        if (ms != null) latencies.push(ms);
      }
    }
  }

  const generated = actionCounts["generative"] ?? 0;
  const scripted = actionCounts["content"] ?? 0;
  const orchestrated = actionCounts["orchestrator"] ?? 0;
  const avgMs =
    latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : null;

  // Verdict label — the 2-word story headline.
  let label: string;
  let tone: "automated" | "escalated" | "mixed" | "api" | "neutral";
  if (handovers > 0) {
    label = "Escalated";
    tone = "escalated";
  } else if (apiCalls > 0) {
    label = "Live data";
    tone = "api";
  } else if (generated > 0 && scripted === 0 && orchestrated === 0) {
    label = "Generated live";
    tone = "automated";
  } else if (scripted > 0 && generated === 0) {
    label = "Fully scripted";
    tone = "automated";
  } else if (generated > 0 && scripted > 0) {
    label = "Mixed answers";
    tone = "mixed";
  } else if (orchestrated > 0) {
    label = "Orchestrated";
    tone = "neutral";
  } else {
    label = "Handled";
    tone = "neutral";
  }

  // Sublabel — a subtle stat line ("Fully automated", "3 turns", etc.)
  const exchangeWord = exchanges.length === 1 ? "moment" : "moments";
  const parts: string[] = [];
  parts.push(`${exchanges.length} ${exchangeWord}`);
  if (handovers === 0 && exchanges.length > 1) parts.push("no handovers");
  if (avgMs != null) parts.push(`avg ${formatLatency(Math.round(avgMs))}`);
  const sublabel = parts.join(" · ");

  // Narrative — read as a sentence, not a data list.
  const narrativeBits: string[] = [];
  if (generated > 0) {
    narrativeBits.push(
      generated === 1
        ? "composed one answer on the fly"
        : `composed ${generated} answers on the fly`,
    );
  }
  if (scripted > 0) {
    narrativeBits.push(
      scripted === 1
        ? "served a scripted reply"
        : `served ${scripted} scripted replies`,
    );
  }
  if (apiCalls > 0) {
    narrativeBits.push(
      apiCalls === 1
        ? "pulled live data from a connected system"
        : `pulled live data ${apiCalls} times`,
    );
  }
  if (orchestrated > 0) {
    narrativeBits.push(
      orchestrated === 1
        ? "routed to a specialist"
        : `routed to specialists ${orchestrated} times`,
    );
  }
  if (handovers > 0) {
    narrativeBits.push(
      handovers === 1
        ? "handed off to a human"
        : `handed off ${handovers} times`,
    );
  }
  if (goalEvents > 0) {
    narrativeBits.push(
      goalEvents === 1
        ? "reached one goal event"
        : `reached ${goalEvents} goal events`,
    );
  }
  if (languages.size > 1) {
    narrativeBits.push(
      `handled ${languages.size} languages (${Array.from(languages).sort().join(", ")})`,
    );
  }

  let narrative: string;
  if (narrativeBits.length === 0) {
    narrative = "The agent handled the conversation end-to-end.";
  } else if (narrativeBits.length === 1) {
    narrative = `The agent ${narrativeBits[0]}.`;
  } else {
    const last = narrativeBits.pop()!;
    narrative = `The agent ${narrativeBits.join(", ")} and ${last}.`;
  }

  return { label, sublabel, narrative, tone };
}

/** Session verdict card — the panel's hero. Mirrors the structure of
 *  the educational tiles below (icon + bold title + explainer) so the
 *  whole panel reads as a consistent stack of story cards, not a
 *  dashboard. */
function HeroSummary({
  trace,
}: {
  trace: ExportTraceSuccess | null;
  exchangeCount: number;
}) {
  if (!trace) return null;
  const verdict = composeVerdict(trace);
  if (!verdict) return null;

  // Icon + accent per verdict tone. Keeps it legible on the deep-
  // purple gradient by sticking to brand greens / golds / light hues.
  const toneMeta = {
    automated: {
      accent: "text-boost-green-light",
      icon: (
        <path
          d="M4 10l3 3 7-7M14 4l2 2-2 2"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ),
    },
    escalated: {
      accent: "text-boost-orange",
      icon: (
        <path
          d="M4 13h14l-7-11z M11 8v3m0 2v.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.12"
        />
      ),
    },
    api: {
      accent: "text-boost-orange",
      icon: (
        <path
          d="M3 10h4m2 0h4m2 0h2M7 5v4m0 2v4m6-10v4m0 2v4M5 5h4v10H5zm6 0h4v10h-4z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ),
    },
    mixed: {
      accent: "text-boost-green-light",
      icon: (
        <path
          d="M11 3l2.5 5L19 9l-4 3.5L16 18l-5-3-5 3 1-5.5L3 9l5.5-1z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.12"
        />
      ),
    },
    neutral: {
      accent: "text-white",
      icon: (
        <circle
          cx="11"
          cy="11"
          r="6"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="currentColor"
          fillOpacity="0.12"
        />
      ),
    },
  }[verdict.tone];

  return (
    <section
      aria-label="Session verdict"
      data-testid="data-funnel-hero"
      className="relative overflow-hidden rounded-xl"
    >
      {/* Deep layered purple — the Overview-section brand treatment. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(89,25,93,0.55) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 85% 100%, rgba(54,181,149,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 40% 35% at 10% 90%, rgba(54,181,149,0.08) 0%, transparent 60%),
            linear-gradient(180deg, #231528 0%, #1a1020 45%, #141118 100%)
          `,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 p-4 flex items-start gap-3">
        <span
          aria-hidden
          className={`flex-shrink-0 w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center ${toneMeta.accent}`}
        >
          <svg viewBox="0 0 22 22" fill="none" className="w-4.5 h-4.5">
            {toneMeta.icon}
          </svg>
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/55">
            {verdict.sublabel}
          </p>
          <h3
            className={`text-[16px] font-semibold leading-tight mt-0.5 ${toneMeta.accent}`}
          >
            {verdict.label}
          </h3>
          <p className="text-[11.5px] leading-relaxed text-white/80 mt-1.5">
            {verdict.narrative}
          </p>
        </div>
      </div>
    </section>
  );
}

/** Session-wide chrome strip: matched filters, sent filter values,
 *  goals triggered across the session, and the auto-review category
 *  when present. Each grouping is its own mini-row with a compact
 *  label, chip list, and a hide-when-empty guard so financewizard
 *  doesn't stare at a parade of empty state. */
function SessionChromeStrip({
  trace,
}: {
  trace: ExportTraceSuccess;
}) {
  const session = trace.session;
  const matchedFilters = session.matched_filters ?? [];
  const sentValues = session.sent_filter_values ?? [];
  const sessionTags = session.session_tags ?? [];
  const sessionFeedback = session.feedback ?? null;
  const category = session.category?.automatic ?? null;

  // Collapse goal events across all turns into a deduped list of
  // "goal_name · event_type" chips. Keeps visual noise down when a
  // single goal fires many turns in a row.
  const goalChips = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of trace.turns) {
      if (!t.goals) continue;
      for (const g of t.goals) {
        const key = formatGoalEvent(g.name, g.event_type);
        if (!seen.has(key)) {
          seen.add(key);
          out.push(key);
        }
      }
    }
    return out;
  }, [trace.turns]);

  // Nothing to say → render nothing so the panel stays clean.
  const hasAnything =
    matchedFilters.length > 0 ||
    sentValues.length > 0 ||
    sessionTags.length > 0 ||
    goalChips.length > 0 ||
    sessionFeedback != null ||
    category != null;

  if (!hasAnything) return null;

  const catVis = category ? categoryVisual(category) : null;

  const GroupLabel = ({ children }: { children: ReactNode }) => (
    <span className="text-[9px] font-semibold uppercase tracking-wider text-boost-muted flex-shrink-0 w-[82px]">
      {children}
    </span>
  );

  return (
    <section
      aria-labelledby="funnel-session-chrome"
      data-testid="data-funnel-session-chrome"
      className="rounded-xl border border-boost-border bg-white p-3 space-y-1.5"
    >
      <p
        id="funnel-session-chrome"
        className="text-[10px] font-bold text-boost-muted uppercase tracking-wider mb-1"
      >
        Tuned for this customer
      </p>

      {matchedFilters.length > 0 && (
        <div className="flex items-start gap-2">
          <GroupLabel>Personalised for</GroupLabel>
          <span className="flex flex-wrap gap-1 min-w-0">
            {matchedFilters.map((f) => (
              <span
                key={f.id}
                className="px-1.5 py-0.5 rounded bg-boost-purple/10 text-boost-purple text-[10px] font-mono"
              >
                {f.title ?? `#${f.id}`}
              </span>
            ))}
          </span>
        </div>
      )}

      {sentValues.length > 0 && (
        <div className="flex items-start gap-2">
          <GroupLabel>Customer profile</GroupLabel>
          <span className="flex flex-wrap gap-1 min-w-0">
            {sentValues.map((v, i) => (
              <span
                key={`${v}-${i}`}
                className="px-1.5 py-0.5 rounded bg-boost-surface text-boost-dark text-[10px] font-mono"
              >
                {v}
              </span>
            ))}
          </span>
        </div>
      )}

      {goalChips.length > 0 && (
        <div className="flex items-start gap-2">
          <GroupLabel>Reached</GroupLabel>
          <span className="flex flex-wrap gap-1 min-w-0">
            {goalChips.map((g) => (
              <span
                key={g}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-boost-green/10 text-boost-green text-[10px] font-semibold"
              >
                <span aria-hidden className="w-1 h-1 rounded-full bg-boost-green" />
                {g}
              </span>
            ))}
          </span>
        </div>
      )}

      {sessionTags.length > 0 && (
        <div className="flex items-start gap-2">
          <GroupLabel>Tags</GroupLabel>
          <span className="flex flex-wrap gap-1 min-w-0">
            {sessionTags.map((t) => (
              <span
                key={t}
                className="px-1.5 py-0.5 rounded bg-boost-surface text-boost-muted text-[10px] font-mono"
              >
                {t}
              </span>
            ))}
          </span>
        </div>
      )}

      {catVis && (
        <div className="flex items-start gap-2">
          <GroupLabel>Verdict</GroupLabel>
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${catVis.className}`}
          >
            {catVis.label}
          </span>
        </div>
      )}

      {sessionFeedback && (
        <div className="flex items-start gap-2">
          <GroupLabel>Feedback</GroupLabel>
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
              sessionFeedback.rating === "thumbs_up"
                ? "text-boost-green"
                : "text-boost-orange"
            }`}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
              className={`w-3 h-3 ${sessionFeedback.rating === "thumbs_up" ? "" : "rotate-180"}`}
            >
              <path
                d="M2 7h3v7H2z M5 14h6.5a1.5 1.5 0 0 0 1.48-1.24l.76-5a1.5 1.5 0 0 0-1.48-1.76H9l.5-2.5A1.5 1.5 0 0 0 8 1.75 7 7 0 0 1 5 7v7z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
                fill="currentColor"
                fillOpacity="0.15"
              />
            </svg>
            {sessionFeedback.rating === "thumbs_up" ? "Positive" : "Negative"}
            {sessionFeedback.text && (
              <span className="font-normal text-boost-dark/75 italic">
                · &ldquo;{sessionFeedback.text.slice(0, 80)}
                {sessionFeedback.text.length > 80 ? "…" : ""}&rdquo;
              </span>
            )}
          </span>
        </div>
      )}
    </section>
  );
}

/** Tight action-type sparkbar — one colored segment per bot turn.
 *  Reads left-to-right as conversation flow. Click a segment → scroll
 *  the corresponding exchange card into view. Hides when there's
 *  nothing to plot. */
/** Educational tile — capability pitch for the *kinds* of response
 *  the agent can return. Renders as evergreen content (same whether
 *  this conversation exercised them or not) because the chat column
 *  already shows whichever elements actually fired. */
function RichResponsesTile() {
  const Row = ({
    icon,
    label,
    desc,
  }: {
    icon: ReactNode;
    label: string;
    desc: string;
  }) => (
    <div className="flex items-start gap-2.5">
      <span
        aria-hidden
        className="flex-shrink-0 w-7 h-7 rounded-md bg-boost-surface flex items-center justify-center text-boost-purple"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11.5px] font-semibold text-boost-dark leading-tight">
          {label}
        </p>
        <p className="text-[10.5px] text-boost-muted leading-snug">{desc}</p>
      </div>
    </div>
  );

  return (
    <section
      aria-labelledby="funnel-rich-responses"
      className="rounded-xl border border-boost-border bg-white p-4 space-y-3"
    >
      <p
        id="funnel-rich-responses"
        className="text-[10px] font-bold text-boost-muted uppercase tracking-wider"
      >
        What the agent can respond with
      </p>
      <div className="grid grid-cols-1 gap-2.5">
        <Row
          label="Text &amp; formatted HTML"
          desc="Rich-text replies with bold, links, bullet lists, code blocks."
          icon={
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
              <path
                d="M3 5h10M3 8h10M3 11h6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          }
        />
        <Row
          label="Action buttons &amp; URL links"
          desc="Clickable follow-ups — route the customer, trigger actions, deep-link into your product."
          icon={
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
              <rect
                x="2"
                y="4"
                width="12"
                height="4"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.4"
                fill="currentColor"
                fillOpacity="0.1"
              />
              <path
                d="M5 11h6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          }
        />
        <Row
          label="Images &amp; videos"
          desc="Inline media — product shots, short explainers, screenshots."
          icon={
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
              <rect
                x="2"
                y="3"
                width="12"
                height="10"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.4"
                fill="currentColor"
                fillOpacity="0.1"
              />
              <path
                d="m3 11 3-3 3 3 2-2 2 2"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="6" r="1" fill="currentColor" />
            </svg>
          }
        />
        <Row
          label="Structured JSON for custom UI"
          desc="Render anything — forms, carousels, charts — from a payload your frontend owns."
          icon={
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
              <path
                d="M5 3c-1 0-2 .5-2 2v2c0 .5-.5 1-1 1s1 .5 1 1v2c0 1.5 1 2 2 2M11 3c1 0 2 .5 2 2v2c0 .5.5 1 1 1s-1 .5-1 1v2c0 1.5-1 2-2 2"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <Row
          label="Voice (SSML)"
          desc="Spoken replies with pacing and pronunciation control for IVR and voice channels."
          icon={
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
              <path
                d="M4 7v2m3-4v6m3-8v10m3-7v4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          }
        />
      </div>
      <p className="text-[10.5px] text-boost-muted leading-snug pt-0.5">
        The chat column renders any of these as the agent returns them
        during the conversation.
      </p>
    </section>
  );
}

/** Educational tile — pitch for the platform's auto-classification +
 *  human-supervised review feature. Shown when the current session
 *  has no auto-verdict yet (most demos). Deep-links to the admin panel
 *  so stakeholders can see the feature live. */
function AutoClassificationTile({ tenant }: { tenant: string }) {
  return (
    <section
      aria-labelledby="funnel-auto-classify"
      className="rounded-xl border border-boost-border bg-gradient-to-br from-boost-green/[0.03] via-white to-boost-purple/[0.03] p-4 space-y-2"
    >
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden
          className="flex-shrink-0 w-7 h-7 rounded-md bg-boost-green/10 flex items-center justify-center text-boost-green"
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
            <path
              d="M2 8l3 3 6-6M10 2l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p
            id="funnel-auto-classify"
            className="text-[11.5px] font-semibold text-boost-dark leading-tight"
          >
            Every conversation can be auto-classified
          </p>
          <p className="text-[10.5px] text-boost-muted leading-snug mt-1">
            In the admin panel, boost.ai can review conversations end-to-end
            and bucket them as Automated, Escalated, Unsolved or Not relevant —
            with human oversight so your team keeps the final say.
          </p>
          <a
            href={`https://${tenant}/admin/conversations`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-[10px] font-semibold text-boost-purple hover:text-boost-green transition-colors"
          >
            Open in admin
            <svg
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
              className="w-2.5 h-2.5"
            >
              <path
                d="M6 3h7v7M13 3 5 11M3 6v7h7"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

function ActionSparkbar({ trace }: { trace: ExportTraceSuccess }) {
  const botTurns = useMemo(
    () => trace.turns.filter((t) => t.role !== "user"),
    [trace.turns],
  );
  if (botTurns.length === 0) return null;

  return (
    <section
      aria-label="Action-type flow"
      data-testid="data-funnel-sparkbar"
      className="rounded-xl border border-boost-border bg-white p-2.5 space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-boost-muted uppercase tracking-wider">
          Action flow
        </p>
        <p className="text-[9px] text-boost-muted">
          {botTurns.length} bot turn{botTurns.length === 1 ? "" : "s"}
        </p>
      </div>
      <div
        role="list"
        className="flex items-stretch gap-0.5 h-4 rounded overflow-hidden"
      >
        {botTurns.map((t, i) => {
          const v = actionTypeVisual(t.action_type);
          // Colour the segment by the action-type's accent class,
          // flattened to a solid bg. Pull the colour via className
          // composition (Tailwind converts to a real bg at build).
          const segBg =
            t.action_type === "generative" || t.action_type === "llm"
              ? "bg-boost-purple"
              : t.action_type === "content"
                ? "bg-boost-green"
                : t.action_type === "api_connector" ||
                    t.action_type === "legacy_api"
                  ? "bg-boost-orange"
                  : t.action_type === "entity_extraction"
                    ? "bg-boost-gold"
                    : t.action_type === "orchestrator"
                      ? "bg-boost-lavender"
                      : "bg-boost-border";
          return (
            <a
              key={`${t.id}-${i}`}
              role="listitem"
              href={`#routing-exchange-${i + 1}`}
              onClick={(e) => {
                e.preventDefault();
                const target = document.querySelector(
                  `[data-testid="routing-exchange-${i + 1}"]`,
                );
                if (target && "scrollIntoView" in target) {
                  (target as HTMLElement).scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }
              }}
              title={`${v.label}${t.action_type ? ` · ${t.action_type}` : ""}`}
              className={`flex-1 min-w-0 ${segBg} opacity-85 hover:opacity-100 transition-opacity cursor-pointer`}
              aria-label={`Turn ${i + 1} · ${v.label}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-boost-muted">
        <LegendDot colour="bg-boost-purple" label="Generative" />
        <LegendDot colour="bg-boost-green" label="Scripted" />
        <LegendDot colour="bg-boost-orange" label="API" />
        <LegendDot colour="bg-boost-gold" label="Entity" />
      </div>
    </section>
  );
}

function LegendDot({ colour, label }: { colour: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span aria-hidden className={`w-1.5 h-1.5 rounded-full ${colour}`} />
      <span>{label}</span>
    </span>
  );
}

/* ─── Phase B helpers — action-type visual language ──────────── */

interface ActionVisual {
  /** Left-border colour on the exchange card. */
  borderLeft: string;
  /** Background for the illustrated-icon wrapper (soft tint). */
  iconBg: string;
  /** Text colour for the headline + label. */
  accent: string;
  /** Tailwind bg class for segment in the ribbon / sparkbar. */
  segmentBg: string;
  /** Short tag label used in small UI (ribbon legend, inspector drawer). */
  label: string;
  /** Marketing headline shown as the card title. */
  headline: string;
  /** Hand-drawn illustrated SVG (40×40 viewBox). */
  icon: ReactNode;
  /** True → apply the subtle funnelShimmer behind the card header. */
  shimmer: boolean;
}

/** Map `displayed_action.action_type` → per-type visual + copy.
 *  Single source of truth for the "what component did the agent use"
 *  narrative. Icons are hand-drawn scenes sized to read at ~36-40px
 *  on the card — big enough to feel illustrated, small enough that
 *  the full SVG still ships under a few hundred bytes. */
function actionTypeVisual(actionType: string | null | undefined): ActionVisual {
  switch (actionType) {
    case "generative":
    case "llm":
      return {
        borderLeft: "border-l-boost-purple",
        iconBg: "bg-boost-purple/8",
        accent: "text-boost-purple",
        segmentBg: "bg-boost-purple",
        label: "Composed",
        headline: "Composed a fresh answer",
        shimmer: true,
        icon: (
          // Brain with a spark rising out of it — "it thought this up"
          <svg viewBox="0 0 40 40" fill="none" aria-hidden className="w-full h-full">
            <path
              d="M12 14c0-3.5 3-6 7-6s7 2.5 7 6v1c2 1 3 3 3 5 0 3-2.5 5-5 5v3c0 2-2 4-5 4s-5-2-5-4v-1h-2c-2.5 0-5-2-5-5 0-2 1-4 3-5v-1c0-1-1-2-2-2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="currentColor"
              fillOpacity="0.08"
            />
            <path
              d="M16 15c1-1 3-1 4 0m0 4c1-1 3-1 4 0M16 22c1 1 3 1 4 0"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.7"
            />
            <path
              d="M30 6l1 3-3-1 3-1zm-2-3l.6 1.8 1.8.6-1.8.6L28 8l-.6-1.8-1.8-.6 1.8-.6L28 3z"
              fill="currentColor"
            />
          </svg>
        ),
      };
    case "content":
      return {
        borderLeft: "border-l-boost-green",
        iconBg: "bg-boost-green/8",
        accent: "text-boost-green",
        segmentBg: "bg-boost-green",
        label: "Curated",
        headline: "Delivered a curated answer",
        shimmer: false,
        icon: (
          // Scroll / document with a checkmark — "pulled from verified knowledge"
          <svg viewBox="0 0 40 40" fill="none" aria-hidden className="w-full h-full">
            <path
              d="M11 8c0-1.5 1.2-3 3-3h16a3 3 0 0 1 3 3v22a5 5 0 0 1-5 5H14c-1.5 0-3-1-3-3V8z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
              fill="currentColor"
              fillOpacity="0.08"
            />
            <path d="M16 12h12M16 16h12M16 20h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.55"/>
            <path
              d="m14 27 3 3 6-7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
      };
    case "api_connector":
    case "legacy_api":
      return {
        borderLeft: "border-l-boost-orange",
        iconBg: "bg-boost-orange/8",
        accent: "text-boost-orange",
        segmentBg: "bg-boost-orange",
        label: "Live data",
        headline: "Pulled live data",
        shimmer: false,
        icon: (
          // Plug meeting socket across the gap — "it called out to another system"
          <svg viewBox="0 0 40 40" fill="none" aria-hidden className="w-full h-full">
            <path
              d="M5 20h7m5 0h6m5 0h7M11 14v12a3 3 0 0 0 3 3h3V11h-3a3 3 0 0 0-3 3zm15-3h3a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-3V11z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="currentColor"
              fillOpacity="0.08"
            />
            <path d="M18 20h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ),
      };
    case "entity_extraction":
      return {
        borderLeft: "border-l-boost-gold",
        iconBg: "bg-boost-gold/10",
        accent: "text-boost-gold",
        segmentBg: "bg-boost-gold",
        label: "Captured",
        headline: "Captured a detail",
        shimmer: false,
        icon: (
          // Form with a magnifier picking out a field — "it read out the key info"
          <svg viewBox="0 0 40 40" fill="none" aria-hidden className="w-full h-full">
            <rect x="8" y="7" width="20" height="24" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08"/>
            <path d="M12 13h12M12 17h12M12 21h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.55"/>
            <circle cx="25" cy="26" r="5" stroke="currentColor" strokeWidth="1.6" fill="white"/>
            <path d="m29 30 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ),
      };
    case "orchestrator":
      return {
        borderLeft: "border-l-boost-lavender",
        iconBg: "bg-boost-lavender/15",
        accent: "text-boost-purple",
        segmentBg: "bg-boost-lavender",
        label: "Routed",
        headline: "Routed to a specialist",
        shimmer: false,
        icon: (
          // Central hub with 4 satellite nodes — "it chose the right specialist"
          <svg viewBox="0 0 40 40" fill="none" aria-hidden className="w-full h-full">
            <circle cx="20" cy="20" r="5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.14"/>
            <circle cx="20" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" fill="white"/>
            <circle cx="20" cy="34" r="3" stroke="currentColor" strokeWidth="1.5" fill="white"/>
            <circle cx="6" cy="20" r="3" stroke="currentColor" strokeWidth="1.5" fill="white"/>
            <circle cx="34" cy="20" r="3" stroke="currentColor" strokeWidth="1.5" fill="white"/>
            <path d="M20 9v6m0 10v6m-9-11h6m10 0h6" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
          </svg>
        ),
      };
    case "if":
    case "context":
    case "process":
    case "end_process":
    case "ab_test":
    case "listen":
      return {
        borderLeft: "border-l-boost-border",
        iconBg: "bg-boost-surface",
        accent: "text-boost-dark",
        segmentBg: "bg-boost-border",
        label: "Flow",
        headline: "Moved through a flow step",
        shimmer: false,
        icon: (
          <svg viewBox="0 0 40 40" fill="none" aria-hidden className="w-full h-full">
            <path d="M8 10h14l6 6-6 6H8l6-6-6-6zM8 22h14l6 6-6 6H8l6-6-6-6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="currentColor" fillOpacity="0.08"/>
          </svg>
        ),
      };
    default:
      return {
        borderLeft: "border-l-boost-border",
        iconBg: "bg-boost-surface",
        accent: "text-boost-muted",
        segmentBg: "bg-boost-border",
        label: "—",
        headline: "A turn happened",
        shimmer: false,
        icon: (
          <svg viewBox="0 0 40 40" fill="none" aria-hidden className="w-full h-full">
            <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08"/>
          </svg>
        ),
      };
  }
}

/** Per-card contextual explainer built from the raw turn data, in
 *  confident marketing voice. Returns a single sentence or null if
 *  there's nothing meaningful to say beyond the headline. */
function actionContextSentence(
  actionType: string | null | undefined,
  userQuestion: string | null,
  isWelcome: boolean,
): string | null {
  const quoted = userQuestion
    ? `"${userQuestion.slice(0, 80)}${userQuestion.length > 80 ? "…" : ""}"`
    : null;
  if (isWelcome) {
    return "Opened the conversation with a welcome script.";
  }
  switch (actionType) {
    case "generative":
    case "llm":
      return quoted
        ? `The customer asked ${quoted}. No scripted answer fit, so the language model composed one in context.`
        : "The language model composed a reply in context, on the fly.";
    case "content":
      return quoted
        ? `Matched ${quoted} to a curated answer from the knowledge base.`
        : "Served a curated answer from the knowledge base.";
    case "api_connector":
    case "legacy_api":
      return "Called out to a connected system and returned live data.";
    case "entity_extraction":
      return quoted
        ? `Captured a detail from ${quoted} into the conversation state.`
        : "Captured a detail into the conversation state.";
    case "orchestrator":
      return "Routed to the right specialist agent across the VA network.";
    default:
      return null;
  }
}

/** Format a goal event in marketing voice: "Started: account_opened",
 *  "Completed: account_opened", "Cancelled: …", "Continued: …". Falls
 *  back to plain name when the event type is absent. */
function formatGoalEvent(
  name: string | null,
  eventType: string | null,
): string {
  const n = (name || "").trim() || "goal";
  if (!eventType) return n;
  switch (eventType) {
    case "start":
      return `Started: ${n}`;
    case "end":
      return `Completed: ${n}`;
    case "cancel":
      return `Cancelled: ${n}`;
    case "continue":
      return `Continued: ${n}`;
    default:
      return `${n} (${eventType})`;
  }
}

/** Translate the session category underscore-enum into a brand-coloured
 *  badge token — same palette as the action-type system so CE audiences
 *  can read "automated" vs "escalated" at a glance. */
function categoryVisual(cat: string): { label: string; className: string } {
  const lower = cat.toLowerCase();
  const label = formatCategory(cat);
  if (lower.startsWith("automated")) {
    return { label, className: "bg-boost-green/10 text-boost-green" };
  }
  if (lower.startsWith("escalated")) {
    return { label, className: "bg-boost-orange/10 text-boost-orange" };
  }
  if (lower === "unsolved") {
    return { label, className: "bg-boost-purple/10 text-boost-purple" };
  }
  return { label, className: "bg-boost-surface text-boost-muted" };
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
