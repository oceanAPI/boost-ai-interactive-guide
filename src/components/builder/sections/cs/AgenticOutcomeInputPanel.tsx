"use client";

import type { Customer, AgenticOutcome } from "@/lib/types";
import { TextField, TextAreaField, LinesField, ListEditor, FieldGrid } from "./_fields";
import { suggestAgenticOutcomes } from "@/lib/cs-engine/suggestions";
import { SuggestionBlock, type SuggestionItem } from "./_SuggestionBlock";

/* Authors `agentic_outcomes` — pre-Boost vs post-Boost before/after
 * pairs. Values are free-text so mixed units round-trip. Suggestions
 * are derived from the customer's top-matched success stories, so the
 * "agentic transformation" can be seeded from proven reference patterns. */
export function AgenticOutcomeInputPanel({
  form,
  update,
}: {
  form: Customer;
  update: (patch: Partial<Customer>) => void;
}) {
  const outcomes = form.agentic_outcomes ?? [];
  const suggestions = suggestAgenticOutcomes(form, { limit: 4 });
  const has = (topic: string) =>
    outcomes.some((o) => o.topic.trim().toLowerCase() === topic.trim().toLowerCase());
  const suggestionItems: SuggestionItem[] = suggestions.map((s) => ({
    key: s.sourceStoryId,
    title: s.outcome.topic,
    subtitle: `${s.outcome.before.value} → ${s.outcome.after.value}`,
    reasons: s.reasons,
    accepted: has(s.outcome.topic),
  }));
  const accept = (sourceStoryId: string) => {
    const match = suggestions.find((s) => s.sourceStoryId === sourceStoryId);
    if (!match || has(match.outcome.topic)) return;
    update({ agentic_outcomes: [...outcomes, match.outcome] });
  };

  const editor = (
    <ListEditor<AgenticOutcome>
      items={form.agentic_outcomes ?? []}
      onChange={(items) => update({ agentic_outcomes: items })}
      makeNew={() => ({ topic: "", before: { label: "", value: "" }, after: { label: "", value: "" } })}
      addLabel="Add before/after pair"
      emptyHint="No transformation pairs yet."
      itemTitle={(o) => o.topic || "Topic"}
      renderItem={(o, set) => (
        <div className="space-y-2.5">
          <TextField label="Topic" value={o.topic} onChange={(v) => set({ topic: v })} placeholder="Returns" />
          <FieldGrid>
            <TextField label="Before — label" value={o.before.label} onChange={(v) => set({ before: { ...o.before, label: v } })} placeholder="Avg handle time" />
            <TextField label="Before — value" value={o.before.value} onChange={(v) => set({ before: { ...o.before, value: v } })} placeholder="2 min" />
            <TextField label="After — label" value={o.after.label} onChange={(v) => set({ after: { ...o.after, label: v } })} placeholder="Avg handle time" />
            <TextField label="After — value" value={o.after.value} onChange={(v) => set({ after: { ...o.after, value: v } })} placeholder="35 sec" />
          </FieldGrid>
          <TextAreaField label="Narrative" value={o.narrative ?? ""} onChange={(v) => set({ narrative: v })} rows={2} />
          <LinesField label="Evidence (one per line)" value={o.evidence} onChange={(v) => set({ evidence: v })} rows={2} />
          <TextField label="Validated on" type="date" value={o.validated_on ?? ""} onChange={(v) => set({ validated_on: v })} />
        </div>
      )}
    />
  );

  return (
    <div className="space-y-3">
      <SuggestionBlock
        heading="Transformation patterns from success stories"
        helper="Proven before/after pairs from the customer's most relevant references. Add one to seed it, then edit the values to match their data."
        items={suggestionItems}
        emptyHint="Add metrics or an intent-traffic export and we'll suggest transformation patterns from matching stories."
        onAccept={accept}
      />
      {editor}
    </div>
  );
}
