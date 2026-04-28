import type { CurrencyCode, PricingModel } from "./types";

export interface ROIInputs {
  monthlyConversations: number;
  costPerConversation: number;
  pricingModel: PricingModel;
  automationRate: number; // 0-100
  markets: number;
  /** Detected currency (e.g. "USD", "NOK", "EUR"). Used only to
   *  size the cost-independent services floor so Nordic nominals
   *  (~10× higher) don't trivialise the break-even. Default: USD. */
  currency?: string;
  /** Optional override: the real boost.ai monthly cost from the
   *  2026 pricing invoice (calculatePricing().monthlyTotal). When
   *  provided, takes precedence over the AI_COST_RATIO heuristic
   *  so ROI / Impact / Commercial all quote the SAME number
   *  instead of disagreeing. USD. */
  invoiceMonthlyCostUSD?: number;
  /** Optional override: the real one-time implementation cost from
   *  calculateResourcePlan().implementationTotal. When provided,
   *  takes precedence over the services-floor heuristic. USD. */
  invoiceImplementationUSD?: number;
  /** Conversations one human FTE handles per month. Tunes the
   *  fteEquivalent figure to the prospect's actual contact-centre
   *  productivity instead of a global 1,500 average. Falls back to
   *  1,500 when undefined or non-positive. */
  fteCapacityPerMonth?: number;
  /** Months to reach `automationRate` via linear ramp from 0%.
   *  When > 0, the calculator additionally returns
   *  year1AverageMonthlySavings / year1AverageRoiPercentage /
   *  year1AverageAutomationRate populated with time-weighted
   *  Year-1 values. Steady-state outputs (monthlySavings,
   *  roiPercentage, etc.) are unchanged so consumers that don't
   *  opt into the ramp see no behaviour change. */
  automationRampMonths?: number;
  /** Voice-side baseline: monthly minutes × cost per minute. Adds
   *  to currentMonthlyCost when set. For voice-only engagements,
   *  callers should set monthlyConversations + costPerConversation
   *  to 0 and put all the volume on the voice side. For both-channel
   *  engagements, both contribute. Both default to 0 so omitting
   *  these doesn't change chat-only behaviour. */
  monthlyVoiceMinutes?: number;
  costPerVoiceMinute?: number;
}

export interface ROIResults {
  currentMonthlyCost: number;
  automatedConversations: number;
  humanConversations: number;
  aiCostPerConversation: number;
  newMonthlyCost: number;
  monthlySavings: number;
  annualSavings: number;
  roiPercentage: number;
  fteEquivalent: number;
  breakEvenMonths: number;
  /** Effective Year-1 monthly savings under a linear automation
   *  ramp (0% → target over `automationRampMonths`). Equals
   *  `monthlySavings` when no ramp is set, so callers can always
   *  read this field without a guard. */
  year1AverageMonthlySavings: number;
  /** Time-weighted Year-1 average automation rate, 0–100. Equals
   *  the steady-state target when no ramp is set. */
  year1AverageAutomationRate: number;
  /** ROI % using the Year-1 average savings rather than steady-
   *  state. Equals `roiPercentage` when no ramp is set. */
  year1AverageRoiPercentage: number;
  /** The ramp parameter that was applied (echoed back for UI
   *  layers that want to caption the difference). 0 = no ramp. */
  rampMonths: number;
}

/**
 * AI cost as a fraction of the customer's per-conversation cost.
 * This ensures the calculation works regardless of currency and
 * produces realistic savings — not "$0.35 vs 55 SEK" nonsense.
 *
 * The fraction represents: for every conversation the AI handles,
 * how much does it cost relative to the human cost?
 *   - fixed:   8% (cheapest per-unit, flat monthly fee amortised)
 *   - usage:  12% (per-conversation billing, moderate)
 *   - outcome: 18% (higher per-unit but pay-for-success model)
 *
 * Platform overhead (license, implementation, support) is modelled
 * as a separate monthly fixed cost: ~15% of current monthly spend.
 */
