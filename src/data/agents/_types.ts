/* ─────────────────────────────────────────────
 *  Shared types and constants for agent data
 * ───────────────────────────────────────────── */

// ─── Flow Architecture Types ───

export interface FlowNode {
  id: string;
  name: string;
  type: string;             // e.g. "faq", "api", "hallucination", "transfer"
  icon: string;             // BoostIcon name
  description: string;
  elevioUrl?: string;       // link to elev.io article for Level 3 (future)
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
