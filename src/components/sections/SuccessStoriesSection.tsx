"use client";

/* ──────────────────────────────────────────────────────────────
 *  SuccessStoriesSection — the curated success-story library.
 *
 *  Renders the stories the CSM hand-picked for this engagement
 *  (`customer.featured_story_ids`, in pick order); falls back to the
 *  whole library when none are picked. Names flip to `anonName` when
 *  `customer.success_stories_anon` is on — a single render-time
 *  substitution so anonymisation has one source of truth.
 *
 *  Cards show name / subtitle / before→after / a metric strip; click
 *  opens SuccessStoryDetailModal with the full Challenge / Solution /
 *  Outcome narrative + key metrics. An industry filter row + search
 *  narrow the visible set client-side.
 * ────────────────────────────────────────────────────────────── */

import { useMemo, useState } from "react";
import type { Customer } from "@/lib/types";
import {
  SUCCESS_STORIES,
  getSuccessStory,
  type SuccessStory,
} from "@/data/success-stories";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import SuccessStoryDetailModal from "./success-stories/SuccessStoryDetailModal";

interface SuccessStoriesSectionProps {
  customer?: Customer;
  sectionNumber?: string;
}

export default function SuccessStoriesSection({
  customer,
  sectionNumber,
}: SuccessStoriesSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeIndustry, setActiveIndustry] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const anon = customer?.success_stories_anon ?? false;
  const nameOf = (s: SuccessStory) => (anon ? s.anonName : s.name);

  /** The engagement's curated set, in pick order; whole library if none. */
  const featured = useMemo<SuccessStory[]>(() => {
    const ids = customer?.featured_story_ids ?? [];
    if (ids.length === 0) return SUCCESS_STORIES;
    return ids
      .map((id) => getSuccessStory(id))
      .filter((s): s is SuccessStory => s !== undefined);
  }, [customer?.featured_story_ids]);

  /** Industry chips, scoped to the featured set only. */
  const industries = useMemo(
    () => [...new Set(featured.map((s) => s.industry))].sort(),
    [featured],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return featured.filter((s) => {
      if (activeIndustry && s.industry !== activeIndustry) return false;
      if (!q) return true;
      return [nameOf(s), s.industry, s.geo, s.subtitle, s.title]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featured, activeIndustry, query, anon]);

  const openStory = openId ? getSuccessStory(openId) : null;

  if (featured.length === 0) {
    return (
      <section>
        <SectionHeader
          number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
          title="Success stories"
          subtitle="No stories selected yet. Pick stories from the library in the builder to feature them here."
        />
      </section>
    );
  }

  return (
    <section>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title="Success stories"
        subtitle="Proof from teams who made the same move. Tap any story for the full challenge, solution and outcome."
      />

      {/* Controls — industry chips + search */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {industries.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setActiveIndustry(null)}
              className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                activeIndustry === null
                  ? "bg-boost-purple text-white"
                  : "bg-boost-surface text-boost-muted hover:text-boost-dark border border-boost-border"
              }`}
              data-testid="success-story-filter-all"
            >
              All
            </button>
            {industries.map((ind) => (
              <button
                key={ind}
                type="button"
                onClick={() =>
                  setActiveIndustry((cur) => (cur === ind ? null : ind))
                }
                className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                  activeIndustry === ind
                    ? "bg-boost-purple text-white"
                    : "bg-boost-surface text-boost-muted hover:text-boost-dark border border-boost-border"
                }`}
                data-testid={`success-story-filter-${ind.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {ind}
              </button>
            ))}
          </div>
        )}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stories…"
          className="w-full sm:w-56 px-3 py-1.5 bg-white border border-boost-border rounded-lg text-[13px] text-boost-dark placeholder-boost-lavender focus:outline-none focus:ring-2 focus:ring-boost-green-light focus:border-transparent transition-shadow"
          aria-label="Search success stories"
          data-testid="success-story-search"
        />
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-boost-muted italic py-8 text-center">
          No stories match this filter.
        </p>
      ) : (
        <div
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {visible.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setOpenId(s.id)}
              className="stagger-child relative rounded-xl border border-boost-border bg-white p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-3 overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2"
              style={{ animationDelay: `${i * 60}ms` }}
              aria-label={`Open success story: ${nameOf(s)}`}
              data-testid={`success-story-${s.id}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-green truncate">
                  {nameOf(s)}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-[0.14em] bg-boost-surface text-boost-muted border border-boost-border flex-shrink-0">
                  {s.industry}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-boost-dark leading-snug">
                {s.subtitle}
              </h3>

              {(s.before || s.after) && (
                <div className="text-xs text-boost-text-secondary leading-relaxed flex-1 space-y-1.5">
                  {s.before && (
                    <p>
                      <span className="font-semibold uppercase tracking-[0.1em] text-[9px] text-boost-muted mr-1.5">
                        Was
                      </span>
                      {s.before}
                    </p>
                  )}
                  {s.after && (
                    <p>
                      <span className="font-semibold uppercase tracking-[0.1em] text-[9px] text-boost-green mr-1.5">
                        Now
                      </span>
                      {s.after}
                    </p>
                  )}
                </div>
              )}

              {s.metrics.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-2 border-t border-boost-border/60">
                  {s.metrics.map((m, mi) => (
                    <div key={mi} className="flex flex-col">
                      <span className="text-sm font-bold text-boost-purple tabular-nums leading-none">
                        {m.value}
                      </span>
                      <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-boost-muted mt-1">
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {openStory && (
        <SuccessStoryDetailModal
          story={openStory}
          displayName={nameOf(openStory)}
          onClose={() => setOpenId(null)}
        />
      )}
    </section>
  );
}
