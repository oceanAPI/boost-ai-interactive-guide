"use client";

import type { Customer, BenchmarkEntry } from "@/lib/types";
import { TextField, NumberField, TextAreaField, SelectField, ListEditor, FieldGrid } from "./_fields";

/* Authors `benchmarks` — peer/industry averages keyed by a metric
 * name that matches a PerformanceMetrics field. Stored as a record;
 * edited here as a keyed list and re-folded on every change. */

type Row = { key: string; entry: BenchmarkEntry };

const METRIC_OPTIONS = [
  { value: "automation_rate", label: "Automation rate" },
  { value: "csat_score", label: "CSAT score" },
  { value: "unknown_rate", label: "Unknown rate" },
  { value: "escalation_rate", label: "Escalation rate" },
  { value: "monthly_conversations", label: "Monthly conversations" },
] as const;

export function BenchmarkInputPanel({
  form,
  update,
}: {
  form: Customer;
  update: (patch: Partial<Customer>) => void;
}) {
  const rows: Row[] = Object.entries(form.benchmarks ?? {}).map(([key, entry]) => ({ key, entry }));

  const writeBack = (next: Row[]) => {
    const record: Record<string, BenchmarkEntry> = {};
    for (const r of next) {
      if (r.key) record[r.key] = r.entry;
    }
    update({ benchmarks: record });
  };

  return (
    <ListEditor<Row>
      items={rows}
      onChange={writeBack}
      makeNew={() => ({ key: "automation_rate", entry: {} })}
      addLabel="Add benchmark metric"
      emptyHint="No benchmarks yet."
      itemTitle={(r) => METRIC_OPTIONS.find((m) => m.value === r.key)?.label || r.key || "Metric"}
      renderItem={(r, set) => (
        <div className="space-y-2.5">
          <SelectField
            label="Metric"
            value={r.key}
            onChange={(v) => set({ key: v ?? "" })}
            options={METRIC_OPTIONS}
            placeholder="Pick a metric"
          />
          <FieldGrid cols={3}>
            <NumberField label="Peer avg" value={r.entry.peer_avg} onChange={(v) => set({ entry: { ...r.entry, peer_avg: v } })} step={0.1} />
            <NumberField label="Industry avg" value={r.entry.industry_avg} onChange={(v) => set({ entry: { ...r.entry, industry_avg: v } })} step={0.1} />
            <NumberField label="Percentile" value={r.entry.percentile} onChange={(v) => set({ entry: { ...r.entry, percentile: v } })} min={0} max={100} />
          </FieldGrid>
          <TextField label="Display label" value={r.entry.label ?? ""} onChange={(v) => set({ entry: { ...r.entry, label: v } })} />
          <TextField label="Peer cohort" value={r.entry.peer_cohort_description ?? ""} onChange={(v) => set({ entry: { ...r.entry, peer_cohort_description: v } })} placeholder="12 Nordic retailers >5M interactions" />
          <TextAreaField label="Interpretation" value={r.entry.interpretation ?? ""} onChange={(v) => set({ entry: { ...r.entry, interpretation: v } })} rows={2} />
        </div>
      )}
    />
  );
}
