"use client";

/* ──────────────────────────────────────────────────────────────
 *  SuccessPlanSection — CE strategic Gantt.
 *
 *  Reads `customer.accepted_initiatives` (enriched with
 *  start_date / end_date / owner / theme / business_impact in PR 2,
 *  plus tasks / rag_status / notes added during the interactivity
 *  pass).
 *
 *  Interactivity:
 *    - Click a Gantt bar → opens InitiativeDetailModal
 *    - Optional filter row (collapsed by default) with theme +
 *      status chips — quiet on small plans, powerful on large ones
 *    - Backlog list below unchanged for undated items
 * ────────────────────────────────────────────────────────────── */

import { useMemo, useState } from "react";
import type { AcceptedInitiative, Customer, Recommendation } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import InitiativeDetailModal from "./success-plan/InitiativeDetailModal";

interface SuccessPlanSectionProps {
  customer?: Customer;
  sectionNumber?: string;
}

/** Theme → colour tokens. Kept to the design-system palette; no new
 *  colours invented. Unknown themes fall through to "neutral". */
export const THEME_STYLES: Record<string, { bar: string; stripe: string; text: string }> = {
  automation:  { bar: "bg-boost-green-light", stripe: "bg-boost-green",       text: "text-boost-green" },
  quality:     { bar: "bg-boost-gold",        stripe: "bg-boost-gold",        text: "text-boost-gold" },
  expansion:   { bar: "bg-boost-purple",      stripe: "bg-boost-purple",      text: "text-boost-purple" },
  adoption:    { bar: "bg-boost-lavender",    stripe: "bg-boost-lavender",    text: "text-boost-purple" },
  integration: { bar: "bg-boost-muted",       stripe: "bg-boost-muted",       text: "text-boost-muted" },
};
export const NEUTRAL_THEME = { bar: "bg-boost-muted", stripe: "bg-boost-muted", text: "text-boost-muted" };

export const STATUS_LABEL: Record<AcceptedInitiative["status"], string> = {
  proposed:      "Proposed",
  accepted:      "Accepted",
  "in-progress": "In progress",
  done:          "Done",
  dropped:       "Dropped",
};

/** Status values available as filter chips. "dropped" is hidden from
 *  the default filter row (can still show via "All") — dropped
 *  initiatives stay in the payload for history but are rarely what
 *  a BR conversation is about. */
const STATUS_FILTER_OPTIONS: AcceptedInitiative["status"][] = [
  "proposed",
  "accepted",
  "in-progress",
  "done",
];

/** Parse ISO → ms epoch. Returns NaN on bad input; caller decides
 *  how to handle. */
function parseISO(iso?: string): number {
  if (!iso) return NaN;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : NaN;
}

