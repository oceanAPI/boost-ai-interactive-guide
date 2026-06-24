"use client";

/* ──────────────────────────────────────────────────────────────
 *  DetectedIssuesSection — the CS Decision Engine, surfaced.
 *
 *  Runs the ported engine (src/lib/cs-engine) against whatever the
 *  customer record already holds: the CE `performance` telemetry and
 *  the parsed intent-traffic rollup are mapped to the engine's metric
 *  inputs (src/lib/cs-engine/metrics), issues are detected (severity
 *  0–1), and the 267 initiatives are ranked by priority — respecting
 *  prerequisite chains and the company/instance hierarchy boost.
 *
 *  Renders three blocks:
 *    1. Health signals — detected issues, severity-descending.
 *    2. Prioritised next moves — the top actionable initiatives.
 *    3. Missing data — the key metrics we couldn't read, so the CSM
 *       knows exactly what to fill in to unlock more of the engine.
 *
 *  Everything is derived at render; nothing engine-specific is
 *  persisted on the Customer record (the backend phase will cache it).
 * ────────────────────────────────────────────────────────────── */

import { useMemo } from "react";
import type { Customer } from "@/lib/types";
import { runEngine } from "@/lib/cs-engine";
import { metricsFromCustomer } from "@/lib/cs-engine/metrics";
import SectionHeader from "@/components/ui/SectionHeader";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface DetectedIssuesSectionProps {
  customer?: Customer;
  sectionNumber?: string;
}

/** Key metrics the CSM is most likely to want filled, with where to set them. */
const KEY_METRICS: { field: string; label: string; where: string }[] = [
  { field: "automationRate", label: "Automation rate", where: "Performance or Intent Traffic" },
  { field: "unsolvedRate", label: "Unsolved rate", where: "Intent Traffic" },
  { field: "unknownRate", label: "Unknown / no-prediction rate", where: "Performance or Intent Traffic" },
  { field: "csatScore", label: "CSAT score", where: "Performance" },
  { field: "conversationVolume", label: "Monthly conversation volume", where: "Performance" },
];

function sevTone(severity: number): { label: string; bar: string; chip: string } {
  if (severity >= 0.6) return { label: "High", bar: "bg-boost-orange", chip: "bg-boost-orange/10 text-boost-orange" };
  if (severity >= 0.3) return { label: "Medium", bar: "bg-boost-gold", chip: "bg-boost-gold/10 text-boost-gold" };
  return { label: "Low", bar: "bg-boost-green-light", chip: "bg-boost-green-light/10 text-boost-green" };
}

const effortTone: Record<string, string> = {
  Low: "bg-boost-green-light/10 text-boost-green",
  Medium: "bg-boost-gold/10 text-boost-gold",
  High: "bg-boost-orange/10 text-boost-orange",
};

