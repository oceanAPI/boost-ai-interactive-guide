"use client";

import type { Customer, Recommendation } from "@/lib/types";
import { TextField, TextAreaField, SelectField, NumberField, LinesField, ListEditor, FieldGrid } from "./_fields";

/* Authors `recommendations` — ranked next moves. Order in the array
 * IS the rank (TopRecommendationsSection renders top-down). */
export function RecommendationsInputPanel({
  form,
  update,
}: {
  form: Customer;
  update: (patch: Partial<Customer>) => void;
}) {
  const total = form.recommendations?.length ?? 0;
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-boost-border bg-boost-surface/30 p-3.5">
        <NumberField
          label={`Show top N in the guide (of ${total})`}
          value={form.recommendations_display_count}
          onChange={(v) => update({ recommendations_display_count: v })}
          min={1}
          max={total || undefined}
          step={1}
          placeholder="All"
        />
        <p className="mt-1.5 text-[11px] text-boost-muted/80 leading-relaxed">
          The guide ranks recommendations by weight and shows the top N. Leave
          blank to show all. Remove ones you dislike below.
        </p>
      </div>
      <ListEditor<Recommendation>
      items={form.recommendations ?? []}
      onChange={(items) => update({ recommendations: items })}
      makeNew={() => ({ title: "", rationale: "" })}
      addLabel="Add recommendation"
      emptyHint="No recommendations yet. Order = rank."
      itemTitle={(r, i) => `#${i + 1} · ${r.title || "Untitled"}`}
      renderItem={(r, set) => (
        <div className="space-y-2.5">
          <TextField label="Title" value={r.title} onChange={(v) => set({ title: v })} placeholder="Roll out the returns agent to SE + FI" />
          <TextAreaField label="Rationale" value={r.rationale} onChange={(v) => set({ rationale: v })} rows={2} />
          <FieldGrid cols={3}>
            <SelectField
              label="Urgency"
              value={r.urgency}
              onChange={(v) => set({ urgency: v })}
              options={[
                { value: "immediate", label: "Immediate" },
                { value: "this-quarter", label: "This quarter" },
                { value: "this-year", label: "This year" },
                { value: "exploratory", label: "Exploratory" },
              ]}
            />
            <SelectField
              label="Confidence"
              value={r.confidence}
              onChange={(v) => set({ confidence: v })}
              options={[
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]}
            />
            <NumberField label="Weight (0–1)" value={r.weight} onChange={(v) => set({ weight: v })} min={0} max={1} step={0.05} />
          </FieldGrid>
          <LinesField label="Expected outcomes (one per line)" value={r.expected_outcomes} onChange={(v) => set({ expected_outcomes: v })} rows={2} />
          <LinesField label="Tags (one per line)" value={r.tags} onChange={(v) => set({ tags: v })} rows={2} />
        </div>
      )}
      />
    </div>
  );
}
