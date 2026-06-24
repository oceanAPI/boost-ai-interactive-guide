"use client";

/* ──────────────────────────────────────────────────────────────
 *  IntentTrafficSection — conversation analytics from a boost.ai
 *  intent-traffic export.
 *
 *  Renders `customer.intent_traffic` (a compact rollup the builder
 *  produced from the raw CSV): a KPI header, then a per-root bar list
 *  showing the automated / escalated / unsolved split, each root
 *  expanding to its top child intents. High-traffic + low-automation
 *  roots/intents are flagged as automation opportunities; high
 *  unsolved / no-prediction as training gaps — the data behind the
 *  recommendations + value/effort matrix.
 *
 *  Everything is derived at render from raw counts, so percentages
 *  never drift and the persisted payload stays tiny.
 * ────────────────────────────────────────────────────────────── */

import { useMemo, useState } from "react";
import type {
  Customer,
  IntentTrafficRoot,
  IntentTrafficIntent,
  IntentTrafficStats,
} from "@/lib/types";
import { pct, reviewSplit } from "@/data/intent-traffic";
import SectionHeader from "@/components/ui/SectionHeader";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface IntentTrafficSectionProps {
  customer?: Customer;
  sectionNumber?: string;
}

const fmt = (n: number) => n.toLocaleString("en-US");
const pc = (n: number) => `${n.toFixed(n < 10 ? 1 : 0)}%`;

