"use client";

/* ──────────────────────────────────────────────────────────────
 *  ProjectFramingSection — PS opener, 4 distinct visual tabs
 *
 *  Mirrors the caliber of ImpactSection and ScopeOfWorkSection:
 *  each tab uses a genuinely different visual metaphor, each
 *  animation is purposeful, every visible datum is drawn from
 *  the customer's captured fixture — never placeholders.
 *
 *    Tab 1 — Brief:     structured narrative + scope-at-a-glance panel
 *    Tab 2 — Criteria:  radial dial chart per KPI, SVG-drawn
 *    Tab 3 — Journey:   horizontal use-case node row with call-flow unfurl
 *    Tab 4 — Math:      traffic-mix donut + count-up volume tiles
 *
 *  Reads `customer.project_framing` + (where relevant) traffic_mix
 *  and projections from `customer.project_details`. Empty-state
 *  on first render; progressive disclosure per tab activation.
 * ────────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef, useMemo } from "react";
import type { Customer, PsKpi, PsUseCase } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";

interface ProjectFramingSectionProps {
  customer?: Customer;
  sectionNumber?: string;
}

type TabId = "brief" | "criteria" | "journey" | "math";
const TABS: { id: TabId; label: string }[] = [
  { id: "brief", label: "The brief" },
  { id: "criteria", label: "Success criteria" },
  { id: "journey", label: "The journey" },
  { id: "math", label: "The math" },
];

/* Reset animation state when a tab becomes active. Same pattern as
 * ImpactSection / ScopeOfWorkSection — lets each tab animate in
 * fresh every time it's visited. */
function useTabActivation(active: boolean) {
  const [ready, setReady] = useState(false);
  const prevRef = useRef(false);
  useEffect(() => {
    // NOTE: prevRef is intentionally only updated in the fall-through
    // branch. If it were also set inside the activation branch, React
    // Strict Mode's synthetic cleanup-and-rerun would leave prevRef
    // stuck at true after the first timeout was cleared, so the
    // second run would skip the branch and never re-schedule → ready
    // never flips true. Mirrors ImpactSection's known-good pattern.
    if (active && !prevRef.current) {
      setReady(false);
      const t = setTimeout(() => setReady(true), 80);
      return () => clearTimeout(t);
    }
    prevRef.current = active;
  }, [active]);
  return ready;
}

/* ═══════════════════════════════════════════════════════════════════
 *  TAB 1 — The brief
 *
 *  Two-column layout. Left: structured narrative (eyebrow + intro +
 *  goals). Right: "scope at a glance" panel with target markets /
 *  languages / channels / timeline, drawn from captured fixture data.
 * ═══════════════════════════════════════════════════════════════════ */

