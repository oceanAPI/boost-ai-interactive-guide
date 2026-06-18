"use client";

import type { Customer, RevenueStory } from "@/lib/types";
import { TextField, TextAreaField, LinesField, ListEditor, FieldGrid } from "./_fields";
import { AdminPrompt } from "@/components/admin/primitives";

type Metric = NonNullable<RevenueStory["lead_metrics"]>[number];
type Journey = NonNullable<RevenueStory["sell_journeys"]>[number];

/* Authors `revenue_story` — lead-gen metric tiles, the proactivity
 * note, and sell-via-agent user journeys. */
export function RevenueInputPanel({
  form,
  update,
}: {
  form: Customer;
  update: (patch: Partial<Customer>) => void;
}) {
  const story: RevenueStory = form.revenue_story ?? {};
  const setStory = (patch: Partial<RevenueStory>) => update({ revenue_story: { ...story, ...patch } });

  return (
    <div className="space-y-3">
      <TextAreaField
        label="Proactivity note"
        value={story.proactivity_note ?? ""}
        onChange={(v) => setStory({ proactivity_note: v })}
        placeholder="The AI Agent surfaces proactively on the policy page, offering advice with no obligation."
        rows={2}
      />

      <AdminPrompt question="Lead metrics" helper="Headline revenue/lead tiles." divider />
      <ListEditor<Metric>
        items={story.lead_metrics ?? []}
        onChange={(items) => setStory({ lead_metrics: items })}
        makeNew={() => ({ value: "", label: "" })}
        addLabel="Add metric"
        emptyHint="No lead metrics yet."
        itemTitle={(m) => m.label || "Metric"}
        renderItem={(m, set) => (
          <FieldGrid cols={3}>
            <TextField label="Value" value={m.value} onChange={(v) => set({ value: v })} placeholder="42%" />
            <TextField label="Label" value={m.label} onChange={(v) => set({ label: v })} placeholder="Higher lead conversion" />
            <TextField label="Sublabel" value={m.sublabel ?? ""} onChange={(v) => set({ sublabel: v })} placeholder="with the AI Agent" />
          </FieldGrid>
        )}
      />

      <AdminPrompt question="Sell-via-agent journeys" helper="Each step renders as a flow." divider />
      <ListEditor<Journey>
        items={story.sell_journeys ?? []}
        onChange={(items) => setStory({ sell_journeys: items })}
        makeNew={() => ({ title: "", steps: [] })}
        addLabel="Add journey"
        emptyHint="No sell journeys yet."
        itemTitle={(j) => j.title || "Journey"}
        renderItem={(j, set) => (
          <div className="space-y-2.5">
            <TextField label="Title" value={j.title} onChange={(v) => set({ title: v })} placeholder="Sell products via the AI Agent" />
            <LinesField
              label="Steps (one per line)"
              value={j.steps}
              onChange={(v) => set({ steps: v })}
              placeholder={"intent recognition\nhelp select best fit\nlogin + email\nporting help\norder link"}
              rows={4}
            />
          </div>
        )}
      />
    </div>
  );
}
