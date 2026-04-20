"use client";

/* ──────────────────────────────────────────────────────────────
 *  BenchmarkingSection — CE peer / industry comparison.
 *
 *  Reads `customer.benchmarks` (Record<metric_key, BenchmarkEntry>)
 *  and `customer.performance` (for the customer's own value). For
 *  each metric, renders one horizontal triple-bar row: this
 *  customer, peer cohort avg, industry avg. Pure CSS bars, zero
 *  chart-library dependency.
 *
 *  Interactivity:
 *    - View toggle: "Absolute" (default — raw values) and "Delta vs
 *      peer" (customer value relative to peer avg; peer sits at 0)
 *    - Click any row → opens BenchmarkDetailModal with definition,
 *      interpretation, percentile, peer cohort description
 *    - Hover any bar → native tooltip with the exact value
 *    - `data-testid` on each row so Pac-Man captures a stable key
 * ────────────────────────────────────────────────────────────── */

import { useState } from "react";
import type { BenchmarkEntry, Customer, PerformanceMetrics } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import BenchmarkDetailModal from "./benchmarking/BenchmarkDetailModal";

interface BenchmarkingSectionProps {
  customer?: Customer;
  sectionNumber?: string;
}

/** Display labels for the subset of PerformanceMetrics keys we know
 *  how to render. Benchmarks authored with other keys fall back to
 *  the entry's `label` field or the raw key. */
const METRIC_LABELS: Partial<Record<keyof PerformanceMetrics, string>> = {
  automation_rate: "Automation %",
  csat_score: "CSAT score",
  unknown_rate: "Unknown %",
  escalation_rate: "Escalation %",
  monthly_conversations: "Monthly conversations",
  markets_live: "Markets live",
  active_agents: "Active agents",
};

/** Unit suffix shown to the right of each numeric value. */
const METRIC_UNITS: Partial<Record<keyof PerformanceMetrics, string>> = {
  automation_rate: "%",
  csat_score: "/ 5",
  unknown_rate: "%",
  escalation_rate: "%",
};

/** Lower is better for these — drives the semantic tone of the
 *  delta chip in the detail modal. */
const LOWER_IS_BETTER: Partial<Record<keyof PerformanceMetrics, boolean>> = {
  unknown_rate: true,
  escalation_rate: true,
};

interface Row {
  key: string;
  label: string;
  unit: string;
  customerValue?: number;
  peerAvg?: number;
  industryAvg?: number;
  entry: BenchmarkEntry;
  lowerIsBetter?: boolean;
}

function buildRows(customer: Customer | undefined): Row[] {
  const bench = customer?.benchmarks ?? {};
  const perf = customer?.performance ?? {};
  return Object.entries(bench).map(([key, entry]) => {
    const k = key as keyof PerformanceMetrics;
    const perfVal = perf[k];
    const e = entry as BenchmarkEntry;
    return {
      key,
      label: METRIC_LABELS[k] ?? e.label ?? key,
      unit: METRIC_UNITS[k] ?? "",
      customerValue: typeof perfVal === "number" ? perfVal : undefined,
      peerAvg: e.peer_avg,
      industryAvg: e.industry_avg,
      entry: e,
      lowerIsBetter: LOWER_IS_BETTER[k],
    };
  });
}

type ViewMode = "absolute" | "delta";