const AI_COST_RATIO: Record<PricingModel, number> = {
  fixed: 0.08,
  usage: 0.12,
  outcome: 0.18,
};

const PLATFORM_OVERHEAD_RATIO = 0.15; // 15% of current monthly cost as platform fee
const IMPL_MONTHS = 2; // months of platform cost as implementation investment

export function calculateROI(inputs: ROIInputs): ROIResults {
  const { monthlyConversations, costPerConversation, pricingModel, automationRate, markets } = inputs;
  const monthlyVoiceMinutes = Math.max(0, inputs.monthlyVoiceMinutes ?? 0);
  const costPerVoiceMinute = Math.max(0, inputs.costPerVoiceMinute ?? 0);

  const rate = automationRate / 100;
  const automatedConversations = Math.round(monthlyConversations * rate);
  const humanConversations = monthlyConversations - automatedConversations;
  // Voice contribution mirrors chat: the same automation rate
  // applies to voice minutes. Per-channel automation tuning
  // (e.g. 60% voice / 80% chat) is a follow-up; for now both
  // channels follow the rate the caller passes in.
  const automatedVoiceMinutes = Math.round(monthlyVoiceMinutes * rate);
  const humanVoiceMinutes = monthlyVoiceMinutes - automatedVoiceMinutes;

  // Combined baseline: chat conversations at $/conv plus voice
  // minutes at $/min. Voice contributes 0 when the engagement is
  // chat-only (caller passes 0/0 for the voice fields), preserving
  // legacy behaviour for share URLs without channel scope.
  const currentChatCost = monthlyConversations * costPerConversation;
  const currentVoiceCost = monthlyVoiceMinutes * costPerVoiceMinute;
  const currentMonthlyCost = currentChatCost + currentVoiceCost;

  // AI cost per chat conversation is a fraction of the human cost.
  // The same fraction applies to voice (per-minute), so the AI's
  // cost story scales with whichever channel(s) are in scope.
  const aiCostPerConversation = costPerConversation * AI_COST_RATIO[pricingModel];
  const aiCostPerVoiceMinute = costPerVoiceMinute * AI_COST_RATIO[pricingModel];

  // New cost: automated at AI rate + remaining humans at full rate + platform overhead
  const platformMonthly = currentMonthlyCost * PLATFORM_OVERHEAD_RATIO;
  const heuristicNewCost =
    (automatedConversations * aiCostPerConversation) +
    (humanConversations * costPerConversation) +
    (automatedVoiceMinutes * aiCostPerVoiceMinute) +
    (humanVoiceMinutes * costPerVoiceMinute) +
    platformMonthly;

  // INVOICE-FIRST: when the AE has built a 2026 pricing invoice,
  // that IS the boost.ai cost. Fall back to the heuristic only when
  // no invoice is available. USD fields assume 1:1 with customer
  // currency — acceptable because the invoice view itself is USD
  // today; currency-aware conversion is a later enhancement.
  const newMonthlyCost = inputs.invoiceMonthlyCostUSD != null
    ? inputs.invoiceMonthlyCostUSD
    : heuristicNewCost;

  const monthlySavings = currentMonthlyCost - newMonthlyCost;
  const annualSavings = monthlySavings * 12;

  // Implementation cost = two components:
  //   (1) services floor — cost-independent, scales with market count.
  //       Nominally USD $20k per market; Nordic currencies (10×
  //       nominal per-conv) use a 10× scaled floor so the ratio is
  //       meaningful.
  //   (2) proportional overhead — 1 month of platform fees, scaled
  //       by markets. Preserves the intuition that bigger customers
  //       take longer to stand up.
  //
  // Having a cost-INDEPENDENT component is what makes break-even
  // actually vary when the user drags the conversation-cost slider
  // (F1): at low conversation costs the floor dominates and
  // break-even is longer; at high costs savings outrun the floor
  // and break-even collapses to sub-month.
  const isNordic = /NOK|SEK|DKK/i.test(inputs.currency ?? "");
  const heuristicImplFloor = (isNordic ? 200_000 : 20_000) * markets;
  const heuristicImpl = heuristicImplFloor + platformMonthly * markets;
  // INVOICE-FIRST: real resource-plan total wins if available.
  const implCost = inputs.invoiceImplementationUSD != null
    ? inputs.invoiceImplementationUSD
    : heuristicImpl;
  // Raw break-even in months. Under current model (proportional
  // savings vs proportional platform overhead) this is typically
  // sub-1 month at low conversation costs — so we return a
  // fractional value when < 1 instead of integer-clamping to 1
  // (which made the figure look frozen when users dragged the
  // cost slider below ~10).
  const rawBreakEven =
    monthlySavings > 0 ? implCost / monthlySavings : 99;
  const breakEvenMonths =
    rawBreakEven < 1
      ? Math.max(0.1, Math.round(rawBreakEven * 10) / 10)
      : Math.min(Math.ceil(rawBreakEven), 24);

  const roiPercentage = currentMonthlyCost > 0
    ? Math.round((monthlySavings / currentMonthlyCost) * 100)
    : 0;

  // FTE-equivalent automation = how many human full-timers the AI
  // displaces. Capacity defaults to 1,500 conv/FTE/mo (industry
  // average) but the AE can override per-prospect from admin so the
  // figure matches the customer's own contact-centre productivity.
  const fteCapacity = inputs.fteCapacityPerMonth && inputs.fteCapacityPerMonth > 0
    ? inputs.fteCapacityPerMonth
    : 1500;
  const fteEquivalent = Math.round((automatedConversations / fteCapacity) * 10) / 10;

  // ── Year-1 ramp averaging ──────────────────────────────────────
  // Linear ramp from 0% automation to `targetRate` over rampM
  // months. Time-weighted average over the first 12 months:
  //   rampM <= 0  → target (no ramp)
  //   rampM <= 12 → target * (1 − rampM / 24)   (½ during ramp,
  //                                              full thereafter)
  //   rampM > 12  → target * 6 / rampM          (continuous mean
  //                                              of k/rampM over
  //                                              k = 0..12)
  const rampMonths = Math.max(0, inputs.automationRampMonths ?? 0);
  const targetRate = rate;
  const year1AvgRate =
    rampMonths <= 0
      ? targetRate
      : rampMonths <= 12
        ? targetRate * (1 - rampMonths / 24)
        : (targetRate * 6) / rampMonths;
  const year1AvgAutomatedConv = monthlyConversations * year1AvgRate;
  const year1AvgHumanConv = monthlyConversations - year1AvgAutomatedConv;
  // Boost.ai cost is the same whether the bot answers or not — the
  // platform fee + per-agent charges land from go-live. Only the
  // human-handled volume shrinks as automation ramps. So we
  // compute year-1 cost using the ramped human volume against
  // either the invoice (if present) or the heuristic.
  const year1HeuristicNewCost =
    year1AvgAutomatedConv * aiCostPerConversation +
    year1AvgHumanConv * costPerConversation +
    platformMonthly;
  const year1NewMonthlyCost =
    inputs.invoiceMonthlyCostUSD != null
      ? inputs.invoiceMonthlyCostUSD
      : year1HeuristicNewCost;
  const year1AverageMonthlySavings = currentMonthlyCost - year1NewMonthlyCost;
  const year1AverageRoiPercentage =
    currentMonthlyCost > 0
      ? Math.round((year1AverageMonthlySavings / currentMonthlyCost) * 100)
      : 0;

  return {
    currentMonthlyCost,
    automatedConversations,
    humanConversations,
    aiCostPerConversation,
    newMonthlyCost,
    monthlySavings,
    annualSavings,
    roiPercentage,
    fteEquivalent,
    breakEvenMonths,
    year1AverageMonthlySavings,
    year1AverageAutomationRate: year1AvgRate * 100,
    year1AverageRoiPercentage,
    rampMonths,
  };
}

