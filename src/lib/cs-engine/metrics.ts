/**
 * CS Decision Engine — metrics mapper.
 *
 * Translates what the guide already knows about a customer — the CE-authored
 * `performance` telemetry and the parsed intent-traffic export — into the
 * engine's `CustomerMetrics` input. Best-effort: only fields we can derive with
 * confidence are set; everything else stays `undefined` so the missing-data
 * prompts (and boolean-issue skipping via `metricsSet`) fire downstream.
 *
 * Source precedence: explicit CE `performance` values win over values derived
 * from the intent-traffic rollup, since performance is hand-authored for the BR.
 */

import type { Customer } from "@/lib/types";
import type { CustomerMetrics } from "./detection";
import type { HierarchyContext } from "./calculator";

export interface MappedMetrics {
  metrics: CustomerMetrics;
  /** Which numeric/boolean fields were actually set, for `metricsSet`. */
  metricsSet: Record<string, boolean>;
  hierarchy: HierarchyContext;
}

/** Clamp to [0,1]; returns undefined for non-finite input. */
function rate01(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(1, value));
}

/** A percentage stored 0–100 → a 0–1 rate. */
function pctToRate(pct: number | undefined): number | undefined {
  if (pct === undefined || !Number.isFinite(pct)) return undefined;
  return rate01(pct / 100);
}

/** Normalise a CSAT score onto the engine's 1–10 scale. Values ≤ 5 are
 *  assumed to be on a 1–5 scale and doubled; values > 5 pass through. */
function normaliseCsat(score: number | undefined): number | undefined {
  if (score === undefined || !Number.isFinite(score)) return undefined;
  return score <= 5 ? score * 2 : score;
}

export function metricsFromCustomer(customer: Customer): MappedMetrics {
  const metrics: CustomerMetrics = {
    // Booleans the engine needs defined; we don't yet infer these from data,
    // so they stay at their non-asserting defaults and are reported as "not set".
    exportApiEnabled: false,
    authenticationEnabled: false,
    llmEnabled: false,
    humanChatEnabled: false,
    voiceEnabled: false,
    proactivityEnabled: false,
    customPanel: false,
    hasApiIntegrations: false,
    hasMainStakeholder: false,
    hasAiTrainer: false,
    hasSharedRoadmap: false,
    hasTechnicalResource: false,
    hasOrgStructureDoc: false,
    hasContactList: false,
    talkToHumanInTop5: false,
    unknownInTop5: false,
    hasPartnerInvolvement: false,
    segment: "Mid-Market",
    humanChatProvider: "",
    integrations: [],
  };
  const metricsSet: Record<string, boolean> = {};

  const set = (key: keyof CustomerMetrics, value: number | undefined) => {
    if (value === undefined) return;
    (metrics as unknown as Record<string, unknown>)[key] = value;
    metricsSet[key] = true;
  };

  // ── Derived from the intent-traffic rollup (reviewed = the split denominator)
  const totals = customer.intent_traffic?.totals;
  if (totals && totals.reviewed > 0) {
    set("automationRate", rate01(totals.automated / totals.reviewed));
    set("unsolvedRate", rate01(totals.unsolved / totals.reviewed));
  }
  if (totals && totals.traffic > 0) {
    set("unknownRate", rate01(totals.noPrediction / totals.traffic));
  }

  // ── CE performance telemetry — authoritative, overrides derived values.
  const perf = customer.performance;
  if (perf) {
    set("automationRate", pctToRate(perf.automation_rate));
    set("unknownRate", pctToRate(perf.unknown_rate));
    set("csatScore", normaliseCsat(perf.csat_score));
    set("conversationVolume", perf.monthly_conversations);
  }

  // Note: a single blended `escalation_rate` can't be faithfully split into the
  // engine's immediate / fallback / by-design escalation fields, so those stay
  // unset and surface as missing-data prompts rather than mis-triggering.

  const hierarchy: HierarchyContext = {
    instanceCount: customer.selected_instance_ids?.length ?? 0,
  };

  return { metrics, metricsSet, hierarchy };
}
