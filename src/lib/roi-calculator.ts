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

// Estimated platform cost per conversation by pricing model
const PLATFORM_COSTS: Record<PricingModel, { perConversation: number; setupMonths: number }> = {
  fixed: { perConversation: 0.35, setupMonths: 2 },
  usage: { perConversation: 0.50, setupMonths: 1 },
  outcome: { perConversation: 0.75, setupMonths: 1 },
};

export function calculateROI(inputs: ROIInputs): ROIResults {
  const { monthlyConversations, costPerConversation, pricingModel, automationRate, markets } = inputs;

  const rate = automationRate / 100;
  const automatedConversations = Math.round(monthlyConversations * rate);
  const humanConversations = monthlyConversations - automatedConversations;

  const currentMonthlyCost = monthlyConversations * costPerConversation;

  const platformCost = PLATFORM_COSTS[pricingModel];
  const aiCostPerConversation = platformCost.perConversation;

  // New cost: automated conversations at AI rate + remaining human conversations at full rate
  const newMonthlyCost = (automatedConversations * aiCostPerConversation) + (humanConversations * costPerConversation);

  const monthlySavings = currentMonthlyCost - newMonthlyCost;
  const annualSavings = monthlySavings * 12;

  // Estimate implementation cost (rough: 3 months of platform cost as setup)
  const implCost = automatedConversations * aiCostPerConversation * platformCost.setupMonths * markets;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(implCost / monthlySavings) : 99;

  const roiPercentage = currentMonthlyCost > 0
    ? Math.round(((monthlySavings) / currentMonthlyCost) * 100)
    : 0;

  // Assume 1 FTE handles ~1500 conversations/month
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
