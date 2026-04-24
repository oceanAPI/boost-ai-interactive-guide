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

  const rate = automationRate / 100;
  const automatedConversations = Math.round(monthlyConversations * rate);
  const humanConversations = monthlyConversations - automatedConversations;

  const currentMonthlyCost = monthlyConversations * costPerConversation;

  // AI cost per conversation is a fraction of the human cost
  const aiCostPerConversation = costPerConversation * AI_COST_RATIO[pricingModel];

  // New cost: automated at AI rate + remaining humans at full rate + platform overhead
  const platformMonthly = currentMonthlyCost * PLATFORM_OVERHEAD_RATIO;
  const newMonthlyCost =
    (automatedConversations * aiCostPerConversation) +
    (humanConversations * costPerConversation) +
    platformMonthly;

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
  const implFloor = (isNordic ? 200_000 : 20_000) * markets;
  const implCost = implFloor + platformMonthly * markets;
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

  // 1 FTE handles ~1500 conversations/month
  const fteEquivalent = Math.round((automatedConversations / 1500) * 10) / 10;

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
  };
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
