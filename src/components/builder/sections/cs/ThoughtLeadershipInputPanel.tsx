"use client";

import type { Customer, ThoughtLeadershipStat } from "@/lib/types";
import { TextField, TextAreaField, ListEditor, FieldGrid } from "./_fields";
import { AdminPrompt } from "@/components/admin/primitives";
import { THOUGHT_LEADERSHIP_DEFAULTS } from "@/data/thought-leadership";

/* Authors `thought_leadership` — the big-number story openers. Starts
 * empty (the section falls back to the boost.ai defaults when unset);
 * "Load boost.ai story" seeds the deck stats so the CSM can tweak. */
export function ThoughtLeadershipInputPanel({
  form,
  update,
}: {
  form: Customer;
  update: (patch: Partial<Customer>) => void;
}) {
  const items = form.thought_leadership ?? [];

  return (
    <div className="space-y-3">
      <AdminPrompt
        question="Story stats"
        helper={
          items.length === 0
            ? "Empty uses the boost.ai market story by default. Load it to customise the numbers for this customer."
            : "Headline + hero figure + a data-driven sentence. These open the engagement narrative."
        }
        action={
          items.length === 0 ? (
            <button
              type="button"
              onClick={() => update({ thought_leadership: THOUGHT_LEADERSHIP_DEFAULTS.map((s) => ({ ...s })) })}
              className="rounded-lg border border-boost-border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-boost-dark hover:bg-boost-surface transition-colors whitespace-nowrap"
            >
              Load boost.ai story
            </button>
          ) : undefined
        }
      />

      <ListEditor<ThoughtLeadershipStat>
        items={items}
        onChange={(next) => update({ thought_leadership: next })}
        makeNew={() => ({ headline: "", stat: "", narrative: "" })}
        addLabel="Add story stat"
        emptyHint="No custom stats — the section shows the boost.ai default story."
        itemTitle={(s) => s.headline || "Stat"}
        renderItem={(s, set) => (
          <div className="space-y-2.5">
            <FieldGrid>
              <TextField label="Headline" value={s.headline} onChange={(v) => set({ headline: v })} placeholder="Agentic" />
              <TextField label="Hero figure" value={s.stat} onChange={(v) => set({ stat: v })} placeholder="88%" />
            </FieldGrid>
            <TextAreaField
              label="Narrative"
              value={s.narrative}
              onChange={(v) => set({ narrative: v })}
              placeholder="91% of our customers have LLM features in production today…"
              rows={2}
            />
          </div>
        )}
      />
    </div>
  );
}
