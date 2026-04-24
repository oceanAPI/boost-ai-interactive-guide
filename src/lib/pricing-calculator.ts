/**
 * 2026 pricing calculator — floating-tier.
 *
 * Input: PricingConfig (captured in admin).
 * Output: PricingInvoice — monthly + annual total, plus line items for
 * the Commercial section to render.
 *
 * Floating-tier rule: pricing per unit is determined by the *expected*
 * monthly volume landing in a tier. All units at that volume bill at
 * that tier's rate. Committed volume (if set below expected) gets a
 * 10% discount on its share; overage (expected minus committed) bills
 * at full rate. If commit ≥ expected, the whole expected volume gets
 * the discount — there is no overage.
 */

import {
  CHAT_TIERS,
  VOICE_TIERS,
  PLATFORM_FEE_PER_VA_EXTERNAL,
  PLATFORM_FEE_PER_VA_INTERNAL,
  PLATFORM_FEE_PER_VA_VOICE,
  COMMITTED_VOLUME_DISCOUNT,
  SUCCESS_PACKAGES,
  ENVIRONMENT_ADDONS,
  HUMAN_CHAT_BASE_PRICE,
  HUMAN_CHAT_INCLUDED_SEATS,
  HUMAN_CHAT_PRICE_PER_EXTRA_SEAT,
  VAN_PRICE,
  INTEGRATION_TIERS,
  type SuccessPackage,
  type EnvironmentAddon,
  type IntegrationTier,
  type ChatTier,
  type VoiceTier,
} from "@/data/pricing-2026";

export interface PricingConfig {
  /** Chat virtual agents — billed per VA, external + internal stacked. */
  chat_va_external?: number;
  chat_va_internal?: number;
  /** Voice virtual agents — billed at the same $2,500/VA. */
  voice_va?: number;

  /** Monthly conversation forecast. Determines the chat tier. */
  chat_expected_monthly?: number;
  /** Monthly commitment (≤ expected gets 10% off the committed share,
   *  rest is overage). */
  chat_committed_monthly?: number;

  /** Voice service tier — enterprise or express. */
  voice_service?: "enterprise" | "express";
  voice_expected_monthly?: number;
  voice_committed_monthly?: number;

  success_package?: SuccessPackage;
  environments?: EnvironmentAddon[];
  human_chat_enabled?: boolean;
  human_chat_users?: number;
  van_enabled?: boolean;
  /** Map of integration tier key → count. */
  integrations_by_tier?: Partial<Record<IntegrationTier, number>>;
}

export interface PricingLine {
  label: string;
  detail?: string;
  monthly: number;
}

export interface PricingInvoice {
  platform: PricingLine[];
  usage: PricingLine[];
  addons: PricingLine[];
  monthlyTotal: number;
  annualTotal: number;
  /** Landed chat tier — useful for the UI to show which tier applies. */
  chatTier: ChatTier | null;
  voiceTier: VoiceTier | null;
}

/** Find which tier a volume lands in (floating tier, not cumulative). */
export function findChatTier(monthlyVolume: number): ChatTier {
  for (const tier of CHAT_TIERS) {
    if (tier.upTo === null || monthlyVolume <= tier.upTo) return tier;
  }
  return CHAT_TIERS[CHAT_TIERS.length - 1];
}

export function findVoiceTier(monthlyMinutes: number): VoiceTier {
  for (const tier of VOICE_TIERS) {
    if (tier.upTo === null || monthlyMinutes <= tier.upTo) return tier;
  }
  return VOICE_TIERS[VOICE_TIERS.length - 1];
}

