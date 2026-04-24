/**
 * 2026 pricing — canonical source of truth.
 *
 * Values mirror
 *   Price calculator 2026 (Updated) - Price calculator floating tier.csv
 * supplied by the user on 2026-04-24. All prices in USD. When the
 * spreadsheet is updated, update this file and the Commercial section
 * automatically picks up the new numbers.
 *
 * The floating-tier model: the price-per-unit applies to the WHOLE
 * monthly volume at the tier the volume lands in — not a stepped
 * cumulative calc. A customer at 25,000 chat conversations lands in
 * tier 3, so all 25k are priced at $0.45, not 5k@0.55 + 5k@0.50 + ...
 */

export interface ChatTier {
  name: string;
  /** Monthly conversation cap. null = unlimited (top tier). */
  upTo: number | null;
  pricePerConversation: number;
}

export interface VoiceTier {
  name: string;
  /** Monthly minute cap. null = unlimited (top tier). */
  upTo: number | null;
  enterprisePricePerMinute: number;
  expressPricePerMinute: number;
}

export const CHAT_TIERS: ChatTier[] = [
  { name: "Tier 1", upTo: 5_000,   pricePerConversation: 0.55 },
  { name: "Tier 2", upTo: 10_000,  pricePerConversation: 0.50 },
  { name: "Tier 3", upTo: 20_000,  pricePerConversation: 0.45 },
  { name: "Tier 4", upTo: 50_000,  pricePerConversation: 0.40 },
  { name: "Tier 5", upTo: null,    pricePerConversation: 0.30 },
];

export const VOICE_TIERS: VoiceTier[] = [
  { name: "Tier 1", upTo: 50_000,    enterprisePricePerMinute: 0.12, expressPricePerMinute: 0.09 },
  { name: "Tier 2", upTo: 100_000,   enterprisePricePerMinute: 0.11, expressPricePerMinute: 0.09 },
  { name: "Tier 3", upTo: 500_000,   enterprisePricePerMinute: 0.10, expressPricePerMinute: 0.08 },
  { name: "Tier 4", upTo: 1_000_000, enterprisePricePerMinute: 0.09, expressPricePerMinute: 0.08 },
  { name: "Tier 5", upTo: null,      enterprisePricePerMinute: 0.08, expressPricePerMinute: 0.07 },
];

/** Monthly platform fees, USD per VA. Identical across channels. */
export const PLATFORM_FEE_PER_VA_EXTERNAL = 2_500;
export const PLATFORM_FEE_PER_VA_INTERNAL = 2_500;
export const PLATFORM_FEE_PER_VA_VOICE    = 2_500;

/** Discount applied to the committed portion of chat conversations or
 *  voice minutes. Overage (consumption above the commit) pays the
 *  landed-tier price with no discount. */
export const COMMITTED_VOLUME_DISCOUNT = 0.10;

export type SuccessPackage = "none" | "essential" | "core" | "pro";

export interface SuccessPackageOption {
  key: SuccessPackage;
  label: string;
  monthlyPrice: number;
  blurb: string;
}

export const SUCCESS_PACKAGES: SuccessPackageOption[] = [
  { key: "none",      label: "None",                        monthlyPrice: 0,     blurb: "Self-serve from our docs + community." },
  { key: "essential", label: "Essential Success Package",    monthlyPrice: 2_715, blurb: "Named CSM, quarterly BRs, release walkthroughs." },
  { key: "core",      label: "Core Success Package",         monthlyPrice: 4_542, blurb: "Everything in Essential + monthly reviews, priority roadmap input, AI Trainer hours." },
  { key: "pro",       label: "Pro Success Package",          monthlyPrice: 7_276, blurb: "Everything in Core + embedded trainer, 24h SLAs, custom enablement." },
];

export type EnvironmentAddon = "sandbox" | "staging" | "custom_cloud";

export interface EnvironmentAddonOption {
  key: EnvironmentAddon;
  label: string;
  monthlyPrice: number;
  blurb: string;
}