export default function IntentTrafficSection({
  customer,
  sectionNumber,
}: IntentTrafficSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [openRoot, setOpenRoot] = useState<string | null>(null);

  const data = customer?.intent_traffic;

  /** Overall automation rate — the benchmark line for opportunity flags. */
  const overallAuto = useMemo(
    () => (data ? pct(data.totals.automated, data.totals.reviewed) : 0),
    [data],
  );

  if (!data || data.roots.length === 0) {
    return (
      <section>
        <SectionHeader
          number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
          title="Intent traffic"
          subtitle="Upload the boost.ai intent-traffic export in the builder to surface conversation analytics here."
        />
      </section>
    );
  }

  const { totals } = data;
  const maxRootTraffic = data.roots[0]?.traffic ?? 1;

  const kpis = [
    { label: "Conversations", value: fmt(totals.traffic), tone: "neutral" as const },
    { label: "Automated", value: pc(overallAuto), tone: "good" as const },
    {
      label: "Escalated",
      value: pc(pct(totals.escalated, totals.reviewed)),
      tone: "warn" as const,
    },
    {
      label: "Unsolved",
      value: pc(pct(totals.unsolved, totals.reviewed)),
      tone: "bad" as const,
    },
    {
      label: "Handover",
      value: pc(pct(totals.handover, totals.traffic)),
      tone: "neutral" as const,
    },
    {
      label: "Positive feedback",
      value: pc(pct(totals.positiveFeedback, totals.positiveFeedback + totals.negativeFeedback)),
      tone: "good" as const,
    },
  ];

  return (
    <section>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title="Intent traffic"
        subtitle={`What ${fmt(totals.traffic)} conversations${
          data.period ? ` (${data.period})` : ""
        } actually asked for — and how well the agent handled each topic. Tap a category to drill into its intents.`}
      />

      {/* KPI header */}
      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-boost-border bg-white px-3.5 py-3 shadow-sm"
            data-testid={`intent-kpi-${k.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div
              className={`text-xl font-bold tabular-nums leading-none ${toneText(k.tone)}`}
            >
              {k.value}
            </div>
            <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-boost-muted">
              {k.label}
            </div>
          </div>
        ))}
      </div>

      <Legend />

      {/* Root list */}
      <div
        ref={ref}
        className={`mt-4 space-y-2 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {data.roots.map((root) => (
          <RootRow
            key={root.root}
            root={root}
            maxTraffic={maxRootTraffic}
            totalTraffic={totals.traffic}
            overallAuto={overallAuto}
            open={openRoot === root.root}
            onToggle={() =>
              setOpenRoot((cur) => (cur === root.root ? null : root.root))
            }
          />
        ))}
      </div>

      <p className="mt-4 text-[11px] text-boost-muted">
        {fmt(data.intentCount)} intents across {data.roots.length} categories
        {data.source ? ` · ${data.source}` : ""}. Showing the top intents per
        category.
      </p>
    </section>
  );
}

/* ─── Root row ─────────────────────────────────────────────────── */

function RootRow({
  root,
  maxTraffic,
  totalTraffic,
  overallAuto,
  open,
  onToggle,
}: {
  root: IntentTrafficRoot;
  maxTraffic: number;
  totalTraffic: number;
  overallAuto: number;
  open: boolean;
  onToggle: () => void;
}) {
  const flags = opportunityFlags(root, overallAuto, totalTraffic);
  return (
    <div className="rounded-xl border border-boost-border bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-3.5 py-3 text-left hover:bg-boost-surface/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-inset"
        data-testid={`intent-root-${root.root.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <span
          className={`flex-shrink-0 text-boost-muted transition-transform ${open ? "rotate-90" : ""}`}
          aria-hidden="true"
        >
          ▸
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[13px] font-semibold text-boost-dark truncate">
              {root.root}
            </span>
            <span className="flex-shrink-0 text-[11px] tabular-nums text-boost-muted">
              {fmt(root.traffic)}{" "}
              <span className="text-boost-lavender">
                ({pc(pct(root.traffic, totalTraffic))})
              </span>
            </span>
          </div>
          <div className="mt-1.5">
            <SplitBar stats={root} widthPct={(root.traffic / maxTraffic) * 100} />
          </div>
          {flags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {flags.map((f) => (
                <FlagChip key={f.kind} flag={f} />
              ))}
            </div>
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-boost-border/60 bg-boost-surface/30 px-3.5 py-3 space-y-2 animate-modal-in">
          {root.topIntents.map((it) => (
            <IntentRow
              key={it.intent}
              intent={it}
              rootTraffic={root.traffic}
              overallAuto={overallAuto}
              totalTraffic={totalTraffic}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function IntentRow({
  intent,
  rootTraffic,
  overallAuto,
  totalTraffic,
}: {
  intent: IntentTrafficIntent;
  rootTraffic: number;
  overallAuto: number;
  totalTraffic: number;
}) {
  const flags = opportunityFlags(intent, overallAuto, totalTraffic);
  return (
    <div data-testid={`intent-${intent.intent.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[12px] text-boost-dark truncate">{intent.intent}</span>
        <span className="flex-shrink-0 text-[10px] tabular-nums text-boost-muted">
          {fmt(intent.traffic)}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <SplitBar
          stats={intent}
          widthPct={rootTraffic > 0 ? (intent.traffic / rootTraffic) * 100 : 0}
          thin
        />
      </div>
      {flags.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {flags.map((f) => (
            <FlagChip key={f.kind} flag={f} small />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Stacked split bar (automated / escalated / unsolved) ──────── */

function SplitBar({
  stats,
  widthPct,
  thin,
}: {
  stats: IntentTrafficStats;
  widthPct: number;
  thin?: boolean;
}) {
  const split = reviewSplit(stats);
  const h = thin ? "h-1.5" : "h-2.5";
  return (
    <div className="flex items-center gap-2">
      <div
        className={`relative ${h} rounded-full bg-boost-surface overflow-hidden`}
        style={{ width: `${Math.max(widthPct, 6)}%`, minWidth: 56 }}
        title={`Automated ${pc(split.automated)} · Escalated ${pc(
          split.escalated,
        )} · Unsolved ${pc(split.unsolved)}`}
      >
        <div className="absolute inset-y-0 left-0 flex w-full">
          <span
            className="h-full bg-boost-green-light"
            style={{ width: `${split.automated}%` }}
          />
          <span
            className="h-full bg-boost-gold"
            style={{ width: `${split.escalated}%` }}
          />
          <span
            className="h-full bg-boost-orange"
            style={{ width: `${split.unsolved}%` }}
          />
        </div>
      </div>
      {!thin && (
        <span className="text-[10px] tabular-nums text-boost-green font-semibold flex-shrink-0">
          {pc(split.automated)}
        </span>
      )}
    </div>
  );
}

function Legend() {
  const items = [
    { label: "Automated", cls: "bg-boost-green-light" },
    { label: "Escalated", cls: "bg-boost-gold" },
    { label: "Unsolved", cls: "bg-boost-orange" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${i.cls}`} aria-hidden="true" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-boost-muted">
            {i.label}
          </span>
        </span>
      ))}
      <span className="text-[10px] text-boost-lavender">share of reviewed conversations</span>
    </div>
  );
}

/* ─── Opportunity flags ────────────────────────────────────────── */

type Flag =
  | { kind: "automation"; label: string }
  | { kind: "training"; label: string };

/** Flag high-traffic + low-automation as automation opportunities,
 *  and high unsolved / no-prediction as training gaps. Thresholds are
 *  relative to the whole bot so they self-tune per customer. */
function opportunityFlags(
  s: IntentTrafficStats,
  overallAuto: number,
  totalTraffic: number,
): Flag[] {
  const flags: Flag[] = [];
  const split = reviewSplit(s);
  const trafficShare = pct(s.traffic, totalTraffic);
  const noPredShare = pct(s.noPrediction, s.traffic);

  // Material volume + automation meaningfully below the bot average.
  if (trafficShare >= 1 && split.automated < overallAuto - 8) {
    flags.push({ kind: "automation", label: "Automation opportunity" });
  }
  // High unsolved or the bot mostly fails to recognise the intent.
  if (s.reviewed >= 10 && (split.unsolved >= 35 || noPredShare >= 85)) {
    flags.push({ kind: "training", label: "Training gap" });
  }
  return flags;
}

function FlagChip({ flag, small }: { flag: Flag; small?: boolean }) {
  const tone =
    flag.kind === "automation"
      ? "border-boost-green-light/50 bg-boost-green-light/10 text-boost-green"
      : "border-boost-orange/50 bg-boost-orange/10 text-boost-orange";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-semibold uppercase tracking-[0.1em] ${tone} ${
        small ? "text-[8px]" : "text-[9px]"
      }`}
    >
      {flag.label}
    </span>
  );
}

function toneText(tone: "good" | "warn" | "bad" | "neutral"): string {
  switch (tone) {
    case "good":
      return "text-boost-green";
    case "warn":
      return "text-boost-gold";
    case "bad":
      return "text-boost-orange";
    default:
      return "text-boost-dark";
  }
}
