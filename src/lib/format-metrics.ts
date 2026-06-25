/* ──────────────────────────────────────────────────────────────
 *  Percent-metric normalisation.
 *
 *  Some sources (e.g. a Planhat custom field, or a CSV-derived rate)
 *  deliver automation / unknown / escalation rates as a 0–1 ratio
 *  rather than a 0–100 percentage. Rendered raw next to a "%" unit
 *  that shows up as "0.404387%" instead of "40.4%".
 *
 *  For these three rates a genuine percentage is always ≥ 1, so any
 *  value in (0, 1] is treated as a ratio and scaled ×100. Sections
 *  that render percent metrics call `normalizePercentMetrics` on the
 *  customer's `performance` once, so every downstream read is coherent.
 * ────────────────────────────────────────────────────────────── */

import type { PerformanceMetrics } from "@/lib/types";

/** Percent-typed PerformanceMetrics keys (current + previous period). */
const PERCENT_KEYS: (keyof PerformanceMetrics)[] = [
  "automation_rate",
  "previous_automation_rate",
  "unknown_rate",
  "previous_unknown_rate",
  "escalation_rate",
  "previous_escalation_rate",
];

/** Coerce a percent-typed value onto the 0–100 scale: a 0–1 ratio
 *  becomes a percentage, an already-percent value is left untouched. */
export function toPercent(value: number): number {
  return value > 0 && value <= 1 ? value * 100 : value;
}

/** `toPercent` + clean rounding for display (≤1 dp, no trailing ".0").
 *  Callers append their own "%" unit. */
export function roundPercent(value: number): string {
  const v = toPercent(value);
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

/** Return the metrics with every percent-typed field coerced to the
 *  0–100 scale. Returns the original object unchanged when nothing
 *  needs scaling (no allocation in the common, already-percent case). */
export function normalizePercentMetrics(
  perf: PerformanceMetrics,
): PerformanceMetrics {
  let out = perf;
  for (const key of PERCENT_KEYS) {
    const v = out[key];
    if (typeof v === "number" && v > 0 && v <= 1) {
      out = { ...out, [key]: v * 100 };
    }
  }
  return out;
}
