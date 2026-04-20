"use client";

/* ──────────────────────────────────────────────────────────────
 *  UatStatusSection — CE rollout health per agent / market.
 *
 *  Reads `customer.uat_status` (Array<UatStatusEntry>). Groups
 *  entries by agent_key, then renders each agent as a card with
 *  a header + per-market rows. Each row has a traffic-light dot
 *  (green / amber / red) + note + status pill.
 *
 *  Interactivity:
 *    - Status filter chips (green / amber / red) in a collapsed
 *      row — match the pattern used by Success Plan
 *    - Click a row → inline-expand a short status-history
 *      timeline (most recent first). Inline because history is
 *      short; a modal would be overkill per entry
 *    - `data-testid` on each row so Pac-Man feedback captures a
 *      stable key for paste-back
 * ────────────────────────────────────────────────────────────── */

import { useMemo, useState } from "react";
import type { Customer, UatStatusEntry } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface UatStatusSectionProps {
  customer?: Customer;
  sectionNumber?: string;
}

const STATUS_STYLE: Record<UatStatusEntry["status"], { dot: string; label: string; text: string }> = {
  green: { dot: "bg-boost-green-light", label: "Green",  text: "text-boost-green" },
  amber: { dot: "bg-boost-gold",        label: "Amber",  text: "text-boost-gold" },
  red:   { dot: "bg-boost-purple",      label: "Red",    text: "text-boost-purple" },
};

const STATUS_OPTIONS: UatStatusEntry["status"][] = ["green", "amber", "red"];

