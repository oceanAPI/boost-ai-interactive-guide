"use client";

import { useEffect, useRef, useState } from "react";
import type { Customer } from "@/lib/types";
import { AdminPrompt, AdminChip, AdminChipRow, AdminMiniLabel } from "@/components/admin/primitives";
import {
  PLACEHOLDER_CUSTOMERS,
  searchPlaceholderCustomers,
  type PlaceholderCustomer,
} from "@/data/cs-placeholder-customers";
import {
  getDefaultPlanhatConnection,
  searchPlanhatCompanies,
  pullCustomer,
  saveOverride,
  type CompanyHit,
} from "@/app/actions/integrations";

/* ─── CSM customer entry ───
 *  Live Planhat customer search. When a Planhat connection is configured
 *  (admin /admin/integrations), typing a company name searches Planhat and
 *  picking a result PULLS that company through the saved field map,
 *  prefilling the engagement. Mapped fields Planhat has no value for are
 *  surfaced as "missing data" prompts; whatever the CSM fills there is
 *  persisted per-customer in Supabase and round-trips on the next pull.
 *
 *  With no connection (or no Planhat match) it falls back to the seeded
 *  placeholder customers so the builder still works offline.
 *
 *  Instances = the customer's AWS deployments we pull data from
 *  (selected_instance_ids), distinct from areas_of_interest (agent keys). */

function coerce(v: string): unknown {
  const s = v.trim();
  if (s === "") return s;
  if (s === "true") return true;
  if (s === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return v;
}

/** Deep-merge a pulled/override patch one level into the form so nested
 *  objects (e.g. performance.*) keep their other fields. */
function mergePatch(form: Customer, patch: Record<string, unknown>): Partial<Customer> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    const cur = (form as unknown as Record<string, unknown>)[k];
    if (
      v && typeof v === "object" && !Array.isArray(v) &&
      cur && typeof cur === "object" && !Array.isArray(cur)
    ) {
      out[k] = { ...(cur as Record<string, unknown>), ...(v as Record<string, unknown>) };
    } else {
      out[k] = v;
    }
  }
  return out as Partial<Customer>;
}