function BriefTab({
  introduction,
  goals,
  languages,
  channels,
  hosting,
  genaiProvider,
  targetMarkets,
  active,
}: {
  introduction?: string;
  goals?: string;
  languages?: string[];
  channels?: string[];
  hosting?: string;
  genaiProvider?: string;
  targetMarkets?: Array<{ code: string; name: string }>;
  active: boolean;
}) {
  const ready = useTabActivation(active);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 py-4">
      {/* Narrative — 3/5 on desktop */}
      <div className="lg:col-span-3 space-y-5">
        {introduction && (
          <div
            className="transition-all"
            style={{
              opacity: ready ? 1 : 0,
              transform: ready ? "translateY(0)" : "translateY(8px)",
              transitionDuration: "560ms",
              transitionDelay: "120ms",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-boost-green mb-2">
              What we're building
            </p>
            <p className="text-base sm:text-lg leading-relaxed text-boost-dark">
              {introduction}
            </p>
          </div>
        )}
        {goals && (
          <div
            className="border-l-2 border-boost-purple pl-5 transition-all"
            style={{
              opacity: ready ? 1 : 0,
              transform: ready ? "translateY(0)" : "translateY(8px)",
              transitionDuration: "560ms",
              transitionDelay: "280ms",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-boost-purple mb-2">
              Success criteria
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-boost-dark/90">
              {goals}
            </p>
          </div>
        )}
      </div>

      {/* Scope-at-a-glance — 2/5 on desktop */}
      <aside
        className="lg:col-span-2 rounded-xl border border-boost-border bg-boost-surface/50 p-5 self-start transition-all"
        style={{
          opacity: ready ? 1 : 0,
          transform: ready ? "translateY(0)" : "translateY(8px)",
          transitionDuration: "640ms",
          transitionDelay: "360ms",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-boost-muted mb-4">
          Scope at a glance
        </p>

        {/* Target markets — the headline visual */}
        {targetMarkets && targetMarkets.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-boost-dark/80 mb-2.5">
              Target markets
            </p>
            <div className="grid grid-cols-2 gap-2">
              {targetMarkets.map((m, i) => (
                <div
                  key={m.code}
                  className="rounded-lg bg-white border border-boost-border px-3 py-2.5 transition-all"
                  style={{
                    opacity: ready ? 1 : 0,
                    transform: ready ? "scale(1)" : "scale(0.94)",
                    transitionDuration: "440ms",
                    transitionDelay: `${480 + i * 70}ms`,
                    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <p className="text-lg font-bold text-boost-purple tabular-nums leading-none">
                    {m.code}
                  </p>
                  <p className="text-[11px] text-boost-muted mt-1">{m.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stack of small facts */}
        <dl className="space-y-3 text-sm">
          {languages && languages.length > 0 && (
            <div className="flex items-start justify-between gap-3">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-boost-muted pt-0.5 flex-shrink-0">
                Languages
              </dt>
              <dd className="text-boost-dark text-right text-xs leading-snug">
                {languages.join(" · ")}
              </dd>
            </div>
          )}
          {channels && channels.length > 0 && (
            <div className="flex items-start justify-between gap-3">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-boost-muted pt-0.5 flex-shrink-0">
                Channels
              </dt>
              <dd className="text-boost-dark text-right text-xs leading-snug">
                {channels.join(" · ")}
              </dd>
            </div>
          )}
          {hosting && (
            <div className="flex items-start justify-between gap-3">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-boost-muted pt-0.5 flex-shrink-0">
                Hosting
              </dt>
              <dd className="text-boost-dark text-right text-xs leading-snug">
                {hosting}
              </dd>
            </div>
          )}
          {genaiProvider && (
            <div className="flex items-start justify-between gap-3">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-boost-muted pt-0.5 flex-shrink-0">
                GenAI
              </dt>
              <dd className="text-boost-dark text-right text-xs leading-snug">
                {genaiProvider}
              </dd>
            </div>
          )}
        </dl>
      </aside>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  TAB 2 — Success criteria (radial dial per KPI)
 *
 *  Each KPI renders as a radial SVG dial: muted ring behind, green
 *  arc filled to the "progress toward target" percentage, target
 *  value big at the centre. On activation the arc animates from
 *  0 → full with staggered delay per dial.
 *
 *  Below each dial: label + notes. Notes scale in with the arc.
 * ═══════════════════════════════════════════════════════════════════ */

/** Extract a 0–100 dial fill from a KPI target string. Looks for the
 *  first numeric value and, if followed by a "/" denominator, treats
 *  it as score/max. Otherwise treats as a raw percentage. Falls back
 *  to a conservative 70 if parsing fails. */
function dialPercentFromTarget(target: string): number {
  const m = target.match(/([\d.]+)(?:\s*\/\s*([\d.]+))?/);
  if (!m) return 70;
  const num = parseFloat(m[1]);
  const denom = m[2] ? parseFloat(m[2]) : undefined;
  if (denom && denom > 0) return Math.min(100, (num / denom) * 100);
  return Math.min(100, num);
}

/** Extract a short, centre-dial-friendly label from a longer target
 *  string. Keeps any "≥ "/"≤ " prefix, the number, an optional
 *  denominator, and an optional unit (%). Drops the rest. */
function shortFromTarget(target: string): string {
  const m = target.match(/([≥≤]\s*)?([\d.]+)(?:\s*\/\s*([\d.]+))?(\s*%)?/);
  if (!m) return target;
  const cmp = (m[1] ?? "").replace(/\s+/g, "");
  const unit = m[4] ?? "";
  const denom = m[3] ? `/${m[3]}` : "";
  return `${cmp ? cmp + " " : ""}${m[2]}${denom}${unit}`;
}

function KpiDial({ kpi, index, active }: { kpi: PsKpi; index: number; active: boolean }) {
  const ready = useTabActivation(active);
  const pct = dialPercentFromTarget(kpi.target);
  const short = useMemo(() => shortFromTarget(kpi.target), [kpi.target]);
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = ready ? c * (1 - pct / 100) : c;

  return (
    <div
      data-testid={`project-framing-kpi-${index}`}
      className="rounded-xl border border-boost-border bg-white p-4 sm:p-5 flex flex-col items-center text-center"
    >
      <div className="relative w-[140px] h-[140px]">
        <svg viewBox="0 0 140 140" className="-rotate-90 w-full h-full">
          {/* Background ring */}
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="var(--color-boost-border)"
            strokeWidth="8"
          />
          {/* Progress arc */}
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="var(--color-boost-green-light)"
            strokeWidth="8"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 1100ms cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: `${160 + index * 120}ms`,
            }}
          />
        </svg>
        {/* Centre value — short form only so it fits the circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
          <span
            className="text-2xl sm:text-[28px] font-bold text-boost-dark tabular-nums leading-none"
            style={{
              opacity: ready ? 1 : 0,
              transform: ready ? "scale(1)" : "scale(0.88)",
              transition: "opacity 520ms cubic-bezier(0.16,1,0.3,1), transform 520ms cubic-bezier(0.16,1,0.3,1)",
              transitionDelay: `${320 + index * 120}ms`,
            }}
          >
            {short}
          </span>
        </div>
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mt-4 mb-1">
        {kpi.label}
      </p>
      {/* Full target line — kept below the dial so the centre stays uncluttered */}
      <p
        className="text-xs text-boost-dark/80 font-medium leading-snug mb-1.5"
        style={{
          opacity: ready ? 1 : 0,
          transition: "opacity 520ms ease-out",
          transitionDelay: `${440 + index * 120}ms`,
        }}
      >
        {kpi.target}
      </p>
      {kpi.notes && (
        <p
          className="text-xs text-boost-muted/90 leading-relaxed"
          style={{
            opacity: ready ? 1 : 0,
            transition: "opacity 560ms ease-out",
            transitionDelay: `${560 + index * 120}ms`,
          }}
        >
          {kpi.notes}
        </p>
      )}
    </div>
  );
}

function CriteriaTab({ kpis, active }: { kpis: PsKpi[]; active: boolean }) {
  if (kpis.length === 0) {
    return (
      <div className="py-8 text-center text-boost-muted text-sm">
        No success criteria captured yet.
      </div>
    );
  }
  return (
    <div
      className={`grid gap-4 sm:gap-5 py-4 ${
        kpis.length === 1
          ? "grid-cols-1"
          : kpis.length === 2
          ? "grid-cols-1 sm:grid-cols-2"
          : kpis.length === 3
          ? "grid-cols-1 sm:grid-cols-3"
          : "grid-cols-2 lg:grid-cols-4"
      }`}
    >
      {kpis.map((kpi, i) => (
        <KpiDial key={`${kpi.label}-${i}`} kpi={kpi} index={i} active={active} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  TAB 3 — The journey (use-case nodes + call-flow unfurl)
 *
 *  Horizontal nav of use-case nodes (one per use-case). Click a node →
 *  unfurls a today-vs-tomorrow panel + the call-flow as a row of
 *  animated pills with arrows between them.
 * ═══════════════════════════════════════════════════════════════════ */

function parseCallFlow(raw?: string): string[] {
  if (!raw) return [];
  // Strip any leading "Intent: foo → " prefix then split on arrows
  const cleaned = raw.replace(/^intent[^:]*:/i, "").trim();
  return cleaned
    .split(/\s*(?:→|->|-->)\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function JourneyTab({
  useCases,
  active,
}: {
  useCases: PsUseCase[];
  active: boolean;
}) {
  const ready = useTabActivation(active);
  const [activeIdx, setActiveIdx] = useState(0);

  if (useCases.length === 0) {
    return (
      <div className="py-8 text-center text-boost-muted text-sm">
        No example use-cases captured yet.
      </div>
    );
  }

  const current = useCases[activeIdx];
  const steps = parseCallFlow(current?.call_flow);
  const slug = current?.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <div className="py-4 space-y-6">
      {/* Use-case node rail */}
      <nav
        className="relative flex items-stretch gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-1 transition-opacity"
        style={{
          opacity: ready ? 1 : 0,
          transitionDuration: "520ms",
          transitionDelay: "120ms",
        }}
        aria-label="Use-cases"
      >
        {useCases.map((uc, i) => {
          const isActive = i === activeIdx;
          const ucSlug = uc.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          return (
            <button
              key={`${ucSlug}-${i}`}
              type="button"
              onClick={() => setActiveIdx(i)}
              data-testid={`project-use-case-${ucSlug}`}
              className={`flex-1 min-w-[180px] text-left rounded-xl border px-4 py-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light ${
                isActive
                  ? "bg-boost-purple text-white border-boost-purple shadow-sm"
                  : "bg-white text-boost-dark border-boost-border hover:border-boost-purple/40 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className={`flex-shrink-0 w-6 h-6 rounded-full text-[11px] font-bold tabular-nums flex items-center justify-center ${
                    isActive ? "bg-white/15 text-white" : "bg-boost-purple/10 text-boost-purple"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-semibold leading-snug">{uc.title}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Active use-case detail — re-mounted via `key` so the inner
          transitions reset each time the user changes use-case. */}
      <div
        key={slug}
        className="rounded-xl border border-boost-border bg-white p-5 sm:p-6 space-y-5"
        style={{
          animation: "fadeIn 480ms cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {/* Today / tomorrow grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg bg-boost-surface/60 border border-boost-border p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
              Today
            </p>
            <p className="text-sm leading-relaxed text-boost-dark">{current.today}</p>
          </div>
          <div className="rounded-lg bg-white border border-boost-green-light/50 p-4 relative">
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 bottom-0 w-1 bg-boost-green-light rounded-l-lg"
            />
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-green mb-2">
              Tomorrow
            </p>
            <p className="text-sm leading-relaxed text-boost-dark">{current.tomorrow}</p>
          </div>
        </div>

        {/* Call-flow — pills connected by arrows */}
        {steps.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-3">
              Call flow
            </p>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
              {steps.map((step, i) => (
                <div key={`${slug}-step-${i}`} className="flex items-center gap-1.5">
                  <span
                    className="inline-flex items-center rounded-md border border-boost-border bg-boost-surface/60 px-2.5 py-1.5 font-mono text-[11px] text-boost-dark"
                    style={{
                      opacity: ready ? 1 : 0,
                      transform: ready ? "translateY(0)" : "translateY(4px)",
                      transition: "opacity 380ms cubic-bezier(0.16,1,0.3,1), transform 380ms cubic-bezier(0.16,1,0.3,1)",
                      transitionDelay: `${i * 60}ms`,
                    }}
                  >
                    {step}
                  </span>
                  {i < steps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="text-boost-muted/60 text-xs"
                      style={{
                        opacity: ready ? 1 : 0,
                        transition: "opacity 280ms ease-out",
                        transitionDelay: `${i * 60 + 120}ms`,
                      }}
                    >
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  TAB 4 — The math (traffic-mix donut + volume counters)
 *
 *  Left: SVG donut showing current traffic distribution (pre go-live).
 *  Hover a slice → highlights + shows the percentage. Right: three
 *  count-up tiles for monthly chat sessions / voice minutes / tokens.
 *  Paints the technical load the architecture has to support.
 * ═══════════════════════════════════════════════════════════════════ */

interface TrafficSlice {
  key: string;
  label: string;
  pct: number;
  color: string;
}

function TrafficDonut({ slices, active }: { slices: TrafficSlice[]; active: boolean }) {
  const ready = useTabActivation(active);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const total = slices.reduce((s, x) => s + x.pct, 0) || 100;
  const r = 52;
  const c = 2 * Math.PI * r;

  let cumulative = 0;
  const arcs = slices.map((sl) => {
    const frac = sl.pct / total;
    const length = c * frac;
    const gap = c - length;
    const rotation = (cumulative / total) * 360;
    cumulative += sl.pct;
    return { ...sl, length, gap, rotation };
  });

  const highlighted = hoverKey ? slices.find((s) => s.key === hoverKey) : null;

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="relative w-[200px] h-[200px]">
        <svg viewBox="0 0 140 140" className="w-full h-full">
          {/* Base ring for definition */}
          <circle cx="70" cy="70" r={r} fill="none" stroke="var(--color-boost-border)" strokeWidth="0.5" />
          {arcs.map((a, i) => (
            <circle
              key={a.key}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={a.color}
              strokeWidth={hoverKey === a.key ? "22" : "18"}
              strokeDasharray={`${ready ? a.length : 0} ${ready ? a.gap : c}`}
              transform={`rotate(${a.rotation - 90} 70 70)`}
              style={{
                transition: "stroke-dasharray 900ms cubic-bezier(0.16, 1, 0.3, 1), stroke-width 180ms ease",
                transitionDelay: `${120 + i * 80}ms`,
                cursor: "pointer",
              }}
              onMouseEnter={() => setHoverKey(a.key)}
              onMouseLeave={() => setHoverKey(null)}
            />
          ))}
        </svg>
        {/* Centre callout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {highlighted ? (
            <>
              <span className="text-2xl font-bold text-boost-dark tabular-nums">
                {highlighted.pct}%
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mt-0.5">
                {highlighted.label}
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
                Traffic mix
              </span>
              <span className="text-xs text-boost-muted mt-0.5">Pre go-live</span>
            </>
          )}
        </div>
      </div>
      {/* Legend */}
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs w-full max-w-[280px]">
        {slices.map((sl) => (
          <li
            key={sl.key}
            className="flex items-center gap-2"
            onMouseEnter={() => setHoverKey(sl.key)}
            onMouseLeave={() => setHoverKey(null)}
          >
            <span
              aria-hidden="true"
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: sl.color }}
            />
            <span className="text-boost-dark truncate">{sl.label}</span>
            <span className="ml-auto text-boost-muted tabular-nums">{sl.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function VolumeTile({
  label,
  value,
  suffix,
  index,
  active,
}: {
  label: string;
  value: number;
  suffix: string;
  index: number;
  active: boolean;
}) {
  const ready = useTabActivation(active);
  const counted = useCountUp({ target: value, duration: 1400, enabled: ready });
  // Compact + exact forms. Compact ("95M") is the big display that always
  // fits the tile; exact ("95,000,000") sits below as subtitle context so
  // the number is still verifiable at a glance.
  const compact = useMemo(() => {
    if (counted >= 1_000_000_000) return (counted / 1_000_000_000).toFixed(counted >= 10_000_000_000 ? 0 : 1).replace(/\.0$/, "") + "B";
    if (counted >= 1_000_000) return (counted / 1_000_000).toFixed(counted >= 10_000_000 ? 0 : 1).replace(/\.0$/, "") + "M";
    if (counted >= 10_000) return Math.round(counted / 1_000) + "K";
    return counted.toLocaleString();
  }, [counted]);
  const exact = useMemo(() => counted.toLocaleString(), [counted]);

  // Synthetic sparkline points — deterministic curve that hints at
  // a 12-month ramp (slow start, steep middle, plateau). Purely
  // decorative; not claimed to be a real trajectory.
  const ramp = useMemo(() => {
    const pts = 12;
    const arr: Array<[number, number]> = [];
    for (let i = 0; i < pts; i++) {
      const x = i / (pts - 1);
      const y = 1 - Math.pow(1 - x, 2.2); // ease-out curve
      arr.push([x * 100, 100 - y * 100]);
    }
    return arr;
  }, []);

  return (
    <article
      className="rounded-xl border border-boost-border bg-white p-5 transition-all"
      style={{
        opacity: ready ? 1 : 0,
        transform: ready ? "translateY(0)" : "translateY(10px)",
        transitionDuration: "560ms",
        transitionDelay: `${160 + index * 120}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl sm:text-3xl font-bold text-boost-dark tabular-nums leading-none">
        {compact}
      </p>
      <p className="text-[11px] text-boost-dark/70 mt-1 tabular-nums">
        {exact}
      </p>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-boost-muted mt-1">
        {suffix}
      </p>

      {/* Sparkline */}
      <svg viewBox="0 0 100 30" className="mt-4 w-full h-7" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={`spark-${label.replace(/\s+/g, "")}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-boost-green-light)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-boost-green-light)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={ramp.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="none"
          stroke="var(--color-boost-green-light)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 200,
            strokeDashoffset: ready ? 0 : 200,
            transition: "stroke-dashoffset 1200ms ease-out",
            transitionDelay: `${360 + index * 120}ms`,
          }}
        />
        <polygon
          points={`0,30 ${ramp.map(([x, y]) => `${x},${y}`).join(" ")} 100,30`}
          fill={`url(#spark-${label.replace(/\s+/g, "")})`}
          style={{
            opacity: ready ? 1 : 0,
            transition: "opacity 600ms ease-out",
            transitionDelay: `${560 + index * 120}ms`,
          }}
        />
      </svg>
      <p className="text-[10px] text-boost-muted/70 mt-1 uppercase tracking-[0.12em]">
        12-month ramp
      </p>
    </article>
  );
}

function MathTab({
  trafficSlices,
  monthlyChat,
  monthlyVoice,
  monthlyTokens,
  active,
}: {
  trafficSlices: TrafficSlice[];
  monthlyChat?: number;
  monthlyVoice?: number;
  monthlyTokens?: number;
  active: boolean;
}) {
  const tiles: Array<{ label: string; value: number; suffix: string }> = [];
  if (monthlyChat !== undefined) tiles.push({ label: "Monthly chat sessions", value: monthlyChat, suffix: "sessions · after 12 months" });
  if (monthlyVoice !== undefined) tiles.push({ label: "Monthly voice minutes", value: monthlyVoice, suffix: "minutes · after 12 months" });
  if (monthlyTokens !== undefined) tiles.push({ label: "Monthly token usage", value: monthlyTokens, suffix: "tokens · after 12 months" });

  const hasAnything = trafficSlices.length > 0 || tiles.length > 0;
  if (!hasAnything) {
    return (
      <div className="py-8 text-center text-boost-muted text-sm">
        No project details captured yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 py-4">
      {trafficSlices.length > 0 && (
        <div className="lg:col-span-2 rounded-xl border border-boost-border bg-white p-5">
          <TrafficDonut slices={trafficSlices} active={active} />
        </div>
      )}
      {tiles.length > 0 && (
        <div
          className={`lg:col-span-3 grid gap-3 sm:gap-4 ${
            tiles.length === 1
              ? "grid-cols-1"
              : tiles.length === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-3"
          }`}
        >
          {tiles.map((t, i) => (
            <VolumeTile
              key={t.label}
              label={t.label}
              value={t.value}
              suffix={t.suffix}
              index={i}
              active={active}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  Main export — derives the 4 tab inputs from the Customer record
 *  and wires the tab navigation.
 * ═══════════════════════════════════════════════════════════════════ */

const TRAFFIC_COLORS: Record<string, string> = {
  existing_chat: "#59195d", // boost-purple
  telephony: "#36b595", // boost-green-light
  email: "#c88a00", // boost-gold
  tickets: "#d16a3e", // boost-orange
  other: "#9b75a3", // boost-lavender
};

const TRAFFIC_LABELS: Record<string, string> = {
  existing_chat: "Existing chat",
  telephony: "Telephony",
  email: "Email",
  tickets: "Tickets",
  other: "Other",
};

const HOSTING_LABELS: Record<string, string> = {
  aws: "Cloud (AWS)",
  customer_on_prem: "Customer on-prem",
  boost_on_prem: "boost.ai on-prem",
};

const GENAI_PROVIDER_LABELS: Record<string, string> = {
  openai_boost: "OpenAI (boost.ai)",
  openai_own: "OpenAI (customer)",
  azure_boost: "Azure (boost.ai)",
  azure_own: "Azure (customer)",
};

/** Derive target-market chips from chat-channel URL hostnames. Looks
 *  for ISO-2 locale-like paths (e.g. /pl, /cz) and maps to a country
 *  name. Returns undefined if none detectable. */
function deriveTargetMarkets(customer: Customer | undefined): Array<{ code: string; name: string }> | undefined {
  const urls = customer?.build_scope?.chat_channels?.flatMap((c) => c.urls ?? []) ?? [];
  const set = new Map<string, string>();
  const NAMES: Record<string, string> = {
    pl: "Poland",
    cz: "Czechia",
    at: "Austria",
    nl: "Netherlands",
    se: "Sweden",
    no: "Norway",
    dk: "Denmark",
    fi: "Finland",
    uk: "United Kingdom",
    gb: "United Kingdom",
    de: "Germany",
    fr: "France",
    es: "Spain",
    it: "Italy",
    ie: "Ireland",
    be: "Belgium",
    pt: "Portugal",
  };
  for (const u of urls) {
    try {
      const url = new URL(u);
      const seg = url.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
      if (seg && /^[a-z]{2}$/.test(seg) && NAMES[seg]) {
        set.set(seg.toUpperCase(), NAMES[seg]);
      }
    } catch {
      // ignore invalid urls
    }
  }
  if (set.size === 0) return undefined;
  return Array.from(set.entries()).map(([code, name]) => ({ code, name }));
}

export default function ProjectFramingSection({
  customer,
  sectionNumber,
}: ProjectFramingSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [activeTab, setActiveTab] = useState<TabId>("brief");
  const framing = customer?.project_framing;
  const details = customer?.project_details;
  const scope = customer?.build_scope;

  const kpis = framing?.kpis ?? [];
  const useCases = framing?.use_cases ?? [];

  const trafficSlices: TrafficSlice[] = useMemo(() => {
    const mix = details?.traffic_mix;
    if (!mix) return [];
    const keys: Array<keyof typeof mix> = ["existing_chat", "telephony", "email", "tickets", "other"];
    return keys
      .filter((k) => typeof mix[k] === "number" && (mix[k] as number) > 0)
      .map((k) => ({
        key: k,
        label: TRAFFIC_LABELS[k] ?? k,
        pct: mix[k] as number,
        color: TRAFFIC_COLORS[k] ?? "#59195d",
      }));
  }, [details?.traffic_mix]);

  const targetMarkets = useMemo(() => deriveTargetMarkets(customer), [customer]);

  const channelLabels = scope?.chat_channels?.map((c) => c.label);
  const hostingLabel = scope?.hosting ? HOSTING_LABELS[scope.hosting] : undefined;
  const genaiProviderLabel =
    scope?.generative_ai?.enabled && scope.generative_ai.provider
      ? GENAI_PROVIDER_LABELS[scope.generative_ai.provider]
      : scope?.generative_ai?.enabled
      ? "Enabled"
      : undefined;

  const hasContent =
    !!framing?.introduction ||
    !!framing?.goals ||
    kpis.length > 0 ||
    useCases.length > 0 ||
    trafficSlices.length > 0 ||
    !!details?.projections;

  if (!hasContent) {
    return (
      <section>
        <SectionHeader
          number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
          title="Project framing"
          subtitle="No framing captured yet. Fill in introduction, goals, KPIs, and use-cases in admin to render this section."
        />
      </section>
    );
  }

  return (
    <section>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title="Project framing"
        subtitle="What we're solving, who wins when it lands, and the load we're building for."
      />

      <div
        ref={ref}
        data-testid="project-framing"
        className={`transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Tab nav */}
        <div className="border-b border-boost-border mb-2 flex items-center gap-1 overflow-x-auto scrollbar-hide" role="tablist">
          {TABS.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(t.id)}
                data-testid={`project-framing-tab-${t.id}`}
                className={`relative px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light rounded-t-md ${
                  isActive ? "text-boost-purple" : "text-boost-muted hover:text-boost-dark"
                }`}
              >
                {t.label}
                <span
                  aria-hidden="true"
                  className={`absolute left-3 right-3 -bottom-px h-0.5 rounded-t ${
                    isActive ? "bg-boost-purple" : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Tab panels */}
        <div role="tabpanel">
          {activeTab === "brief" && (
            <BriefTab
              introduction={framing?.introduction}
              goals={framing?.goals}
              languages={scope?.languages}
              channels={channelLabels}
              hosting={hostingLabel}
              genaiProvider={genaiProviderLabel}
              targetMarkets={targetMarkets}
              active={activeTab === "brief"}
            />
          )}
          {activeTab === "criteria" && <CriteriaTab kpis={kpis} active={activeTab === "criteria"} />}
          {activeTab === "journey" && <JourneyTab useCases={useCases} active={activeTab === "journey"} />}
          {activeTab === "math" && (
            <MathTab
              trafficSlices={trafficSlices}
              monthlyChat={details?.projections?.monthly_chat_sessions}
              monthlyVoice={details?.projections?.monthly_voice_minutes}
              monthlyTokens={details?.projections?.monthly_tokens}
              active={activeTab === "math"}
            />
          )}
        </div>
      </div>
    </section>
  );
}
