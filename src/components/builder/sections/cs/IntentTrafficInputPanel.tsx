"use client";

import { useRef, useState } from "react";
import type { Customer } from "@/lib/types";
import { parseIntentTrafficCsv, pct } from "@/data/intent-traffic";
import { AdminPrompt, AdminMiniLabel } from "@/components/admin/primitives";

/* Authors `intent_traffic` — the compact rollup of a boost.ai
 * intent-traffic export. The CSM uploads (or pastes) the raw CSV; we
 * parse it client-side and persist ONLY the summary (totals + per-root
 * top intents), because the raw export is thousands of rows — far past
 * the URL-fragment ceiling the whole app round-trips through. */
export function IntentTrafficInputPanel({
  form,
  update,
}: {
  form: Customer;
  update: (patch: Partial<Customer>) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [paste, setPaste] = useState("");
  const [error, setError] = useState<string | null>(null);

  const data = form.intent_traffic;

  /* Rates the CSV can fill on the existing Performance section, derived
   * from the rollup (reviewed = the split denominator). Stored 0–100 to
   * match PerformanceMetrics. */
  const derived = data
    ? {
        automation_rate:
          data.totals.reviewed > 0
            ? Math.round(pct(data.totals.automated, data.totals.reviewed))
            : undefined,
        unknown_rate:
          data.totals.traffic > 0
            ? Math.round(pct(data.totals.noPrediction, data.totals.traffic))
            : undefined,
      }
    : null;
  const perf = form.performance ?? {};
  const canApply =
    !!derived &&
    ((derived.automation_rate != null && perf.automation_rate == null) ||
      (derived.unknown_rate != null && perf.unknown_rate == null));
  const applyToPerformance = () => {
    if (!derived) return;
    const patch: typeof perf = { ...perf };
    if (derived.automation_rate != null && perf.automation_rate == null)
      patch.automation_rate = derived.automation_rate;
    if (derived.unknown_rate != null && perf.unknown_rate == null)
      patch.unknown_rate = derived.unknown_rate;
    update({ performance: patch });
  };

  const ingest = (text: string, source?: string) => {
    const { summary, error } = parseIntentTrafficCsv(text, { source });
    if (error || !summary) {
      setError(error ?? "Couldn't parse that file.");
      return;
    }
    setError(null);
    setPaste("");
    update({ intent_traffic: summary });
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      ingest(text, file.name);
    } catch {
      setError("Couldn't read that file.");
    }
  };

  return (
    <div className="space-y-3">
      <AdminPrompt
        question="Intent-traffic export"
        helper="Upload the boost.ai intent-traffic CSV (the analytics “intent_traffic” tab). It's parsed in your browser — only a compact summary is saved, never the raw rows."
      />

      {/* Upload */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-boost-border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-boost-muted hover:text-boost-purple hover:border-boost-purple/40 transition-colors"
        >
          <span aria-hidden="true">↑</span> Upload CSV
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {data && (
          <button
            type="button"
            onClick={() => {
              update({ intent_traffic: undefined });
              setError(null);
            }}
            className="text-[10px] font-semibold uppercase tracking-[0.12em] text-boost-muted hover:text-boost-gold transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Paste fallback */}
      <div>
        <AdminMiniLabel className="mb-1">Or paste CSV</AdminMiniLabel>
        <textarea
          value={paste}
          rows={3}
          onChange={(e) => setPaste(e.target.value)}
          placeholder="Root intent,Intent,Traffic,…"
          className="w-full px-3 py-2 bg-white border border-boost-border rounded-lg text-[12px] font-mono text-boost-dark placeholder-boost-lavender focus:outline-none focus:ring-2 focus:ring-boost-green-light focus:border-transparent transition-shadow resize-y"
        />
        {paste.trim() && (
          <button
            type="button"
            onClick={() => ingest(paste, "pasted")}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-boost-green-light/50 bg-boost-green-light/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-boost-green hover:bg-boost-green-light/20 transition-colors"
          >
            Parse pasted CSV
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-boost-orange/40 bg-boost-orange/10 px-3 py-2 text-[12px] text-boost-orange">
          {error}
        </p>
      )}

      {/* Parsed summary */}
      {data && (
        <div className="rounded-xl border border-boost-green-light/40 bg-boost-green-light/[0.06] p-3.5 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <AdminMiniLabel className="text-boost-green">Parsed ✓</AdminMiniLabel>
            <span className="text-[10px] text-boost-muted truncate">
              {data.source}
              {data.period ? ` · ${data.period}` : ""}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <Stat label="Conversations" value={data.totals.traffic.toLocaleString("en-US")} />
            <Stat
              label="Automated"
              value={`${pct(data.totals.automated, data.totals.reviewed).toFixed(0)}%`}
            />
            <Stat
              label="Unsolved"
              value={`${pct(data.totals.unsolved, data.totals.reviewed).toFixed(0)}%`}
            />
          </div>
          <p className="text-[11px] text-boost-muted">
            {data.intentCount.toLocaleString("en-US")} intents rolled up into{" "}
            {data.roots.length} categories (top intents per category kept).
          </p>

          {/* Flow the rollup into the existing Performance section — only
              offered when it would fill a metric that's still blank, so a
              CSM's hand-entered numbers are never overwritten. */}
          {canApply && (
            <div className="border-t border-boost-green-light/30 pt-2.5">
              <button
                type="button"
                onClick={applyToPerformance}
                className="inline-flex items-center gap-1.5 rounded-lg border border-boost-purple/40 bg-boost-purple/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-boost-purple hover:bg-boost-purple/10 transition-colors"
              >
                <span aria-hidden="true">→</span> Apply to Performance
              </button>
              <p className="mt-1.5 text-[10px] text-boost-muted leading-relaxed">
                Fills{" "}
                {[
                  derived?.automation_rate != null && perf.automation_rate == null
                    ? `${derived.automation_rate}% automation`
                    : null,
                  derived?.unknown_rate != null && perf.unknown_rate == null
                    ? `${derived.unknown_rate}% unknown`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}{" "}
                on the Performance section. Won&apos;t overwrite numbers you&apos;ve already entered.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-boost-border bg-white px-2.5 py-2">
      <div className="text-base font-bold tabular-nums text-boost-dark leading-none">
        {value}
      </div>
      <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-boost-muted">
        {label}
      </div>
    </div>
  );
}