/** "order-status" → "Order status". */
function humanizeKey(key: string): string {
  const spaced = key.replace(/[-_]/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Format ISO → "Mar 15". Short form keeps the history timeline compact. */
function fmtShort(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Summary counts across all statuses — drives the headline row. */
function statusTotals(entries: UatStatusEntry[]): Record<UatStatusEntry["status"], number> {
  return entries.reduce(
    (acc, e) => {
      acc[e.status] = (acc[e.status] ?? 0) + 1;
      return acc;
    },
    { green: 0, amber: 0, red: 0 } as Record<UatStatusEntry["status"], number>,
  );
}

/** Stable testid for each row, derived from agent + market. */
function rowTestId(entry: UatStatusEntry): string {
  const market = entry.market ? entry.market.toLowerCase() : "all";
  return `uat-${entry.agent_key}-${market}`;
}

export default function UatStatusSection({
  customer,
  sectionNumber,
}: UatStatusSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const entries = customer?.uat_status ?? [];

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Set<UatStatusEntry["status"]>>(new Set());
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const totalsAll = useMemo(() => statusTotals(entries), [entries]);

  const filtered = useMemo(() => {
    if (statusFilter.size === 0) return entries;
    return entries.filter((e) => statusFilter.has(e.status));
  }, [entries, statusFilter]);

  if (entries.length === 0) {
    return (
      <section>
        <SectionHeader
          number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
          title="Rollout status"
          subtitle="No UAT status captured yet. Add per-agent status entries in admin to render this section."
        />
      </section>
    );
  }

  // Group filtered entries by agent_key
  const grouped = new Map<string, UatStatusEntry[]>();
  for (const e of filtered) {
    const list = grouped.get(e.agent_key) ?? [];
    list.push(e);
    grouped.set(e.agent_key, list);
  }

  const toggleStatus = (s: UatStatusEntry["status"]) => {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };
  const clearFilter = () => setStatusFilter(new Set());
  const hasActiveFilter = statusFilter.size > 0;

  const toggleRow = (id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  return (
    <section>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title="Rollout status"
        subtitle="Per-agent and per-market health. Click any row to see its status history."
      />

      {/* Totals strip — stays for the quick status glance */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {STATUS_OPTIONS.map((s) => {
          const st = STATUS_STYLE[s];
          return (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-boost-border text-[11px] font-semibold"
            >
              <span aria-hidden="true" className={`w-2 h-2 rounded-full ${st.dot}`} />
              <span className={st.text}>{st.label}</span>
              <span className="text-boost-muted tabular-nums">· {totalsAll[s]}</span>
            </span>
          );
        })}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted hover:text-boost-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 rounded-sm px-1"
            aria-expanded={filtersOpen}
          >
            <span aria-hidden="true" className="text-xs">
              {filtersOpen ? "▾" : "▸"}
            </span>
            Filter
            {hasActiveFilter && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-boost-green-light text-white text-[10px] font-semibold">
                {statusFilter.size}
              </span>
            )}
          </button>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={clearFilter}
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted/70 hover:text-boost-dark transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="mb-4 rounded-xl border border-boost-border bg-boost-surface/40 p-3">
          <div className="flex items-start gap-3 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted w-14 pt-1 flex-shrink-0">
              Status
            </span>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {STATUS_OPTIONS.map((s) => {
                const active = statusFilter.has(s);
                const st = STATUS_STYLE[s];
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleStatus(s)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-[0.14em] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-1 ${
                      active
                        ? "bg-boost-purple text-white border-boost-purple"
                        : "bg-white text-boost-muted border-boost-border hover:border-boost-muted hover:text-boost-dark"
                    }`}
                  >
                    <span aria-hidden="true" className={`w-2 h-2 rounded-full ${st.dot}`} />
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty filter result */}
      {grouped.size === 0 && hasActiveFilter && (
        <div className="rounded-xl border border-dashed border-boost-border bg-boost-surface/30 p-6 text-center">
          <p className="text-sm text-boost-muted">No entries match the current filter.</p>
          <button
            type="button"
            onClick={clearFilter}
            className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-purple hover:text-boost-purple-dark"
          >
            Clear filter
          </button>
        </div>
      )}

      <div
        ref={ref}
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {Array.from(grouped.entries()).map(([agentKey, agentEntries], i) => (
          <article
            key={agentKey}
            className="stagger-child rounded-xl border border-boost-border bg-white shadow-sm overflow-hidden"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <header className="px-4 sm:px-5 py-3 border-b border-boost-border/60 bg-boost-surface/50">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
                Agent
              </p>
              <h3 className="text-base font-semibold text-boost-dark mt-0.5">
                {humanizeKey(agentKey)}
              </h3>
            </header>
            <ul className="divide-y divide-boost-border/60">
              {agentEntries.map((entry) => {
                const st = STATUS_STYLE[entry.status];
                const id = rowTestId(entry);
                const isExpanded = expandedRow === id;
                const hasHistory = (entry.history?.length ?? 0) > 0;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => toggleRow(id)}
                      className="w-full px-4 sm:px-5 py-3 flex items-start gap-3 text-left hover:bg-boost-surface/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-inset"
                      aria-expanded={isExpanded}
                      aria-controls={`${id}-history`}
                      data-testid={id}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex-shrink-0 w-2.5 h-2.5 rounded-full mt-1.5 ${st.dot}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-boost-dark">
                          {entry.market ? entry.market : "All markets"}
                        </p>
                        {entry.note && (
                          <p className="text-xs text-boost-text-secondary mt-1 leading-relaxed">
                            {entry.note}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span
                          className={`text-[9px] font-semibold uppercase tracking-[0.14em] ${st.text}`}
                        >
                          {st.label}
                        </span>
                        {hasHistory && (
                          <span
                            aria-hidden="true"
                            className="text-[10px] text-boost-muted/70"
                          >
                            {isExpanded ? "▾" : "▸"} {entry.history!.length}
                          </span>
                        )}
                      </div>
                    </button>

                    {isExpanded && hasHistory && (
                      <div
                        id={`${id}-history`}
                        className="px-5 sm:px-6 pb-4 pt-1 bg-boost-surface/30"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2 mt-1">
                          Status history
                        </p>
                        <ol className="relative border-l border-boost-border/70 pl-4 space-y-3">
                          {/* Current state as the topmost timeline node */}
                          <li className="relative">
                            <span
                              aria-hidden="true"
                              className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${st.dot}`}
                            />
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-dark">
                              Current · {st.label}
                            </p>
                            {entry.note && (
                              <p className="text-xs text-boost-text-secondary mt-0.5 leading-relaxed">
                                {entry.note}
                              </p>
                            )}
                          </li>
                          {entry.history!.map((h, hi) => {
                            const hSt = STATUS_STYLE[h.status];
                            return (
                              <li key={hi} className="relative">
                                <span
                                  aria-hidden="true"
                                  className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${hSt.dot}`}
                                />
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
                                  <span className="tabular-nums">{fmtShort(h.at)}</span>
                                  <span aria-hidden="true" className="mx-1.5 text-boost-border">
                                    ·
                                  </span>
                                  <span className={hSt.text}>{hSt.label}</span>
                                </p>
                                {h.note && (
                                  <p className="text-xs text-boost-text-secondary mt-0.5 leading-relaxed">
                                    {h.note}
                                  </p>
                                )}
                              </li>
                            );
                          })}
                        </ol>
                      </div>
                    )}

                    {/* Expanded but no history — simple hint so the click still gives feedback */}
                    {isExpanded && !hasHistory && (
                      <div className="px-5 sm:px-6 pb-4 pt-1 bg-boost-surface/30">
                        <p className="text-xs text-boost-muted/80 italic">
                          No history captured for this entry.
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