export default function DetectedIssuesSection({ customer, sectionNumber }: DetectedIssuesSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });

  const { result, mapped, hasAnyMetric } = useMemo(() => {
    if (!customer) return { result: null, mapped: null, hasAnyMetric: false };
    const mapped = metricsFromCustomer(customer);
    const hasAnyMetric = Object.keys(mapped.metricsSet).length > 0;
    const result = runEngine(mapped.metrics, {
      metricsSet: mapped.metricsSet,
      hierarchy: mapped.hierarchy,
    });
    return { result, mapped, hasAnyMetric };
  }, [customer]);

  if (!result || !mapped || !hasAnyMetric) {
    return (
      <section>
        <SectionHeader
          number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
          title="Detected issues & next moves"
          subtitle="Add performance metrics or upload the intent-traffic export in the builder, and the decision engine will surface prioritised issues and recommended initiatives here."
        />
      </section>
    );
  }

  const detected = result.detectedIssues;
  const top = result.topPriorities.slice(0, 8);
  const maxPriority = top[0]?.priority ?? 1;

  const missing = KEY_METRICS.filter((m) => mapped.metricsSet[m.field] !== true);

  return (
    <section ref={ref} className={`${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"} transition-all duration-500`}>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title="Detected issues & next moves"
        subtitle="What the decision engine reads from this customer's data — health signals it detected, and the highest-impact initiatives to act on next."
      />

      {/* Headline counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8" data-testid="engine-kpis">
        <Kpi label="Signals detected" value={String(detected.length)} tone="warn" />
        <Kpi label="Actionable moves" value={String(result.topPriorities.length)} tone="good" />
        <Kpi label="Initiatives scored" value={String(result.priorities.length)} tone="neutral" />
        <Kpi label="Metrics read" value={String(Object.keys(mapped.metricsSet).length)} tone="neutral" />
      </div>

      {/* 1 — Health signals */}
      {detected.length > 0 && (
        <div className="mb-8">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-boost-muted mb-3">
            Health signals
          </h3>
          <ul className="space-y-2">
            {detected.map((issue) => {
              const tone = sevTone(issue.severity);
              return (
                <li
                  key={issue.issueId}
                  data-testid={`engine-issue-${issue.issueId}`}
                  className="rounded-lg border border-boost-border bg-white p-3 sm:p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-boost-dark">{issue.issueName}</p>
                      {issue.reason && (
                        <p className="text-xs text-boost-muted mt-0.5 leading-relaxed">{issue.reason}</p>
                      )}
                    </div>
                    <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] rounded-full px-2 py-0.5 ${tone.chip}`}>
                      {tone.label}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-boost-surface overflow-hidden">
                    <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${Math.round(issue.severity * 100)}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 2 — Prioritised next moves */}
      {top.length > 0 && (
        <div className="mb-8">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-boost-muted mb-3">
            Prioritised next moves
          </h3>
          <ol className="space-y-2">
            {top.map((p) => (
              <li
                key={p.initiative.id}
                data-testid={`engine-initiative-${p.initiative.id}`}
                className="rounded-lg border border-boost-border bg-white p-3 sm:p-4 flex items-start gap-3"
              >
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-boost-purple text-white text-xs font-bold grid place-items-center">
                  {p.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-boost-dark leading-snug">{p.initiative.name}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] rounded-full px-2 py-0.5 bg-boost-surface text-boost-muted">
                      {p.initiative.type}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] rounded-full px-2 py-0.5 ${effortTone[p.initiative.effortLevel] ?? "bg-boost-surface text-boost-muted"}`}>
                      {p.initiative.effortLevel} effort
                    </span>
                    {p.initiative.timelineWeeks != null && (
                      <span className="text-[10px] font-medium text-boost-muted">
                        ~{p.initiative.timelineWeeks}w
                      </span>
                    )}
                    <span className="text-[10px] font-medium text-boost-muted truncate">
                      · {p.initiative.relatedIssueName}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-boost-surface overflow-hidden">
                    <div className="h-full rounded-full bg-boost-green-light" style={{ width: `${Math.round((p.priority / maxPriority) * 100)}%` }} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 3 — Missing data */}
      {missing.length > 0 && (
        <div className="rounded-lg border border-dashed border-boost-border bg-boost-surface/50 p-4" data-testid="engine-missing-data">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-boost-muted mb-1">
            Fill these in to sharpen the engine
          </h3>
          <p className="text-xs text-boost-muted mb-3 leading-relaxed">
            These metrics weren&apos;t available, so the issues that depend on them were skipped. Add them in the builder — or skip any you don&apos;t track.
          </p>
          <ul className="space-y-1.5">
            {missing.map((m) => (
              <li key={m.field} className="flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-boost-dark">{m.label}</span>
                <span className="text-boost-muted">{m.where}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone: "good" | "warn" | "bad" | "neutral" }) {
  const toneClass =
    tone === "good" ? "text-boost-green" : tone === "warn" ? "text-boost-gold" : tone === "bad" ? "text-boost-orange" : "text-boost-dark";
  return (
    <div className="rounded-lg border border-boost-border bg-white p-3">
      <p className={`text-xl sm:text-2xl font-bold ${toneClass}`}>{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-boost-muted mt-0.5">{label}</p>
    </div>
  );
}
