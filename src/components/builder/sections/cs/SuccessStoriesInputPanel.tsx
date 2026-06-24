"use client";

import { useState } from "react";
import type { Customer } from "@/lib/types";
import {
  SUCCESS_STORIES,
  SUCCESS_STORY_INDUSTRIES,
  type SuccessStory,
} from "@/data/success-stories";
import {
  AdminPrompt,
  AdminChip,
  AdminChipRow,
  AdminMiniLabel,
} from "@/components/admin/primitives";

/* Authors `featured_story_ids` — the flat, section-level success-story
 * picks for the dedicated SuccessStoriesSection — plus the per-engagement
 * `success_stories_anon` toggle that flips every rendered name to its
 * anonymised form. Distinct from the per-chapter `story_selections` picker
 * inside ThoughtLeadershipInputPanel (which feeds the chapter cards). */
export function SuccessStoriesInputPanel({
  form,
  update,
}: {
  form: Customer;
  update: (patch: Partial<Customer>) => void;
}) {
  const [industry, setIndustry] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const featured = form.featured_story_ids ?? [];
  const anon = form.success_stories_anon ?? false;

  const filtered = SUCCESS_STORIES.filter((s) => {
    if (industry && s.industry !== industry) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      return [s.name, s.anonName, s.industry, s.geo, s.subtitle]
        .join(" ")
        .toLowerCase()
        .includes(q);
    }
    return true;
  });

  // Selected-first ordering so picks stay visible while filtering.
  const ordered = [...filtered].sort((a, b) => {
    const aS = featured.includes(a.id) ? 0 : 1;
    const bS = featured.includes(b.id) ? 0 : 1;
    return aS - bS;
  });

  const toggle = (id: string) => {
    const next = featured.includes(id)
      ? featured.filter((x) => x !== id)
      : [...featured, id];
    update({ featured_story_ids: next.length ? next : undefined });
  };

  return (
    <div className="space-y-3">
      <AdminPrompt
        question="Featured stories"
        helper={`Pick the customer stories to feature in this engagement's Success Stories section. Order = pick order. Leave empty to show the whole library (${SUCCESS_STORIES.length}).`}
      />

      {/* Anonymise toggle */}
      <label className="flex items-center gap-2 rounded-lg border border-boost-border bg-boost-surface/30 px-3 py-2.5 text-[12px] text-boost-dark cursor-pointer">
        <input
          type="checkbox"
          checked={anon}
          onChange={(e) =>
            update({ success_stories_anon: e.target.checked || undefined })
          }
          className="accent-boost-purple"
        />
        <span>
          <span className="font-semibold">Anonymise names</span>
          <span className="block text-[11px] text-boost-muted">
            Renders generic descriptors (e.g. &ldquo;Nordic Banking Group&rdquo;)
            instead of real customer names.
          </span>
        </span>
      </label>

      {/* Filters */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, geo, industry…"
        className="w-full px-3 py-2 bg-white border border-boost-border rounded-lg text-[13px] text-boost-dark placeholder-boost-lavender focus:outline-none focus:ring-2 focus:ring-boost-green-light focus:border-transparent transition-shadow"
      />
      <AdminChipRow>
        <AdminChip active={industry === null} onClick={() => setIndustry(null)}>
          All industries
        </AdminChip>
        {SUCCESS_STORY_INDUSTRIES.map((ind) => (
          <AdminChip
            key={ind}
            active={industry === ind}
            onClick={() => setIndustry(ind)}
          >
            {ind}
          </AdminChip>
        ))}
      </AdminChipRow>

      <AdminMiniLabel>
        {featured.length} selected of {SUCCESS_STORIES.length}
      </AdminMiniLabel>

      {/* Story list */}
      <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
        {ordered.length === 0 && (
          <p className="text-xs text-boost-muted py-3 text-center">
            No stories match.
          </p>
        )}
        {ordered.map((s) => (
          <StoryRow
            key={s.id}
            story={s}
            anon={anon}
            selected={featured.includes(s.id)}
            onToggle={() => toggle(s.id)}
          />
        ))}
      </div>
    </div>
  );
}

function StoryRow({
  story,
  anon,
  selected,
  onToggle,
}: {
  story: SuccessStory;
  anon: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
        selected
          ? "border-boost-green-light/60 bg-boost-green-light/8"
          : "border-boost-border/60 bg-white hover:bg-boost-surface/50"
      }`}
    >
      <span
        className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
          selected
            ? "border-boost-green-light bg-boost-green-light text-white"
            : "border-boost-border"
        }`}
      >
        {selected && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-[13px] font-semibold text-boost-dark truncate block">
          {anon ? story.anonName : story.name}
        </span>
        <AdminMiniLabel className="mt-0.5 normal-case tracking-normal text-boost-muted">
          {story.industry} · {story.geo}
        </AdminMiniLabel>
        <span className="mt-0.5 block text-[11px] leading-snug text-boost-muted">
          {story.subtitle}
        </span>
      </span>
    </button>
  );
}
