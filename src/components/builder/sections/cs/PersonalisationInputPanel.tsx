"use client";

import type { Customer, PersonalisationOpportunity } from "@/lib/types";
import { TextField, NumberField, LinesField, ListEditor, FieldGrid } from "./_fields";

/* Authors `personalisation_opportunities` — the top-intents →
 * integration → impact table + per-intent user-journey steps. */
export function PersonalisationInputPanel({
  form,
  update,
}: {
  form: Customer;
  update: (patch: Partial<Customer>) => void;
}) {
  return (
    <ListEditor<PersonalisationOpportunity>
      items={form.personalisation_opportunities ?? []}
      onChange={(items) => update({ personalisation_opportunities: items })}
      makeNew={() => ({ intent: "", solution: "" })}
      addLabel="Add opportunity"
      emptyHint="No integration opportunities yet."
      itemTitle={(o) => o.intent || "Intent"}
      renderItem={(o, set) => (
        <div className="space-y-2.5">
          <TextField label="Top intent / topic" value={o.intent} onChange={(v) => set({ intent: v })} placeholder="Check status of my claim" />
          <TextField label="Integration solution" value={o.solution} onChange={(v) => set({ solution: v })} placeholder="CRM API to check case statuses" />
          <FieldGrid>
            <TextField label="Impact (180 days)" value={o.impact_180d ?? ""} onChange={(v) => set({ impact_180d: v })} placeholder="12k requests" />
            <NumberField label="Requests (#)" value={o.requests} onChange={(v) => set({ requests: v })} />
          </FieldGrid>
          <label className="flex items-center gap-2 text-[12px] text-boost-dark cursor-pointer">
            <input
              type="checkbox"
              checked={!!o.negative_feedback}
              onChange={(e) => set({ negative_feedback: e.target.checked })}
              className="accent-boost-purple"
            />
            Top negative-feedback topic
          </label>
          <LinesField
            label="User journey steps (one per line)"
            value={o.journey_steps}
            onChange={(v) => set({ journey_steps: v })}
            placeholder={"authentication\nintent recognition\nclaims API\nLLM-generated status"}
            rows={4}
          />
        </div>
      )}
    />
  );
}
