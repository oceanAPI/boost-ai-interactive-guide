"use client";

import type { Customer, PerformanceMetrics } from "@/lib/types";
import { NumberField, TextField, FieldGrid, TextAreaField } from "./_fields";
import { AdminPrompt } from "@/components/admin/primitives";

/* Authors `performance` (current + previous-period values) plus a
 * light `performance_details` narrative for the headline metric. The
 * previous-* values drive the trend arrows in PerformanceSection. */
export function PerformanceInputPanel({
  form,
  update,
}: {
  form: Customer;
  update: (patch: Partial<Customer>) => void;
}) {
  const p: PerformanceMetrics = form.performance ?? {};
  const setP = (patch: Partial<PerformanceMetrics>) =>
    update({ performance: { ...p, ...patch } });

  const details = form.performance_details ?? {};
  const setNarrative = (v: string) =>
    update({
      performance_details: {
        ...details,
        automation_rate: { ...details.automation_rate, narrative: v || undefined },
      },
    });

  return (
    <div className="space-y-3">
      <AdminPrompt question="Current period" helper="Live deployment metrics for this review window." />
      <FieldGrid>
        <NumberField label="Automation rate %" value={p.automation_rate} onChange={(v) => setP({ automation_rate: v })} min={0} max={100} />
        <NumberField label="CSAT score" value={p.csat_score} onChange={(v) => setP({ csat_score: v })} step={0.1} />
        <NumberField label="Unknown rate %" value={p.unknown_rate} onChange={(v) => setP({ unknown_rate: v })} min={0} max={100} />
        <NumberField label="Escalation rate %" value={p.escalation_rate} onChange={(v) => setP({ escalation_rate: v })} min={0} max={100} />
        <NumberField label="Monthly conversations" value={p.monthly_conversations} onChange={(v) => setP({ monthly_conversations: v })} />
        <NumberField label="Markets live" value={p.markets_live} onChange={(v) => setP({ markets_live: v })} />
        <NumberField label="Active agents" value={p.active_agents} onChange={(v) => setP({ active_agents: v })} />
      </FieldGrid>

      <FieldGrid>
        <TextField label="Measured from" type="date" value={p.measured_from ?? ""} onChange={(v) => setP({ measured_from: v })} />
        <TextField label="Measured to" type="date" value={p.measured_to ?? ""} onChange={(v) => setP({ measured_to: v })} />
      </FieldGrid>

      <AdminPrompt question="Previous period" helper="Optional — fills the up/down trend arrows." divider />
      <FieldGrid>
        <NumberField label="Prev automation %" value={p.previous_automation_rate} onChange={(v) => setP({ previous_automation_rate: v })} min={0} max={100} />
        <NumberField label="Prev CSAT" value={p.previous_csat_score} onChange={(v) => setP({ previous_csat_score: v })} step={0.1} />
        <NumberField label="Prev unknown %" value={p.previous_unknown_rate} onChange={(v) => setP({ previous_unknown_rate: v })} min={0} max={100} />
        <NumberField label="Prev escalation %" value={p.previous_escalation_rate} onChange={(v) => setP({ previous_escalation_rate: v })} min={0} max={100} />
        <NumberField label="Prev monthly convs" value={p.previous_monthly_conversations} onChange={(v) => setP({ previous_monthly_conversations: v })} />
      </FieldGrid>

      <AdminPrompt question="Headline narrative" helper="What drove the automation-rate move this period." divider />
      <TextAreaField
        label="Automation-rate narrative"
        value={details.automation_rate?.narrative ?? ""}
        onChange={setNarrative}
        placeholder="Q1 jump from 62 → 68 came from the returns agent absorbing ~8k agent-hours."
      />
    </div>
  );
}
