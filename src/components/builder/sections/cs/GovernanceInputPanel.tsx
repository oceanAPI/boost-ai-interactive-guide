"use client";

import type { Customer, GovernanceCadence } from "@/lib/types";
import { TextField, SelectField, TextAreaField, LinesField, ListEditor, FieldGrid } from "./_fields";
import { AdminPrompt } from "@/components/admin/primitives";

type Stakeholder = NonNullable<GovernanceCadence["stakeholders"]>[number];

/* Authors `governance` — review cadence + executive sponsor + the
 * last/next BR context surfaced by GovernanceSection. */
export function GovernanceInputPanel({
  form,
  update,
}: {
  form: Customer;
  update: (patch: Partial<Customer>) => void;
}) {
  const g: GovernanceCadence = form.governance ?? {};
  const setG = (patch: Partial<GovernanceCadence>) =>
    update({ governance: { ...g, ...patch } });

  return (
    <div className="space-y-3">
      <FieldGrid cols={3}>
        <SelectField
          label="Executive review"
          value={g.executive_review_frequency}
          onChange={(v) => setG({ executive_review_frequency: v })}
          options={[
            { value: "annual", label: "Annual" },
            { value: "semi-annual", label: "Semi-annual" },
            { value: "quarterly", label: "Quarterly" },
          ]}
        />
        <SelectField
          label="Business review"
          value={g.business_review_frequency}
          onChange={(v) => setG({ business_review_frequency: v })}
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "quarterly", label: "Quarterly" },
            { value: "semi-annual", label: "Semi-annual" },
          ]}
        />
        <SelectField
          label="Operational review"
          value={g.operational_review_frequency}
          onChange={(v) => setG({ operational_review_frequency: v })}
          options={[
            { value: "weekly", label: "Weekly" },
            { value: "biweekly", label: "Biweekly" },
            { value: "monthly", label: "Monthly" },
          ]}
        />
      </FieldGrid>

      <TextField
        label="Executive sponsor (fallback)"
        value={g.executive_sponsor ?? ""}
        onChange={(v) => setG({ executive_sponsor: v })}
        placeholder="Used if no stakeholder is flagged sponsor"
      />

      <FieldGrid>
        <TextField label="Last business review" type="date" value={g.last_business_review ?? ""} onChange={(v) => setG({ last_business_review: v })} />
        <TextField label="Next business review" type="date" value={g.next_business_review ?? ""} onChange={(v) => setG({ next_business_review: v })} />
      </FieldGrid>

      <TextAreaField
        label="Last BR — what was agreed"
        value={g.last_business_review_summary ?? ""}
        onChange={(v) => setG({ last_business_review_summary: v })}
        rows={2}
      />
      <LinesField
        label="Next BR — focus topics (one per line)"
        value={g.next_business_review_focus}
        onChange={(v) => setG({ next_business_review_focus: v })}
      />

      <AdminPrompt question="Stakeholders" helper="Flag one as sponsor for the escalation / BR-invitee card." divider />
      <ListEditor<Stakeholder>
        items={g.stakeholders ?? []}
        onChange={(items) => setG({ stakeholders: items })}
        makeNew={() => ({ name: "" })}
        addLabel="Add stakeholder"
        emptyHint="No stakeholders yet."
        itemTitle={(s) => s.name || "Stakeholder"}
        renderItem={(s, set) => (
          <div className="space-y-2.5">
            <FieldGrid>
              <TextField label="Name" value={s.name} onChange={(v) => set({ name: v })} />
              <TextField label="Role" value={s.role ?? ""} onChange={(v) => set({ role: v })} />
              <TextField label="Email" type="email" value={s.email ?? ""} onChange={(v) => set({ email: v })} />
              <TextField label="Phone" value={s.phone ?? ""} onChange={(v) => set({ phone: v })} />
            </FieldGrid>
            <label className="flex items-center gap-2 text-[12px] text-boost-dark cursor-pointer">
              <input
                type="checkbox"
                checked={!!s.is_sponsor}
                onChange={(e) => set({ is_sponsor: e.target.checked })}
                className="accent-boost-purple"
              />
              Executive sponsor
            </label>
          </div>
        )}
      />
    </div>
  );
}