/**
 * Parse the numeric amount out of a free-text cost string.
 *
 * `conversation_cost` is captured as free text in admin so reps can
 * type natural strings ("$8.50", "~55 NOK", "€6.20"). Every consumer
 * of that number (Hero, ROI, Impact, Commercial, ScopeOfWork, SoW
 * PDF) used to inline the same `parseFloat(cost.replace(/[^0-9.]/g,
 * "") || "0")` snippet, with inconsistent fallbacks (some defaulted
 * to 8 when the result was 0, others left it 0). This helper makes
 * the parse a single source of truth.
 *
 * @param costStr  the raw `guide.conversation_cost` value
 * @param fallback amount to return when the string is empty or
 *                 yields 0 after parsing. Pass 0 if you want the
 *                 caller to explicitly handle the empty case;
 *                 pass 8 (the historical default) when you need
 *                 a baseline cost for ROI math.
 */
export function parseConversationCost(
  costStr: string | undefined,
  fallback: number = 0,
): number {
  if (!costStr) return fallback;
  const cleaned = costStr.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

/**
 * Extract currency symbol from a cost string like "~55 SEK", "$8.50", "€12".
 * Falls back to "$" if nothing recognised.
 */
export function detectCurrency(costStr: string | undefined): string {
  if (!costStr) return "$";
  const str = costStr.trim();
  if (str.includes("SEK")) return "SEK ";
  if (str.includes("NOK")) return "NOK ";
  if (str.includes("DKK")) return "DKK ";
  if (str.includes("EUR") || str.includes("€")) return "€";
  if (str.includes("£") || str.includes("GBP")) return "£";
  if (str.includes("CHF")) return "CHF ";
  if (str.includes("$")) return "$";
  return "$";
}

/** Map a CurrencyCode (USD / NOK / …) to the formatter's symbol/prefix.
 *  Kept in sync with `detectCurrency` so picker + auto-detect produce
 *  the same output. */
const CODE_TO_SYMBOL: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  NOK: "NOK ",
  SEK: "SEK ",
  DKK: "DKK ",
  CHF: "CHF ",
};

