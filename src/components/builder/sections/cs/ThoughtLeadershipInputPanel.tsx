"use client";

import { useState } from "react";
import type { Customer, ThoughtLeadershipStat } from "@/lib/types";
import { TextField, TextAreaField, ListEditor, FieldGrid } from "./_fields";
import { AdminPrompt, AdminChip, AdminChipRow, AdminMiniLabel } from "@/components/admin/primitives";
import { THOUGHT_LEADERSHIP_DEFAULTS, STORY_CHAPTERS } from "@/data/thought-leadership";
import {
  SUCCESS_STORIES,
  SUCCESS_STORY_INDUSTRIES,
  type SuccessStory,
} from "@/data/success-stories";

/* Authors `thought_leadership` — the big-number story openers — plus the
 * per-chapter success-story picker that writes `story_selections`. Story
 * stats start empty (the section falls back to the boost.ai defaults when
 * unset); "Load boost.ai story" seeds the deck stats so the CSM can tweak. */
export function ThoughtLeadershipInputPanel({
  form,
  update,
}: {
  form: Customer;
  update: (patch: Partial<Customer>) => void;
}) {
  const items = form.thought_leadership ?? [];

  return (
    <div className="space-y-3">
      <AdminPrompt
        question="Story stats"
        helper={
          items.length === 0
            ? "Empty uses the boost.ai market story by default. Load it to customise the numbers for this customer."
            : "Headline + hero figure + a data-driven sentence. These open the engagement narrative."
        }
        action={
          items.length === 0 ? (
            <button
              type="button"
              onClick={() => update({ thought_leadership: THOUGHT_LEADERSHIP_DEFAULTS.map((s) => ({ ...s })) })}
              className="rounded-lg border border-boost-border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-boost-dark hover:bg-boost-surface transition-colors whitespace-nowrap"
            >
              Load boost.ai story
            </button>
          ) : undefined
        }
      />

      <ListEditor<ThoughtLeadershipStat>
        items={items}
        onChange={(next) => update({ thought_leadership: next })}
        makeNew={() => ({ headline: "", stat: "", narrative: "" })}
        addLabel="Add story stat"
        emptyHint="No custom stats — the section shows the boost.ai default story."
        itemTitle={(s) => s.headline || "Stat"}
        renderItem={(s, set) => (
          <div className="space-y-2.5">
            <FieldGrid>
              <TextField label="Headline" value={s.headline} onChange={(v) => set({ headline: v })} placeholder="Agentic" />
              <TextField label="Hero figure" value={s.stat} onChange={(v) => set({ stat: v })} placeholder="88%" />
            </FieldGrid>
            <TextAreaField
              label="Narrative"
              value={s.narrative}
              onChange={(v) => set({ narrative: v })}
              placeholder="91% of our customers have LLM features in production today…"
              rows={2}
            />
          </div>
        )}
      />

      <SuccessStoryPicker form={form} update={update} />
    </div>
  );
}

/* ─── Per-chapter success-story picker ──────────────────────────────
 *  Pick relevant customer stories into each story-spine chapter's
 *  "Success stories" cards. A chapter with picks renders those in place
 *  of the boost.ai defaults; untouched chapters keep the defaults.
 *  Filter by industry / free-text to find the right reference fast. */
function SuccessStoryPicker({
  form,
  update,
}: {
  form: Customer;
  update: (patch: Partial<Customer>) => void;
}) {
  const [activeChapter, setActiveChapter] = useState(STORY_CHAPTERS[0].id);
  const [industry, setIndustry] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const selections = form.story_selections ?? {};
  const selected = selections[activeChapter] ?? [];

  const filtered = SUCCESS_STORIES.filter((s) => {
    if (industry && s.industry !== industry) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      return [s.name, s.anonName, s.industry, s.geo, s.subtitle].join(" ").toLowerCase().includes(q);
    }
    return true;
  });

  // Suggested-first ordering: stories tagged for this chapter float up.
  const ordered = [...filtered].sort((a, b) => {
    const aS = a.chapter === activeChapter ? 0 : 1;
    const bS = b.chapter === activeChapter ? 0 : 1;
    return aS - bS;
  });

  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    const nextSelections = { ...selections };
    if (next.length) nextSelections[activeChapter] = next;
    else delete nextSelections[activeChapter];
    update({ story_selections: Object.keys(nextSelections).length ? nextSelections : undefined });
  };

  return (
    <div className="pt-5 mt-5 border-t border-boost-border/60">
      <AdminPrompt
        question="Success stories"
        helper="Pick relevant customer stories per chapter. Selected stories replace the boost.ai defaults for that chapter; leave a chapter empty to keep its defaults."
      />

      {/* Chapter tabs — each shows its pick count */}
      <AdminChipRow className="mb-3">
        {STORY_CHAPTERS.map((ch) => {
          const count = (selections[ch.id] ?? []).length;
          return (
            <AdminChip
              key={ch.id}
              active={activeChapter === ch.id}
              tone="secondary"
              onClick={() => setActiveChapter(ch.id)}
              title={ch.headline}
            >
              {ch.challenge}{count > 0 ? ` · ${count}` : ""}
            </AdminChip>
          );
        })}
      </AdminChipRow>

      {/* Filters */}
      <div className="mb-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, geo, industry…"
          className="w-full px-3 py-2 bg-white border border-boost-border rounded-lg text-[13px] text-boost-dark placeholder-boost-lavender focus:outline-none focus:ring-2 focus:ring-boost-green-light focus:border-transparent transition-shadow"
        />
      </div>
      <AdminChipRow className="mb-3">
        <AdminChip active={industry === null} onClick={() => setIndustry(null)}>All industries</AdminChip>
        {SUCCESS_STORY_INDUSTRIES.map((ind) => (
          <AdminChip key={ind} active={industry === ind} onClick={() => setIndustry(ind)}>
            {ind}
          </AdminChip>
        ))}
      </AdminChipRow>

      {/* Story list */}
      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
        {ordered.length === 0 && (
          <p className="text-xs text-boost-muted py-3 text-center">No stories match.</p>
        )}
        {ordered.map((s) => (
          <StoryRow
            key={s.id}
            story={s}
            selected={selected.includes(s.id)}
            suggested={s.chapter === activeChapter}
            onToggle={() => toggle(s.id)}
          />
        ))}
      </div>
    </div>
  );
}

function StoryRow({
  story,
  selected,
  suggested,
  onToggle,
}: {
  story: SuccessStory;
  selected: boolean;
  suggested: boolean;
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
          selected ? "border-boost-green-light bg-boost-green-light text-white" : "border-boost-border"
        }`}
      >
        {selected && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-boost-dark truncate">{story.name}</span>
          {suggested && (
            <span className="flex-shrink-0 rounded-full bg-boost-purple/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-boost-purple">Suggested</span>
          )}
        </span>
        <AdminMiniLabel className="mt-0.5 normal-case tracking-normal text-boost-muted">
          {story.industry} · {story.geo}
        </AdminMiniLabel>
        <span className="mt-0.5 block text-[11px] leading-snug text-boost-muted">{story.subtitle}</span>
      </span>
    </button>
  );
}
