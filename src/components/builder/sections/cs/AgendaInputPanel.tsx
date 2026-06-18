"use client";

import type { Customer, BrContext, AgendaItem } from "@/lib/types";
import { TextField, TextAreaField, SelectField, LinesField, ListEditor, FieldGrid } from "./_fields";

/* Authors br_context — meeting opener + agenda rows for the BR. */
export function AgendaInputPanel({
  form,
  update,
}: {
  form: Customer;
  update: (patch: Partial<Customer>) => void;
}) {
  const br: BrContext = form.br_context ?? {};
  const setBr = (patch: Partial<BrContext>) =>
    update({ br_context: { ...br, ...patch } });

  return (
    <div className="space-y-3">
      <FieldGrid>
        <TextField
          label="Meeting title"
          value={br.meeting_title ?? ""}
          onChange={(v) => setBr({ meeting_title: v })}
          placeholder="Q2 Business Review"
        />
        <TextField
          label="Meeting date"
          type="date"
          value={br.meeting_date ?? ""}
          onChange={(v) => setBr({ meeting_date: v })}
        />
      </FieldGrid>

      <LinesField
        label="Attendees (one per line)"
        value={br.attendees}
        onChange={(v) => setBr({ attendees: v })}
        placeholder={"Jane Doe — Head of CX\nSam Lee — Boost CSM"}
      />

      <SelectField
        label="Agenda style"
        value={br.agenda_style}
        onChange={(v) => setBr({ agenda_style: v })}
        options={[
          { value: "timed", label: "Timed (hh:mm)" },
          { value: "numbered", label: "Numbered (01 / 02)" },
        ]}
      />

      <ListEditor<AgendaItem>
        items={br.agenda_items ?? []}
        onChange={(items) => setBr({ agenda_items: items })}
        makeNew={() => ({ topic: "" })}
        addLabel="Add agenda item"
        emptyHint="No agenda items yet."
        itemTitle={(it, i) => it.topic || `Item ${i + 1}`}
        renderItem={(it, set) => (
          <div className="space-y-2.5">
            <TextField label="Topic" value={it.topic} onChange={(v) => set({ topic: v })} placeholder="Value-to-date review" />
            <FieldGrid cols={3}>
              <TextField label="Time" value={it.time ?? ""} onChange={(v) => set({ time: v })} placeholder="11:00" />
              <TextField label="Owner" value={it.owner ?? ""} onChange={(v) => set({ owner: v })} placeholder="Sam" />
              <TextField label="Subtitle" value={it.subtitle ?? ""} onChange={(v) => set({ subtitle: v })} />
            </FieldGrid>
            <TextAreaField label="Notes / talking points" value={it.notes ?? ""} onChange={(v) => set({ notes: v })} rows={2} />
          </div>
        )}
      />
    </div>
  );
}