/** Prefer the explicit `currency` field (set via admin picker) over
 *  auto-detecting from the `conversation_cost` string. This is the
 *  single entry point every money-rendering component should use —
 *  fixes F3 ("$4.4 shown alongside NOK figures") by centralising
 *  the decision. */
export function resolveCurrency(
  currencyCode: CurrencyCode | undefined,
  costStr: string | undefined,
): string {
  if (currencyCode && CODE_TO_SYMBOL[currencyCode]) {
    return CODE_TO_SYMBOL[currencyCode];
  }
  return detectCurrency(costStr);
}

/** The user-visible options for the admin picker. */
export const CURRENCY_OPTIONS: Array<{ code: CurrencyCode; label: string }> = [
  { code: "USD", label: "USD · $" },
  { code: "EUR", label: "EUR · €" },
  { code: "GBP", label: "GBP · £" },
  { code: "NOK", label: "NOK · kr" },
  { code: "SEK", label: "SEK · kr" },
  { code: "DKK", label: "DKK · kr" },
  { code: "CHF", label: "CHF" },
];

/**
 * Format a number with the detected currency.
 */
export function formatWithCurrency(n: number, currency: string): string {
  const abs = Math.abs(n);
  const prefix = currency.length > 1 && !currency.startsWith("$") && !currency.startsWith("€") && !currency.startsWith("£")
    ? currency // "SEK ", "NOK " etc — prefix with space
    : currency; // "$", "€", "£" — no space

  if (abs >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${prefix}${Math.round(n / 1_000)}K`;
  return `${prefix}${Math.round(n)}`;
}
