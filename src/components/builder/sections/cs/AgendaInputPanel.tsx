"use client";

import { useEffect, useRef } from "react";
import type { Customer, BrContext, AgendaItem } from "@/lib/types";
import { TextField, TextAreaField, SelectField, LinesField, ListEditor, FieldGrid } from "./_fields";
import { AdminPrompt } from "@/components/admin/primitives";
import { CS_WORKSPACE } from "@/components/builder/workspace-config";

/* Authors br_context — the meeting opener + agenda rows. The agenda is
 * the LAST step before generating, so it auto-fills from the sections
 * that already have content (one row per filled chapter); the CSM can
 * then reorder / reword / add timings. */
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

  /** Derive agenda rows from the chapters that hold content (skipping
   *  company + agenda itself). */
  const deriveItems = (): AgendaItem[] =>
    CS_WORKSPACE.sections
      .filter((s) => s.id !== "company" && s.id !== "agenda" && s.hasContent(form))
      .map((s) => ({ topic: s.title }));

  const autoFill = () => setBr({ agenda_items: deriveItems(), agenda_style: br.agenda_style ?? "numbered" });

  // Auto-fill once on first open when nothing is captured yet.
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    if ((br.agenda_items?.length ?? 0) === 0) {
      const derived = deriveItems();
      if (derived.length > 0) setBr({ agenda_items: derived, agenda_style: br.agenda_style ?? "numbered" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <AdminPrompt
        question="Agenda"
        helper="Auto-filled from the chapters you've completed. Reorder or reword as needed."
        action={
          <button
            type="button"
            onClick={autoFill}
            className="rounded-lg border border-boost-border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-boost-dark hover:bg-boost-surface transition-colors whitespace-nowrap"
          >
            Auto-fill from engagement
          </button>
        }
      />
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
