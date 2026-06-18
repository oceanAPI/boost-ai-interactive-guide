"use client";

import { useState } from "react";
import type { Customer } from "@/lib/types";
import { AdminPrompt, AdminChip, AdminChipRow, AdminMiniLabel } from "@/components/admin/primitives";
import {
  PLACEHOLDER_CUSTOMERS,
  searchPlaceholderCustomers,
  type PlaceholderCustomer,
} from "@/data/cs-placeholder-customers";

/* ─── CSM customer entry ───
 *  Planhat-style customer search (the real API lands later). Typing a
 *  company name surfaces matching customers; picking one prefills the
 *  whole engagement from their metadata (CE slices rain into the rail).
 *  No match → create a fresh engagement with no existing data.
 *
 *  The "areas of interest" textarea is replaced by an instance picker:
 *  an "instance" is the customer's boost.ai/AWS deployment where their
 *  data lives. When a known customer is picked, their instances show as
 *  toggle chips (all on by default); each selected instance is the hook
 *  for the (future) AWS API fetch that dynamically populates the
 *  sections. Selected ids write to `selected_instance_ids` — distinct
 *  from `areas_of_interest` (agent keys, part of the fetched metadata). */
export function CompanyInputPanel({
  form,
  update,
}: {
  form: Customer;
  update: (patch: Partial<Customer>) => void;
}) {
  const [query, setQuery] = useState(form.company_name ?? "");
  const [open, setOpen] = useState(false);
  const [newInstance, setNewInstance] = useState("");

  const results = searchPlaceholderCustomers(query);
  const exactMatch = PLACEHOLDER_CUSTOMERS.find(
    (c) => c.company_name.toLowerCase() === (form.company_name ?? "").toLowerCase(),
  );
  const typedHasNoMatch = query.trim().length > 0 && results.length === 0;

  const pick = (c: PlaceholderCustomer) => {
    // Spread the whole customer into the form (minus the picker-only
    // fields). The rail auto-populates from the new hasContent flags.
    const { handle: _handle, instances: _instances, ...customerFields } = c;
    void _handle;
    void _instances;
    update(customerFields);
    setQuery(c.company_name);
    setOpen(false);
  };

  const createFresh = () => {
    update({ company_name: query.trim() });
    setOpen(false);
  };

  const selected = new Set(form.selected_instance_ids ?? []);
  const toggleInstance = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    update({ selected_instance_ids: [...next] });
  };
  const addManualInstance = () => {
    const k = newInstance.trim();
    if (!k || selected.has(k)) return;
    update({ selected_instance_ids: [...selected, k] });
    setNewInstance("");
  };

  return (
    <div className="space-y-4">
      {/* Customer search */}
      <div>
        <AdminMiniLabel className="mb-1">Customer</AdminMiniLabel>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Search customers (Planhat)…"
            className="w-full px-3 py-2 bg-white border border-boost-border rounded-lg text-[13px] text-boost-dark placeholder-boost-lavender focus:outline-none focus:ring-2 focus:ring-boost-green-light focus:border-transparent"
          />
          {open ? (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-boost-border bg-white shadow-lg overflow-hidden">
              {results.length > 0 ? (
                <ul className="max-h-60 overflow-y-auto">
                  {results.map((c) => (
                    <li key={c.handle}>
                      <button
                        type="button"
                        onClick={() => pick(c)}
                        className="w-full text-left px-3 py-2 hover:bg-boost-surface/60 transition-colors flex items-center justify-between gap-2"
                      >
                        <span className="text-[13px] font-semibold text-boost-dark">{c.company_name}</span>
                        <span className="text-[10px] text-boost-muted">{c.instances.length} agents · existing data</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <button
                  type="button"
                  onClick={createFresh}
                  className="w-full text-left px-3 py-2.5 hover:bg-boost-surface/60 transition-colors"
                >
                  <span className="text-[13px] font-semibold text-boost-dark">Create “{query.trim()}”</span>
                  <span className="block text-[10px] text-boost-muted mt-0.5">No existing customer — start a fresh engagement</span>
                </button>
              )}
            </div>
          ) : null}
        </div>
        {exactMatch ? (
          <p className="text-[11px] text-boost-green mt-1.5">
            Prefilled from {exactMatch.company_name}&rsquo;s existing data.
          </p>
        ) : form.company_name ? (
          <p className="text-[11px] text-boost-muted mt-1.5">Fresh engagement — no existing metadata.</p>
        ) : null}
      </div>

      {/* Instance / agent picker */}
      <div>
        <AdminPrompt
          question="Instances"
          helper="The customer's AWS instances we pull data from. Each selected instance feeds metadata into the sections below."
        />
        {exactMatch ? (
          <AdminChipRow>
            {exactMatch.instances.map((inst) => (
              <AdminChip
                key={inst.key}
                active={selected.has(inst.key)}
                onClick={() => toggleInstance(inst.key)}
                title={inst.region ? `${inst.key} · ${inst.region}` : inst.key}
              >
                {inst.label}
              </AdminChip>
            ))}
          </AdminChipRow>
        ) : (
          <div className="space-y-2">
            {selected.size > 0 ? (
              <AdminChipRow>
                {[...selected].map((key) => (
                  <AdminChip key={key} active onClick={() => toggleInstance(key)}>
                    {key}
                  </AdminChip>
                ))}
              </AdminChipRow>
            ) : (
              <p className="text-[12px] text-boost-muted/80 italic">No instances yet — add the AWS instance ids to pull data from.</p>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newInstance}
                onChange={(e) => setNewInstance(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addManualInstance(); } }}
                placeholder="e.g. acme-prod-eu"
                className="flex-1 px-3 py-2 bg-white border border-boost-border rounded-lg text-[13px] text-boost-dark placeholder-boost-lavender focus:outline-none focus:ring-2 focus:ring-boost-green-light focus:border-transparent"
              />
              <button
                type="button"
                onClick={addManualInstance}
                className="flex-shrink-0 rounded-lg border border-boost-border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-boost-dark hover:bg-boost-surface transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