export default function BenchmarkingSection({
  customer,
  sectionNumber,
}: BenchmarkingSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [viewMode, setViewMode] = useState<ViewMode>("absolute");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const rows = buildRows(customer);
  const openRow = openKey ? rows.find((r) => r.key === openKey) : null;

  if (rows.length === 0) {
    return (
      <section>
        <SectionHeader
          number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
          title="Benchmarking"
          subtitle="No peer or industry benchmarks captured yet."
        />
      </section>
    );
  }

  return (
    <section>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title="Benchmarking"
        subtitle="Your performance vs. peer cohort and industry averages. Click a row for methodology + interpretation."
      />

      {/* Top bar: legend on the left, view toggle on the right */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="w-3 h-3 rounded-sm bg-boost-green-light" />
            This customer
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="w-3 h-3 rounded-sm bg-boost-purple" />
            Peer cohort avg
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="w-3 h-3 rounded-sm bg-boost-muted/60" />
            Industry avg
          </span>
        </div>
        <div
          role="tablist"
          aria-label="Benchmark view mode"
          className="inline-flex rounded-lg border border-boost-border bg-white p-0.5"
        >
          {(["absolute", "delta"] as const).map((mode) => {
            const active = viewMode === mode;
            return (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-1 ${
                  active
                    ? "bg-boost-purple text-white"
                    : "bg-transparent text-boost-muted hover:text-boost-dark"
                }`}
              >
                {mode === "absolute" ? "Absolute" : "Δ vs peer"}
              </button>
            );
          })}
        </div>
      </div>

      <div
        ref={ref}
        className={`rounded-xl border border-boost-border bg-white shadow-sm divide-y divide-boost-border transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {rows.map((row, i) => (
          <BenchmarkRow
            key={row.key}
            row={row}
            viewMode={viewMode}
            index={i}
            onClick={() => setOpenKey(row.key)}
          />
        ))}
      </div>

      {openRow && (
        <BenchmarkDetailModal
          metricKey={openRow.key}
          label={openRow.label}
          unit={openRow.unit}
          entry={openRow.entry}
          customerValue={openRow.customerValue}
          lowerIsBetter={openRow.lowerIsBetter}
          onClose={() => setOpenKey(null)}
        />
      )}
    </section>
  );
}

/* ─── Row ──────────────────────────────────────────────── */

function BenchmarkRow({
  row,
  viewMode,
  index,
  onClick,
}: {
  row: Row;
  viewMode: ViewMode;
  index: number;
  onClick: () => void;
}) {
  // Absolute view — all three bars relative to the row max.
  // Delta view — peer sits at center; customer + industry swing
  // left (negative) or right (positive) from peer.
  const absRowMax = Math.max(
    ...[row.customerValue, row.peerAvg, row.industryAvg].filter(
      (v): v is number => typeof v === "number",
    ),
    1,
  );

  const customerDelta =
    typeof row.customerValue === "number" && typeof row.peerAvg === "number"
      ? row.customerValue - row.peerAvg
      : null;
  const industryDelta =
    typeof row.industryAvg === "number" && typeof row.peerAvg === "number"
      ? row.industryAvg - row.peerAvg
      : null;
  const deltaAbsMax = Math.max(
    Math.abs(customerDelta ?? 0),
    Math.abs(industryDelta ?? 0),
    1,
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className="stagger-child w-full px-4 sm:px-5 py-4 text-left hover:bg-boost-surface/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-inset"
      style={{ animationDelay: `${index * 50}ms` }}
      aria-label={`Open benchmark detail for ${row.label}`}
      data-testid={`benchmark-row-${row.key}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-sm font-semibold text-boost-dark">{row.label}</p>
        {typeof row.entry.percentile === "number" && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-[0.14em] bg-boost-green-light/15 text-boost-green">
            P{row.entry.percentile}
          </span>
        )}
      </div>

      {viewMode === "absolute" ? (
        <div className="space-y-1.5">
          <AbsoluteBar
            label="This customer"
            color="bg-boost-green-light"
            value={row.customerValue}
            unit={row.unit}
            rowMax={absRowMax}
            emphasised
          />
          <AbsoluteBar
            label="Peer cohort"
            color="bg-boost-purple"
            value={row.peerAvg}
            unit={row.unit}
            rowMax={absRowMax}
          />
          <AbsoluteBar
            label="Industry"
            color="bg-boost-muted/60"
            value={row.industryAvg}
            unit={row.unit}
            rowMax={absRowMax}
          />
        </div>
      ) : (
        <DeltaView
          customerDelta={customerDelta}
          industryDelta={industryDelta}
          unit={row.unit}
          deltaMax={deltaAbsMax}
          lowerIsBetter={!!row.lowerIsBetter}
        />
      )}
    </button>
  );
}

/* ─── Absolute bar ───────────────────────────────────────── */

function AbsoluteBar({
  label,
  color,
  value,
  unit,
  rowMax,
  emphasised,
}: {
  label: string;
  color: string;
  value: number | undefined;
  unit: string;
  rowMax: number;
  emphasised?: boolean;
}) {
  const hasValue = typeof value === "number";
  const width = hasValue ? Math.min(100, Math.max(0, (value / rowMax) * 100)) : 0;
  return (
    <div className="grid grid-cols-[100px_1fr_auto] items-center gap-3">
      <span
        className={`text-[10px] font-semibold uppercase tracking-[0.14em] truncate ${
          emphasised ? "text-boost-dark" : "text-boost-muted"
        }`}
      >
        {label}
      </span>
      <div className="relative h-3 rounded-full bg-boost-surface overflow-hidden">
        {hasValue && (
          <div
            className={`absolute inset-y-0 left-0 rounded-full ${color} transition-all duration-700`}
            style={{ width: `${width}%` }}
            title={`${label}: ${value}${unit}`}
          />
        )}
      </div>
      <span
        className={`text-xs tabular-nums ${
          emphasised ? "font-semibold text-boost-dark" : "text-boost-muted"
        }`}
      >
        {hasValue ? `${value}${unit}` : "—"}
      </span>
    </div>
  );
}

/* ─── Delta view (peer-centred) ─────────────────────────── */

function DeltaView({
  customerDelta,
  industryDelta,
  unit,
  deltaMax,
  lowerIsBetter,
}: {
  customerDelta: number | null;
  industryDelta: number | null;
  unit: string;
  deltaMax: number;
  lowerIsBetter: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <DeltaBar
        label="This customer"
        value={customerDelta}
        unit={unit}
        deltaMax={deltaMax}
        lowerIsBetter={lowerIsBetter}
        emphasised
      />
      {/* Peer reference row — always 0 by definition, kept for alignment and legend clarity */}
      <div className="grid grid-cols-[100px_1fr_auto] items-center gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted truncate">
          Peer cohort
        </span>
        <div className="relative h-3 rounded-full bg-boost-surface overflow-hidden">
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-1/2 w-px bg-boost-purple"
          />
        </div>
        <span className="text-xs tabular-nums text-boost-muted">baseline</span>
      </div>
      <DeltaBar
        label="Industry"
        value={industryDelta}
        unit={unit}
        deltaMax={deltaMax}
        lowerIsBetter={lowerIsBetter}
      />
    </div>
  );
}

function DeltaBar({
  label,
  value,
  unit,
  deltaMax,
  lowerIsBetter,
  emphasised,
}: {
  label: string;
  value: number | null;
  unit: string;
  deltaMax: number;
  lowerIsBetter: boolean;
  emphasised?: boolean;
}) {
  const hasValue = typeof value === "number";
  // Map delta ∈ [-deltaMax, +deltaMax] to width ∈ [0, 50]% starting
  // from the 50% centreline. Positive → right; negative → left.
  const absPct = hasValue ? Math.min(50, (Math.abs(value) / deltaMax) * 50) : 0;
  const positive = hasValue && value > 0;
  const isWin = hasValue ? (lowerIsBetter ? !positive : positive) : false;
  const color = isWin ? "bg-boost-green-light" : "bg-boost-gold";
  const sign = hasValue && value !== 0 ? (value > 0 ? "+" : "−") : "";
  const formatted = hasValue
    ? `${sign}${Math.abs(value).toFixed(value % 1 === 0 ? 0 : 1)}${unit}`
    : "—";

  return (
    <div className="grid grid-cols-[100px_1fr_auto] items-center gap-3">
      <span
        className={`text-[10px] font-semibold uppercase tracking-[0.14em] truncate ${
          emphasised ? "text-boost-dark" : "text-boost-muted"
        }`}
      >
        {label}
      </span>
      <div className="relative h-3 rounded-full bg-boost-surface overflow-hidden">
        {/* Centre line (peer baseline) */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-1/2 w-px bg-boost-purple"
        />
        {hasValue && value !== 0 && (
          <div
            className={`absolute inset-y-0 rounded-full ${color} transition-all duration-700`}
            style={{
              left: positive ? "50%" : `${50 - absPct}%`,
              width: `${absPct}%`,
            }}
            title={`${label}: ${formatted} vs peer`}
          />
        )}
      </div>
      <span
        className={`text-xs tabular-nums ${
          emphasised ? "font-semibold text-boost-dark" : "text-boost-muted"
        }`}
      >
        {formatted}
      </span>
    </div>
  );
}