export function calculatePricing(config: PricingConfig): PricingInvoice {
  const platform: PricingLine[] = [];
  const usage: PricingLine[] = [];
  const addons: PricingLine[] = [];

  const chatVAExt = Math.max(0, config.chat_va_external ?? 0);
  const chatVAInt = Math.max(0, config.chat_va_internal ?? 0);
  const voiceVA   = Math.max(0, config.voice_va ?? 0);

  if (chatVAExt > 0) {
    platform.push({
      label: `Chat VA subscription — External (${chatVAExt})`,
      detail: `$${PLATFORM_FEE_PER_VA_EXTERNAL.toLocaleString("en-US")} / VA / mo`,
      monthly: chatVAExt * PLATFORM_FEE_PER_VA_EXTERNAL,
    });
  }
  if (chatVAInt > 0) {
    platform.push({
      label: `Chat VA subscription — Internal (${chatVAInt})`,
      detail: `$${PLATFORM_FEE_PER_VA_INTERNAL.toLocaleString("en-US")} / VA / mo`,
      monthly: chatVAInt * PLATFORM_FEE_PER_VA_INTERNAL,
    });
  }
  if (voiceVA > 0) {
    platform.push({
      label: `Voice VA subscription (${voiceVA})`,
      detail: `$${PLATFORM_FEE_PER_VA_VOICE.toLocaleString("en-US")} / VA / mo`,
      monthly: voiceVA * PLATFORM_FEE_PER_VA_VOICE,
    });
  }

  // Chat usage
  const chatExpected = Math.max(0, config.chat_expected_monthly ?? 0);
  const chatCommitted = Math.max(0, Math.min(chatExpected, config.chat_committed_monthly ?? 0));
  let chatTier: ChatTier | null = null;
  if (chatExpected > 0) {
    chatTier = findChatTier(chatExpected);
    const rate = chatTier.pricePerConversation;
    const committedCost = chatCommitted * rate * (1 - COMMITTED_VOLUME_DISCOUNT);
    const overage = chatExpected - chatCommitted;
    const overageCost = overage * rate;
    if (chatCommitted > 0) {
      usage.push({
        label: `Chat commitment — ${chatCommitted.toLocaleString("en-US")} conv / mo @ ${chatTier.name}`,
        detail: `$${rate.toFixed(2)}/conv × ${chatCommitted.toLocaleString("en-US")} × (1 − ${(COMMITTED_VOLUME_DISCOUNT * 100).toFixed(0)}% commit discount)`,
        monthly: committedCost,
      });
    }
    if (overage > 0) {
      usage.push({
        label: `Chat overage — ${overage.toLocaleString("en-US")} conv / mo`,
        detail: `$${rate.toFixed(2)}/conv × ${overage.toLocaleString("en-US")} at ${chatTier.name} rate (no commit discount)`,
        monthly: overageCost,
      });
    }
  }

  // Voice usage
  const voiceExpected = Math.max(0, config.voice_expected_monthly ?? 0);
  const voiceCommitted = Math.max(0, Math.min(voiceExpected, config.voice_committed_monthly ?? 0));
  const voiceService = config.voice_service ?? "enterprise";
  let voiceTier: VoiceTier | null = null;
  if (voiceExpected > 0) {
    voiceTier = findVoiceTier(voiceExpected);
    const rate = voiceService === "express"
      ? voiceTier.expressPricePerMinute
      : voiceTier.enterprisePricePerMinute;
    const serviceLabel = voiceService === "express" ? "Express" : "Enterprise";
    const committedCost = voiceCommitted * rate * (1 - COMMITTED_VOLUME_DISCOUNT);
    const overage = voiceExpected - voiceCommitted;
    const overageCost = overage * rate;
    if (voiceCommitted > 0) {
      usage.push({
        label: `Voice ${serviceLabel} commitment — ${voiceCommitted.toLocaleString("en-US")} min / mo @ ${voiceTier.name}`,
        detail: `$${rate.toFixed(2)}/min × ${voiceCommitted.toLocaleString("en-US")} × (1 − ${(COMMITTED_VOLUME_DISCOUNT * 100).toFixed(0)}% commit discount)`,
        monthly: committedCost,
      });
    }
    if (overage > 0) {
      usage.push({
        label: `Voice ${serviceLabel} overage — ${overage.toLocaleString("en-US")} min / mo`,
        detail: `$${rate.toFixed(2)}/min × ${overage.toLocaleString("en-US")} at ${voiceTier.name} rate`,
        monthly: overageCost,
      });
    }
  }

  // Success package
  const successKey = config.success_package ?? "none";
  const successPkg = SUCCESS_PACKAGES.find((p) => p.key === successKey);
  if (successPkg && successPkg.monthlyPrice > 0) {
    addons.push({
      label: successPkg.label,
      detail: successPkg.blurb,
      monthly: successPkg.monthlyPrice,
    });
  }

  // Environments
  for (const envKey of config.environments ?? []) {
    const opt = ENVIRONMENT_ADDONS.find((e) => e.key === envKey);
    if (opt) addons.push({ label: opt.label, detail: opt.blurb, monthly: opt.monthlyPrice });
  }

  // Human Chat
  if (config.human_chat_enabled) {
    const users = Math.max(HUMAN_CHAT_INCLUDED_SEATS, config.human_chat_users ?? HUMAN_CHAT_INCLUDED_SEATS);
    const extra = users - HUMAN_CHAT_INCLUDED_SEATS;
    const extraCost = extra * HUMAN_CHAT_PRICE_PER_EXTRA_SEAT;
    addons.push({
      label: `Human Chat (${users} users)`,
      detail: extra > 0
        ? `$${HUMAN_CHAT_BASE_PRICE.toLocaleString("en-US")} base (10 users) + ${extra} × $${HUMAN_CHAT_PRICE_PER_EXTRA_SEAT}`
        : `$${HUMAN_CHAT_BASE_PRICE.toLocaleString("en-US")} base — 10 users included`,
      monthly: HUMAN_CHAT_BASE_PRICE + extraCost,
    });
  }

  // VAN
  if (config.van_enabled) {
    addons.push({
      label: "VA Orchestration Network (VAN)",
      detail: `$${VAN_PRICE.toLocaleString("en-US")} / mo`,
      monthly: VAN_PRICE,
    });
  }

  // Integrations
  for (const tierOpt of INTEGRATION_TIERS) {
    const count = config.integrations_by_tier?.[tierOpt.key] ?? 0;
    if (count > 0) {
      addons.push({
        label: `${tierOpt.label} integration${count > 1 ? "s" : ""} (${count})`,
        detail: `$${tierOpt.monthlyPrice}/mo each`,
        monthly: count * tierOpt.monthlyPrice,
      });
    }
  }

  const sumMonthly = [...platform, ...usage, ...addons].reduce((acc, l) => acc + l.monthly, 0);

  return {
    platform,
    usage,
    addons,
    monthlyTotal: sumMonthly,
    annualTotal: sumMonthly * 12,
    chatTier,
    voiceTier,
  };
}

export function formatUSD(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}
