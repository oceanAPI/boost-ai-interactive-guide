import type { PricingModel } from "./types";

export interface ROIInputs {
  monthlyConversations: number;
  costPerConversation: number;
  pricingModel: PricingModel;
  automationRate: number; // 0-100
  markets: number;
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

  // Implementation cost: platform overhead × setup months × markets
  const implCost = platformMonthly * IMPL_MONTHS * markets;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(implCost / monthlySavings) : 99;

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
    breakEvenMonths: Math.max(1, Math.min(breakEvenMonths, 24)),
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