/** Format an ISO date to "Mon YYYY" for the timeline ruler. */
function fmtMonth(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

/** Find the recommendation whose title matches the initiative's
 *  title (case-insensitive substring match). Manual linking will
 *  replace this when we add explicit `linked_recommendation_id`. */
function findLinkedRecommendation(
  init: AcceptedInitiative,
  recs: Recommendation[] | undefined,
): Recommendation | undefined {
  if (!recs || !init.title) return undefined;
  const lower = init.title.toLowerCase();
  return recs.find((r) => {
    const rt = r.title.toLowerCase();
    return lower.includes(rt) || rt.includes(lower);
  });
}

export default function SuccessPlanSection({
  customer,
  sectionNumber,
}: SuccessPlanSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });

  // Interactivity state
  const [openInstanceId, setOpenInstanceId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [themeFilter, setThemeFilter] = useState<Set<string>>(new Set()); // empty = all
  const [statusFilter, setStatusFilter] = useState<Set<AcceptedInitiative["status"]>>(new Set());

  const initiatives = customer?.accepted_initiatives ?? [];

  // Collect the theme + status values actually present in the
  // plan — only render chips for themes that exist.
  const { themesInPlan } = useMemo(() => {
    const themes = new Set<string>();
    for (const i of initiatives) {
      if (i.theme) themes.add(i.theme);
    }
    return { themesInPlan: Array.from(themes) };
  }, [initiatives]);

  // Filter applied to all initiatives (dated + undated). Empty
  // filter sets mean "show all".
  const filtered = useMemo(() => {
    return initiatives.filter((i) => {
      if (themeFilter.size > 0 && (!i.theme || !themeFilter.has(i.theme))) return false;
      if (statusFilter.size > 0 && !statusFilter.has(i.status)) return false;
      return true;
    });
  }, [initiatives, themeFilter, statusFilter]);

  const dated = filtered.filter(
    (i) => !Number.isNaN(parseISO(i.start_date)) && !Number.isNaN(parseISO(i.end_date)),
  );
  const undated = filtered.filter((i) => !dated.includes(i));

  // Find the open initiative for modal rendering
  const openInit = openInstanceId
    ? initiatives.find((i) => i.initiative_id === openInstanceId) ?? null
    : null;
  const linkedRec = openInit
    ? findLinkedRecommendation(openInit, customer?.recommendations)
    : undefined;

  if (initiatives.length === 0) {
    return (
      <section>
        <SectionHeader
          number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
          title="Success plan"
          subtitle="No initiatives captured yet. Accept recommendations or add custom initiatives in admin to render this section."
        />
      </section>
    );
  }

  // Timeline window: smallest start_date → largest end_date across
  // dated initiatives. Fallback to current quarter when there are no
  // dated entries at all (undated-only edge case).
  const starts = dated.map((i) => parseISO(i.start_date));
  const ends = dated.map((i) => parseISO(i.end_date));
  const min = dated.length > 0 ? Math.min(...starts) : Date.now();
  const max = dated.length > 0 ? Math.max(...ends) : Date.now() + 90 * 86400000;
  const span = Math.max(max - min, 1);

  /** Convert a ms timestamp to percent-of-timeline for positioning. */
  const pct = (ms: number) => `${((ms - min) / span) * 100}%`;

  // Generate monthly ruler ticks between min and max.
  const ticks: number[] = [];
  const minDate = new Date(min);
  const maxDate = new Date(max);
  const cur = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  while (cur.getTime() <= maxDate.getTime()) {
    ticks.push(cur.getTime());
    cur.setMonth(cur.getMonth() + 1);
    if (ticks.length > 24) break;
  }

  const toggleTheme = (t: string) => {
    setThemeFilter((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };
  const toggleStatus = (s: AcceptedInitiative["status"]) => {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };
  const clearAllFilters = () => {
    setThemeFilter(new Set());
    setStatusFilter(new Set());
  };
  const hasActiveFilter = themeFilter.size > 0 || statusFilter.size > 0;

  return (
    <section>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title="Success plan"
        subtitle="Initiatives the CSM + customer have committed to, ordered by start date. Click a bar for full detail."
      />

      {/* Filter row — collapsed by default, kept quiet for small plans */}
      <div className="mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted hover:text-boost-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 rounded-sm px-1"
            aria-expanded={filtersOpen}
          >
            <span aria-hidden="true" className="text-xs">{filtersOpen ? "▾" : "▸"}</span>
            Filter
            {hasActiveFilter && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-boost-green-light text-white text-[10px] font-semibold">
                {themeFilter.size + statusFilter.size}
              </span>
            )}
          </button>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted/70 hover:text-boost-dark transition-colors"
            >
              Clear
            </button>
          )}
          <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted tabular-nums">
            {filtered.length}{filtered.length !== initiatives.length && ` / ${initiatives.length}`} initiatives
          </span>
        </div>

        {filtersOpen && (
          <div className="mt-3 space-y-3 rounded-xl border border-boost-border bg-boost-surface/40 p-3">
            {themesInPlan.length > 0 && (
              <FilterChipRow
                label="Theme"
                options={themesInPlan.map((t) => ({
                  key: t,
                  label: t.charAt(0).toUpperCase() + t.slice(1),
                  tone: THEME_STYLES[t]?.bar ?? NEUTRAL_THEME.bar,
                  active: themeFilter.has(t),
                  onToggle: () => toggleTheme(t),
                }))}
              />
            )}
            <FilterChipRow
              label="Status"
              options={STATUS_FILTER_OPTIONS.map((s) => ({
                key: s,
                label: STATUS_LABEL[s],
                active: statusFilter.has(s),
                onToggle: () => toggleStatus(s),
              }))}
            />
          </div>
        )}
      </div>

      <div
        ref={ref}
        className={`space-y-6 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Dated initiatives — render as swim-lane Gantt rows */}
        {dated.length > 0 && (
          <div className="rounded-xl border border-boost-border bg-white shadow-sm overflow-hidden">
            {/* Ruler header — monthly tick marks */}
            <div className="relative bg-boost-surface/50 border-b border-boost-border px-4 sm:px-5 py-3">
              <div className="grid grid-cols-[180px_1fr] gap-3 items-center">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
                  Owner
                </span>
                <div className="relative h-4">
                  {ticks.map((t, i) => (
                    <span
                      key={i}
                      className="absolute top-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted -translate-x-1/2"
                      style={{ left: pct(t) }}
                    >
                      {fmtMonth(t)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <ol className="divide-y divide-boost-border">
              {dated
                .slice()
                .sort((a, b) => parseISO(a.start_date) - parseISO(b.start_date))
                .map((init, i) => {
                  const s = parseISO(init.start_date);
                  const e = parseISO(init.end_date);
                  const theme =
                    (init.theme && THEME_STYLES[init.theme]) || NEUTRAL_THEME;
                  return (
                    <li
                      key={init.initiative_id}
                      className="stagger-child grid grid-cols-[180px_1fr] gap-3 items-center px-4 sm:px-5 py-3"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-boost-dark truncate">
                          {init.owner || "—"}
                        </p>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mt-0.5">
                          {STATUS_LABEL[init.status]}
                        </p>
                      </div>
                      <div className="relative h-10">
                        {/* Rail */}
                        <div className="absolute inset-y-4 left-0 right-0 rounded-full bg-boost-surface" />
                        {/* Bar (now a button) */}
                        <button
                          type="button"
                          onClick={() => setOpenInstanceId(init.initiative_id)}
                          className={`absolute inset-y-1 rounded-full ${theme.bar} shadow-sm flex items-center px-3 overflow-hidden cursor-pointer hover:brightness-110 hover:shadow-md hover:inset-y-0 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-boost-green-light text-left`}
                          style={{
                            left: pct(s),
                            width: `calc(${pct(e)} - ${pct(s)})`,
                          }}
                          aria-label={`Open details for ${init.title || init.initiative_id}`}
                          data-testid={`initiative-${init.initiative_id}`}
                        >
                          <span className="text-[11px] font-semibold text-white truncate">
                            {init.title || init.initiative_id}
                          </span>
                        </button>
                      </div>
                    </li>
                  );
                })}
            </ol>
          </div>
        )}

        {/* Empty filter result */}
        {dated.length === 0 && undated.length === 0 && hasActiveFilter && (
          <div className="rounded-xl border border-dashed border-boost-border bg-boost-surface/30 p-6 text-center">
            <p className="text-sm text-boost-muted">
              No initiatives match the current filter.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-purple hover:text-boost-purple-dark"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Undated initiatives — backlog list */}
        {undated.length > 0 && (
          <div className="rounded-xl border border-dashed border-boost-border bg-boost-surface/30 p-4 sm:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-3">
              Backlog · no dates set
            </p>
            <ul className="space-y-2">
              {undated.map((init) => (
                <li key={init.initiative_id}>
                  <button
                    type="button"
                    onClick={() => setOpenInstanceId(init.initiative_id)}
                    className="w-full flex items-start gap-3 text-left text-xs text-boost-text-secondary hover:text-boost-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light rounded-sm"
                    data-testid={`initiative-${init.initiative_id}`}
                  >
                    <span
                      aria-hidden="true"
                      className="w-1 h-1 rounded-full bg-boost-muted mt-1.5 flex-shrink-0"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="font-semibold text-boost-dark">
                        {init.title || init.initiative_id}
                      </span>
                      {init.business_impact && (
                        <span className="text-boost-muted"> — {init.business_impact}</span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Impact strip — titles + impact below the Gantt so the story
            isn't just a wall of bars */}
        {dated.length > 0 && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {dated.map((init) => {
              const theme =
                (init.theme && THEME_STYLES[init.theme]) || NEUTRAL_THEME;
              return (
                <li key={`impact-${init.initiative_id}`}>
                  <button
                    type="button"
                    onClick={() => setOpenInstanceId(init.initiative_id)}
                    className="w-full text-left relative rounded-xl border border-boost-border bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2"
                    data-testid={`initiative-${init.initiative_id}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 top-0 bottom-0 w-1 ${theme.stripe}`}
                    />
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${theme.text} mb-1`}>
                      {init.theme || "initiative"}
                    </p>
                    <p className="text-sm font-semibold text-boost-dark leading-snug">
                      {init.title || init.initiative_id}
                    </p>
                    {init.business_impact && (
                      <p className="text-xs text-boost-muted mt-2 leading-relaxed">
                        {init.business_impact}
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Modal */}
      {openInit && (
        <InitiativeDetailModal
          initiative={openInit}
          linkedRecommendation={linkedRec}
          onClose={() => setOpenInstanceId(null)}
        />
      )}
    </section>
  );
}

/* ─── Filter chip row — small helper ────────────────────────── */

interface FilterChipOption {
  key: string;
  label: string;
  active: boolean;
  onToggle: () => void;
  /** Optional accent colour for a leading dot. */
  tone?: string;
}

function FilterChipRow({ label, options }: { label: string; options: FilterChipOption[] }) {
  return (
    <div className="flex items-start gap-3 flex-wrap">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted w-14 pt-1 flex-shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
        {options.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={opt.onToggle}
            aria-pressed={opt.active}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-[0.14em] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-1 ${
              opt.active
                ? "bg-boost-purple text-white border-boost-purple"
                : "bg-white text-boost-muted border-boost-border hover:border-boost-muted hover:text-boost-dark"
            }`}
          >
            {opt.tone && (
              <span
                aria-hidden="true"
                className={`w-2 h-2 rounded-full ${opt.tone} ${opt.active ? "opacity-100" : ""}`}
              />
            )}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
