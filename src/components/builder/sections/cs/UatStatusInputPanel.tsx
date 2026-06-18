"use client";

import type { Customer, UatStatusEntry } from "@/lib/types";
import { TextField, SelectField, TextAreaField, ListEditor, FieldGrid, RAG_OPTIONS } from "./_fields";

/* Authors `uat_status` — rollout / UAT health per agent (+ optional
 * market). One traffic-light status + note per entry. */
export function UatStatusInputPanel({
  form,
  update,
}: {
  form: Customer;
  update: (patch: Partial<Customer>) => void;
}) {
  return (
    <ListEditor<UatStatusEntry>
      items={form.uat_status ?? []}
      onChange={(items) => update({ uat_status: items })}
      makeNew={() => ({ agent_key: "", status: "green" })}
      addLabel="Add status entry"
      emptyHint="No rollout status entries yet."
      itemTitle={(e) => `${e.agent_key || "Agent"}${e.market ? ` · ${e.market}` : ""}`}
      renderItem={(e, set) => (
        <div className="space-y-2.5">
          <FieldGrid cols={3}>
            <TextField label="Agent key" value={e.agent_key} onChange={(v) => set({ agent_key: v })} placeholder="returns_agent" />
            <TextField label="Market" value={e.market ?? ""} onChange={(v) => set({ market: v })} placeholder="SE (blank = all)" />
            <SelectField label="Status" value={e.status} onChange={(v) => set({ status: v ?? "green" })} options={RAG_OPTIONS} placeholder="Status" />
          </FieldGrid>
          <TextAreaField label="Note" value={e.note ?? ""} onChange={(v) => set({ note: v })} rows={2} />
        </div>
      )}
    />
  );
}
