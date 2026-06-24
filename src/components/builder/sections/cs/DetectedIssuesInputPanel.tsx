"use client";

import type { Customer, PerformanceMetrics } from "@/lib/types";
import { NumberField, FieldGrid } from "./_fields";
import { AdminPrompt } from "@/components/admin/primitives";
import { runEngine } from "@/lib/cs-engine";
import { metricsFromCustomer } from "@/lib/cs-engine/metrics";

/* The CS decision engine's authoring surface. There's no bespoke data
 * to enter here — the engine reads what's already on the record (the
 * performance metrics + the intent-traffic upload). This panel just (a)
 * reports what the engine could read and how many signals it detected,
 * and (b) lets the CSM fill the key performance-backed metrics one at a
 * time so more rules can fire. Unsolved / escalation come from the
 * intent-traffic upload, so those are pointed there rather than typed. */
export function DetectedIssuesInputPanel({
  form,
  update,
}: {
  form: Customer;
  update: (patch: Partial<Customer>) => void;
}) {
  const p: PerformanceMetrics = form.performance ?? {};
  const setP = (patch: Partial<PerformanceMetrics>) => update({ performance: { ...p, ...patch } });

  const mapped = metricsFromCustomer(form);
  const read = Object.keys(mapped.metricsSet).length;
  const result = read > 0 ? runEngine(mapped.metrics, { metricsSet: mapped.metricsSet, hierarchy: mapped.hierarchy }) : null;

  return (
    <div className="space-y-3">
      <AdminPrompt
        question="What the engine sees"
        helper={
          result
            ? `Read ${read} metric${read === 1 ? "" : "s"} · detected ${result.detectedIssues.length} signal${result.detectedIssues.length === 1 ? "" : "s"} · ${result.topPriorities.length} actionable move${result.topPriorities.length === 1 ? "" : "s"}. The live preview below shows the full output.`
            : "No metrics yet. Fill the key metrics below or upload the intent-traffic export, and the engine will detect issues and rank initiatives."
        }
      />

      <AdminPrompt
        question="Key metrics"
        helper="Each one you fill unlocks more of the engine. Leave any you don't track blank — the rules that need them are skipped, not guessed."
        divider
      />
      <FieldGrid>
        <NumberField label="Automation rate %" value={p.automation_rate} onChange={(v) => setP({ automation_rate: v })} min={0} max={100} />
        <NumberField label="Unknown rate %" value={p.unknown_rate} onChange={(v) => setP({ unknown_rate: v })} min={0} max={100} />
        <NumberField label="CSAT score" value={p.csat_score} onChange={(v) => setP({ csat_score: v })} step={0.1} />
        <NumberField label="Monthly conversations" value={p.monthly_conversations} onChange={(v) => setP({ monthly_conversations: v })} />
      </FieldGrid>

      <p className="text-xs text-boost-muted leading-relaxed">
        Unsolved and escalation rates are read from the <strong>Intent Traffic</strong> upload — add the CSV there and they flow in automatically.
      </p>
    </div>
  );
}
