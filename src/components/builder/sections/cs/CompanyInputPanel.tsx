"use client";

import type { Customer } from "@/lib/types";
import { TextField, LinesField, FieldGrid } from "./_fields";

/* Manual customer identity entry for the CSM workspace. No Planhat /
 * fixture pull yet (Phase C) — the CSM types the basics. `company_url`
 * drives the Brandfetch logo in the rail; `areas_of_interest` keys the
 * agent-scoped panels (SWOT / UAT) downstream. */
export function CompanyInputPanel({
  form,
  update,
}: {
  form: Customer;
  update: (patch: Partial<Customer>) => void;
}) {
  return (
    <div className="space-y-3">
      <FieldGrid>
        <TextField
          label="Company name"
          value={form.company_name ?? ""}
          onChange={(v) => update({ company_name: v })}
          placeholder="H&M"
        />
        <TextField
          label="Website / domain"
          value={form.company_url ?? ""}
          onChange={(v) => update({ company_url: v })}
          placeholder="hm.com"
        />
      </FieldGrid>
      <FieldGrid>
        <TextField
          label="Main contact"
          value={form.contact_name ?? ""}
          onChange={(v) => update({ contact_name: v })}
          placeholder="Jane Doe"
        />
        <TextField
          label="Contact role"
          value={form.contact_role ?? ""}
          onChange={(v) => update({ contact_role: v })}
          placeholder="Head of CX"
        />
      </FieldGrid>
      <LinesField
        label="Areas of interest / live agents (one per line)"
        value={form.areas_of_interest}
        onChange={(v) => update({ areas_of_interest: v })}
        placeholder={"Order status\nReturns\nCard operations"}
        rows={4}
      />
    </div>
  );
}
