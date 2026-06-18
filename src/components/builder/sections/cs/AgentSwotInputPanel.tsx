"use client";

import type { Customer, AgentSwot } from "@/lib/types";
import { TextField, LinesField, ListEditor, FieldGrid } from "./_fields";

/* Authors `agent_swot` — per-agent SWOT keyed by agent_key. Stored as
 * a record; edited as a keyed list. Each quadrant is one-per-line. */

type Row = { key: string; swot: AgentSwot };

export function AgentSwotInputPanel({
  form,
  update,
}: {
  form: Customer;
  update: (patch: Partial<Customer>) => void;
}) {
  const rows: Row[] = Object.entries(form.agent_swot ?? {}).map(([key, swot]) => ({ key, swot }));

  const writeBack = (next: Row[]) => {
    const record: Record<string, AgentSwot> = {};
    for (const r of next) {
      if (r.key) record[r.key] = r.swot;
    }
    update({ agent_swot: record });
  };

  return (
    <ListEditor<Row>
      items={rows}
      onChange={writeBack}
      makeNew={() => ({ key: "", swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] } })}
      addLabel="Add agent SWOT"
      emptyHint="No agent SWOTs yet."
      itemTitle={(r) => r.key || "Agent"}
      renderItem={(r, set) => (
        <div className="space-y-2.5">
          <TextField label="Agent key" value={r.key} onChange={(v) => set({ key: v })} placeholder="returns_agent" />
          <FieldGrid>
            <LinesField label="Strengths" value={r.swot.strengths} onChange={(v) => set({ swot: { ...r.swot, strengths: v } })} rows={2} />
            <LinesField label="Weaknesses" value={r.swot.weaknesses} onChange={(v) => set({ swot: { ...r.swot, weaknesses: v } })} rows={2} />
            <LinesField label="Opportunities" value={r.swot.opportunities} onChange={(v) => set({ swot: { ...r.swot, opportunities: v } })} rows={2} />
            <LinesField label="Threats" value={r.swot.threats} onChange={(v) => set({ swot: { ...r.swot, threats: v } })} rows={2} />
          </FieldGrid>
        </div>
      )}
    />
  );
}