/** Build a nested patch object from one dot-path target + value. */
function pathToPatch(target: string, value: unknown): Record<string, unknown> {
  const parts = target.split(".");
  const root: Record<string, unknown> = {};
  let cur = root;
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] = {};
    cur = cur[parts[i]] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
  return root;
}

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

  // Live Planhat connection + search
  const [connId, setConnId] = useState<string | null>(null);
  const [connName, setConnName] = useState<string>("");
  const [planhatHits, setPlanhatHits] = useState<CompanyHit[]>([]);
  const [searching, setSearching] = useState(false);

  // Pull + missing-field state
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [pulling, setPulling] = useState(false);
  const [pullMsg, setPullMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [missing, setMissing] = useState<{ target: string; sourceLabel: string }[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingTarget, setSavingTarget] = useState<string | null>(null);

  // Discover the default Planhat connection once.
  useEffect(() => {
    let live = true;
    void getDefaultPlanhatConnection().then((res) => {
      if (!live) return;
      if (res.ok && res.data) {
        setConnId(res.data.id);
        setConnName(res.data.name);
      }
    });
    return () => {
      live = false;
    };
  }, []);

  // Debounced live search against Planhat when a connection exists.
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!connId || !open) return;
    const q = query.trim();
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      setSearching(true);
      void searchPlanhatCompanies(connId, q).then((res) => {
        setSearching(false);
        setPlanhatHits(res.ok ? res.data : []);
      });
    }, 300);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query, connId, open]);

  const placeholderResults = searchPlaceholderCustomers(query);
  const exactMatch = PLACEHOLDER_CUSTOMERS.find(
    (c) => c.company_name.toLowerCase() === (form.company_name ?? "").toLowerCase(),
  );

  const pickPlanhat = async (hit: CompanyHit) => {
    setOpen(false);
    setQuery(hit.name);
    setPulling(true);
    setPullMsg(null);
    const res = await pullCustomer(connId!, hit.id);
    setPulling(false);
    if (!res.ok) {
      setPullMsg({ ok: false, text: res.error });
      return;
    }
    update(mergePatch(form, res.data.patch));
    setCompanyId(res.data.company.id);
    setMissing(res.data.missing);
    setDrafts({});
    setPullMsg({
      ok: true,
      text: `Pulled ${res.data.appliedCount} field${res.data.appliedCount === 1 ? "" : "s"} from Planhat${
        res.data.missing.length ? ` · ${res.data.missing.length} to fill in` : ""
      }.`,
    });
  };

  const pickPlaceholder = (c: PlaceholderCustomer) => {
    const { handle: _handle, instances: _instances, ...customerFields } = c;
    void _handle;
    void _instances;
    update(customerFields);
    setQuery(c.company_name);
    setCompanyId(null);
    setMissing([]);
    setOpen(false);
  };

  const createFresh = () => {
    update({ company_name: query.trim() });
    setCompanyId(null);
    setMissing([]);
    setOpen(false);
  };

  const saveMissing = async (target: string) => {
    if (!connId || !companyId) return;
    const raw = drafts[target] ?? "";
    setSavingTarget(target);
    const res = await saveOverride({
      connectionId: connId,
      companyId,
      companyName: form.company_name ?? query.trim(),
      target,
      value: raw,
    });
    setSavingTarget(null);
    if (!res.ok) {
      setPullMsg({ ok: false, text: res.error });
      return;
    }
    if (raw.trim() !== "") {
      update(mergePatch(form, pathToPatch(target, coerce(raw))));
      setMissing((prev) => prev.filter((m) => m.target !== target));
    }
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
            placeholder={connId ? `Search Planhat (${connName})…` : "Search customers…"}
            className="w-full px-3 py-2 bg-white border border-boost-border rounded-lg text-[13px] text-boost-dark placeholder-boost-lavender focus:outline-none focus:ring-2 focus:ring-boost-green-light focus:border-transparent"
          />
          {open ? (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-boost-border bg-white shadow-lg overflow-hidden">
              {connId ? (
                <>
                  {searching ? (
                    <p className="px-3 py-2 text-[11px] text-boost-muted">Searching Planhat…</p>
                  ) : planhatHits.length > 0 ? (
                    <ul className="max-h-60 overflow-y-auto">
                      {planhatHits.map((hit) => (
                        <li key={hit.id}>
                          <button
                            type="button"
                            onClick={() => void pickPlanhat(hit)}
                            className="w-full text-left px-3 py-2 hover:bg-boost-surface/60 transition-colors flex items-center justify-between gap-2"
                          >
                            <span className="text-[13px] font-semibold text-boost-dark truncate">{hit.name}</span>
                            <span className="text-[10px] text-boost-muted shrink-0">Planhat · pull</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-3 py-2 text-[11px] text-boost-muted">
                      {query.trim() ? "No Planhat match." : "Type to search Planhat."}
                    </p>
                  )}
                  {query.trim() ? (
                    <button
                      type="button"
                      onClick={createFresh}
                      className="w-full text-left px-3 py-2 border-t border-boost-border/60 hover:bg-boost-surface/60 transition-colors"
                    >
                      <span className="text-[12px] font-semibold text-boost-dark">Create “{query.trim()}”</span>
                      <span className="block text-[10px] text-boost-muted mt-0.5">Fresh engagement — no Planhat pull</span>
                    </button>
                  ) : null}
                </>
              ) : placeholderResults.length > 0 ? (
                <ul className="max-h-60 overflow-y-auto">
                  {placeholderResults.map((c) => (
                    <li key={c.handle}>
                      <button
                        type="button"
                        onClick={() => pickPlaceholder(c)}
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
        {pulling ? (
          <p className="text-[11px] text-boost-muted mt-1.5">Pulling from Planhat…</p>
        ) : pullMsg ? (
          <p className={"text-[11px] mt-1.5 " + (pullMsg.ok ? "text-boost-green" : "text-boost-orange")}>
            {pullMsg.text}
          </p>
        ) : exactMatch ? (
          <p className="text-[11px] text-boost-green mt-1.5">
            Prefilled from {exactMatch.company_name}&rsquo;s existing data.
          </p>
        ) : form.company_name ? (
          <p className="text-[11px] text-boost-muted mt-1.5">Fresh engagement — no existing metadata.</p>
        ) : null}
      </div>

      {/* Missing data — mapped fields Planhat had no value for */}
      {companyId && missing.length > 0 ? (
        <div>
          <AdminPrompt
            question="Missing data"
            helper="These fields are mapped from Planhat but came back empty. Fill them in — values are saved on this customer and reused on the next pull."
          />
          <div className="space-y-2">
            {missing.map((m) => (
              <div key={m.target} className="flex items-center gap-2">
                <span
                  className="w-1/2 min-w-0 truncate text-[12px] font-mono text-boost-dark"
                  title={`${m.target} ← ${m.sourceLabel}`}
                >
                  {m.target}
                </span>
                <input
                  type="text"
                  value={drafts[m.target] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [m.target]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void saveMissing(m.target); } }}
                  placeholder="value…"
                  className="flex-1 min-w-0 px-2.5 py-1.5 bg-white border border-boost-border rounded-md text-[12px] text-boost-dark placeholder-boost-lavender focus:outline-none focus:ring-2 focus:ring-boost-green-light"
                />
                <button
                  type="button"
                  onClick={() => void saveMissing(m.target)}
                  disabled={savingTarget === m.target}
                  className="shrink-0 rounded-md border border-boost-border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-boost-dark hover:bg-boost-surface disabled:opacity-40 transition-colors"
                >
                  {savingTarget === m.target ? "…" : "Save"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

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
