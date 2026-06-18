"use client";

import { useState } from "react";
import type { Customer, AcceptedInitiative } from "@/lib/types";
import { TextField, TextAreaField, SelectField, NumberField, ListEditor, FieldGrid, RAG_OPTIONS } from "./_fields";
import { AdminMiniLabel } from "@/components/admin/primitives";

/* Authors `accepted_initiatives` — the committed success plan. Each
 * initiative carries an append-only `progress_history`: the CSM logs
 * one entry per BR/session so a returning customer's initiatives show
 * how they've moved since the last meeting. */
export function SuccessPlanInputPanel({
  form,
  update,
}: {
  form: Customer;
  update: (patch: Partial<Customer>) => void;
}) {
  return (
    <ListEditor<AcceptedInitiative>
      items={form.accepted_initiatives ?? []}
      onChange={(items) => update({ accepted_initiatives: items })}
      makeNew={() => ({
        initiative_id: `init-${Date.now()}`,
        issue_id: "",
        accepted_at: new Date().toISOString(),
        accepted_by: "",
        status: "accepted",
      })}
      addLabel="Add initiative"
      emptyHint="No initiatives yet."
      itemTitle={(it) => it.title || it.initiative_id || "Initiative"}
      renderItem={(it, set) => (
        <div className="space-y-2.5">
          <TextField label="Title" value={it.title ?? ""} onChange={(v) => set({ title: v })} placeholder="Roll out returns agent to SE + FI" />
          <FieldGrid cols={3}>
            <SelectField
              label="Status"
              value={it.status}
              onChange={(v) => set({ status: v ?? "accepted" })}
              options={[
                { value: "proposed", label: "Proposed" },
                { value: "accepted", label: "Accepted" },
                { value: "in-progress", label: "In progress" },
                { value: "done", label: "Done" },
                { value: "dropped", label: "Dropped" },
              ]}
            />
            <SelectField label="RAG" value={it.rag_status} onChange={(v) => set({ rag_status: v })} options={RAG_OPTIONS} />
            <TextField label="Theme" value={it.theme ?? ""} onChange={(v) => set({ theme: v })} placeholder="automation" />
          </FieldGrid>
          <FieldGrid cols={3}>
            <TextField label="Owner" value={it.owner ?? ""} onChange={(v) => set({ owner: v })} />
            <TextField label="Target quarter" value={it.target_quarter ?? ""} onChange={(v) => set({ target_quarter: v })} placeholder="2026-Q2" />
            <TextField label="Issue ID" value={it.issue_id} onChange={(v) => set({ issue_id: v })} />
          </FieldGrid>
          <FieldGrid>
            <TextField label="Start date" type="date" value={it.start_date ?? ""} onChange={(v) => set({ start_date: v })} />
            <TextField label="End date" type="date" value={it.end_date ?? ""} onChange={(v) => set({ end_date: v })} />
          </FieldGrid>
          <TextField label="Business impact" value={it.business_impact ?? ""} onChange={(v) => set({ business_impact: v })} />
          <TextAreaField label="Notes" value={it.notes ?? ""} onChange={(v) => set({ notes: v })} rows={2} />

          <ProgressLog
            history={it.progress_history ?? []}
            onAppend={(entry) => set({ progress_history: [...(it.progress_history ?? []), entry] })}
          />
        </div>
      )}
    />
  );
}

/* Append-only progress logger. Shows the existing trail (most-recent
 * last) and a small form to log a new entry for this session. Entries
 * are never edited or removed here — the history stays honest. */
function ProgressLog({
  history,
  onAppend,
}: {
  history: NonNullable<AcceptedInitiative["progress_history"]>;
  onAppend: (entry: NonNullable<AcceptedInitiative["progress_history"]>[number]) => void;
}) {
  const [rag, setRag] = useState<"green" | "amber" | "red">("green");
  const [percent, setPercent] = useState<number | undefined>(undefined);
  const [note, setNote] = useState("");

  const dotColor = (s: string) =>
    s === "green" ? "bg-boost-green-light" : s === "amber" ? "bg-boost-gold" : "bg-boost-orange";

  const log = () => {
    onAppend({
      date: new Date().toISOString(),
      rag_status: rag,
      percent_complete: percent,
      note: note.trim() || undefined,
    });
    setNote("");
    setPercent(undefined);
  };

  return (
    <div className="rounded-lg border border-boost-border/70 bg-white/60 p-3 mt-1">
      <AdminMiniLabel className="mb-2">Progress over time</AdminMiniLabel>
      {history.length === 0 ? (
        <p className="text-[11px] text-boost-muted/80 italic mb-2.5">
          No progress logged yet. Log a snapshot each session to track movement.
        </p>
      ) : (
        <ul className="space-y-1.5 mb-3">
          {history.map((h, i) => (
            <li key={i} className="flex items-center gap-2 text-[11px] text-boost-dark">
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor(h.rag_status)}`} />
              <span className="text-boost-muted tabular-nums">
                {new Date(h.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </span>
              {h.percent_complete != null ? <span className="font-semibold tabular-nums">{h.percent_complete}%</span> : null}
              {h.note ? <span className="text-boost-muted/90 truncate">· {h.note}</span> : null}
            </li>
          ))}
        </ul>
      )}
      <div className="grid grid-cols-[auto_auto_1fr_auto] gap-2 items-end">
        <label className="block">
          <AdminMiniLabel className="mb-1">RAG</AdminMiniLabel>
          <select
            value={rag}
            onChange={(e) => setRag(e.target.value as "green" | "amber" | "red")}
            className="px-2 py-1.5 bg-white border border-boost-border rounded-lg text-[12px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-boost-green-light"
          >
            {RAG_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="block w-16">
          <AdminMiniLabel className="mb-1">%</AdminMiniLabel>
          <input
            type="number"
            min={0}
            max={100}
            value={percent ?? ""}
            onChange={(e) => setPercent(e.target.value === "" ? undefined : Number(e.target.value))}
            className="w-full px-2 py-1.5 bg-white border border-boost-border rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-boost-green-light"
          />
        </label>
        <label className="block">
          <AdminMiniLabel className="mb-1">Note</AdminMiniLabel>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Moved from amber → green after SE launch"
            className="w-full px-2 py-1.5 bg-white border border-boost-border rounded-lg text-[12px] placeholder-boost-lavender focus:outline-none focus:ring-2 focus:ring-boost-green-light"
          />
        </label>
        <button
          type="button"
          onClick={log}
          className="rounded-lg bg-boost-purple px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white hover:bg-boost-purple/90 transition-colors"
        >
          Log
        </button>
      </div>
    </div>
  );
}