export const ENVIRONMENT_ADDONS: EnvironmentAddonOption[] = [
  { key: "sandbox",      label: "Sandbox environment",      monthlyPrice: 1_500, blurb: "Isolated test tenant for regression work." },
  { key: "staging",      label: "Staging environment",      monthlyPrice: 1_000, blurb: "Pre-production mirror of live content." },
  { key: "custom_cloud", label: "Custom Cloud hosting",     monthlyPrice: 4_500, blurb: "Dedicated tenancy in your preferred region." },
];

/** Human Chat: base fee includes 10 seats, $200/seat thereafter. */
export const HUMAN_CHAT_BASE_PRICE = 1_800;
export const HUMAN_CHAT_INCLUDED_SEATS = 10;
export const HUMAN_CHAT_PRICE_PER_EXTRA_SEAT = 200;

/** VA Orchestration Network — flat monthly if enabled. */
export const VAN_PRICE = 1_000;

export type IntegrationTier = "authentication" | "channel" | "third_party_human_chat" | "advanced_custom";

export interface IntegrationTierOption {
  key: IntegrationTier;
  label: string;
  monthlyPrice: number;
}

export const INTEGRATION_TIERS: IntegrationTierOption[] = [
  { key: "authentication",          label: "Authentication",              monthlyPrice: 350 },
  { key: "channel",                 label: "Channel (incl. 3rd party)",   monthlyPrice: 350 },
  { key: "third_party_human_chat",  label: "3rd party Human Chat",        monthlyPrice: 500 },
  { key: "advanced_custom",         label: "Advanced / Custom",           monthlyPrice: 750 },
];

/* ─── Resource plan ────────────────────────────────────────────────
 *  Illustrative implementation resourcing. Base hours assume a
 *  single-market delivery with three integrations; the resource
 *  calculator scales this up based on the complexity score (markets +
 *  integrations + resources). Rates are 2026 consulting-standard for
 *  senior AI/platform work.                                          */

export type RoleKey = "solution_architect" | "ai_trainer" | "integration_engineer" | "project_manager" | "csm";

export interface RoleRate {
  key: RoleKey;
  label: string;
  /** Hourly rate in USD. Revenue should confirm before a signed SoW. */
  hourlyRateUSD: number;
  /** Base hours for a single-market, three-integration delivery. */
  baseHours: number;
  /** How much the role scales with complexity (0 = flat, 1 = full scaling). */
  complexitySensitivity: number;
  /** Short blurb for the guide. */
  blurb: string;
}

export const ROLE_RATES: RoleRate[] = [
  {
    key: "solution_architect",
    label: "Solution Architect",
    hourlyRateUSD: 200,
    baseHours: 120,
    complexitySensitivity: 0.8,
    blurb: "Owns the design — conversation model, flow architecture, orchestrator wiring.",
  },
  {
    key: "ai_trainer",
    label: "AI Trainer",
    hourlyRateUSD: 150,
    baseHours: 200,
    complexitySensitivity: 0.9,
    blurb: "Tunes intents, reviews transcripts, iterates on content quality post go-live.",
  },
  {
    key: "integration_engineer",
    label: "Integration Engineer",
    hourlyRateUSD: 175,
    baseHours: 160,
    complexitySensitivity: 1.0,
    blurb: "Builds and certifies API connectors, auth handshakes, and data pipelines.",
  },
  {
    key: "project_manager",
    label: "Project Manager",
    hourlyRateUSD: 165,
    baseHours: 100,
    complexitySensitivity: 0.6,
    blurb: "Runs the delivery — stakeholders, dependencies, risk, release cadence.",
  },
  {
    key: "csm",
    label: "Customer Success Manager",
    hourlyRateUSD: 140,
    baseHours: 60,
    complexitySensitivity: 0.3,
    blurb: "Bridges Sales → Delivery → Success. Owns the relationship during ramp.",
  },
];

/** Phase weights across the 12-week roadmap — determines how many of
 *  each role's hours land in each phase. Matches the visual stretch
 *  bars in RoadmapSection. */
export const ROLE_PHASE_WEIGHTS: Record<"Discovery" | "Build" | "Pilot" | "Scale", number> = {
  Discovery: 0.15,
  Build: 0.55,
  Pilot: 0.20,
  Scale: 0.10,
};
