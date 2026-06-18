"use client";

import type { Customer, AgenticOutcome } from "@/lib/types";
import { TextField, TextAreaField, LinesField, ListEditor, FieldGrid } from "./_fields";

/* Authors `agentic_outcomes` — pre-Boost vs post-Boost before/after
 * pairs. Values are free-text so mixed units round-trip. */
export function AgenticOutcomeInputPanel({
  form,
  update,
}: {
  form: Customer;
  update: (patch: Partial<Customer>) => void;
}) {
  return (
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
}
