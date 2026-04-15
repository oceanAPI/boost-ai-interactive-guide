/* ─────────────────────────────────────────────
 *  Shared types and constants for agent data
 * ───────────────────────────────────────────── */

// ─── Flow Architecture Types ───

export interface CustomCardJson {
  type: string;
  title: string;
  subtitle?: string;
  image?: string | null;
  fields?: { label: string; value: string }[];
  actions?: { label: string; type: string }[];
}

export interface FlowNode {
  id: string;
  name: string;
  type: string;             // e.g. "faq", "api", "hallucination", "transfer"
  icon: string;             // BoostIcon name
  description: string;
  elevioUrl?: string;       // link to elev.io article for Level 3 (future)
  customCardJson?: CustomCardJson;  // for action hooks with content → custom card
}

export interface AgentFlow {
  knowledgeSources: FlowNode[];
  guardrails: FlowNode[];
  actionHooks: FlowNode[];
  processes: FlowNode[];
  standardResponses: FlowNode[];
}

// ─── Agent Types ───

export interface AgentCapability {
  title: string;
  description: string;
}

/**
 * Agent depth tier.
 *
 * Drives content-depth convention + visual treatment:
 *   - "primary" — Topic is core to this industry. Full depth (6 capabilities,
 *     6 quick actions, 10+ flow nodes, avgResolutionTime + topTopic required).
 *     No badge rendered on card.
 *   - "addon"   — Topic is a significant cross-sell. Medium depth (3–4 caps,
 *     4–5 quick actions, 5–7 flow nodes). Renders a muted "Add-on" badge.
 *   - "light"   — Topic is a minor cross-sell. Minimal depth (1–2 caps,
 *     2–3 quick actions, 3–4 flow nodes). Renders a muted "Cross-sell" badge.
 *
 * Tier also drives the 20-agent display cap prioritisation in
 * getOrchestratorConfig(): primary → addon → light, lowest first.
 *
 * Omitted tier is treated as "primary" for sort/rendering purposes.
 */
export type AgentTier = "primary" | "addon" | "light";

export interface SpecialistAgent {
  key: string;
  name: string;
  icon: string;             // BoostIcon name
  automationRate: number;
  avgResolutionTime?: string;
  topTopic?: string;
  description: string;
  capabilities: AgentCapability[];
  quickActions: string[];
  flow: AgentFlow;
  /**
   * Optional list of industry variant keys (e.g. "insurance:mutual", "banking:retail")
   * for which this agent is particularly relevant. If omitted, the agent appears
   * for every variant of its industry (universal agent).
   */
  variants?: string[];
  /** Depth tier — see AgentTier docs. Defaults to "primary" when omitted. */
  tier?: AgentTier;
}

// ─── Topic Groups & Orchestrator Config ───

export interface TopicGroup {
  key: string;
  label: string;
  icon: string;
  agents: SpecialistAgent[];
}

export interface OrchestratorConfig {
  /** Standalone agents not in any topic group (e.g. "Customer relationship") */
  standaloneAgents: SpecialistAgent[];
  /** Topic groups containing agents */
  topicGroups: TopicGroup[];
}

// ─── Industries ───

export const INDUSTRIES = [
  { key: "insurance", label: "Insurance", description: "Claims, underwriting, policy servicing, and customer retention" },
  { key: "banking", label: "Banking", description: "Retail banking, commercial banking, digital banking services" },
  { key: "wealth_management", label: "Wealth Management", description: "Investment advisory, portfolio management, financial planning" },
  { key: "credit_union", label: "Credit Union", description: "Member services, lending, account management" },
  { key: "fintech", label: "Fintech", description: "Digital payments, lending platforms, neobanking" },
  { key: "pension", label: "Pension & Retirement", description: "Pension administration, retirement planning, fund management" },
] as const;

export type IndustryKey = (typeof INDUSTRIES)[number]["key"];

// ─── Industry Variants ───
//
// Variants let us slice an industry into sub-flavours (e.g. Insurance →
// Mutual, DTC, Broker-driven). Agents can be tagged with variants to indicate
// which flavours they're most relevant for.
//
// Variant keys are namespaced as "<industry>:<variant>" to avoid collisions
// across industries.
//
// Filter semantics (OR logic):
//   - Agent WITHOUT `variants` → shown for every variant (universal)
//   - Agent WITH `variants`    → shown only if at least one selected variant matches
//   - No variants selected     → no filtering (all agents shown for the industry)

export interface IndustryVariant {
  key: string;
  label: string;
  description?: string;
}

export const INDUSTRY_VARIANTS: Record<string, IndustryVariant[]> = {
  insurance: [
    {
      key: "insurance:mutual",
      label: "Mutual / Member-owned",
      description: "Members are owners; trust and transparency are core",
    },
    {
      key: "insurance:dtc",
      label: "Direct-to-Consumer",
      description: "Digital-first, app-native challengers (Lemonade, Hedvig)",
    },
    {
      key: "insurance:broker",
      label: "Broker-driven",
      description: "Policies sold via independent broker networks",
    },
  ],
  banking: [
    {
      key: "banking:retail",
      label: "Retail",
      description: "Mass-market consumer banking",
    },
    {
      key: "banking:corporate",
      label: "Corporate / SME",
      description: "Business customers, relationship banking",
    },
    {
      key: "banking:private",
      label: "Private / Wealth",
      description: "HNWI, concierge service, investments-heavy",
    },
    {
      key: "banking:neobank",
      label: "Digital-first / Neobank",
      description: "App-only, mobile-native, no legacy branches",
    },
  ],
};

/**
 * Filter a list of agents against a set of selected variant keys.
 * An agent passes the filter if:
 *   - it has no `variants` field (universal), OR
 *   - at least one of its variants matches the selection (OR logic)
 *
 * An empty `selectedVariants` array means "no filtering" — all agents pass.
 */
export function filterAgentsByVariants<T extends SpecialistAgent>(
  agents: T[],
  selectedVariants: string[] | undefined,
): T[] {
  if (!selectedVariants || selectedVariants.length === 0) return agents;
  return agents.filter(
    (a) => !a.variants || a.variants.length === 0 ||
      a.variants.some((v) => selectedVariants.includes(v)),
  );
}

// ─── Supporting Departments ───

export const SUPPORTING_DEPARTMENTS = [
  "Customer Service",
  "IT / Engineering",
  "Product",
  "Marketing",
  "Legal / Compliance",
  "Operations",
  "HR / People",
  "Finance",
  "Data / Analytics",
  "Security",
] as const;
