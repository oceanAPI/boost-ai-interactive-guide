/**
 * CS Decision Engine — Issue Detection (client-side port)
 *
 * Faithful port of the CSM Decision Engine's `src/engine/issueDetection.ts`.
 * Detects issues (2–47) from a customer's metrics and assigns each a severity
 * (0–1). Pure + framework-agnostic: the SAME functions run client-side in the
 * guide today and can be lifted into a Supabase Edge Function unchanged later.
 *
 * Deferred from the original until the backend phase: custom-issue evaluation
 * (`customIssueEvaluator`). Only the 46 built-in rules ship here.
 */

// ----------------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------------

export interface CustomerIntegration {
  id: string;
  name: string;
  connectedSystem: string;
}

export interface CustomerMetrics {
  // Core performance metrics (0-1 scale unless noted) — optional = "not set"
  automationRate?: number;
  csatScore?: number; // 1-10 scale
  csatResponseRate?: number; // 0-1
  unsolvedRate?: number;
  immediateEscalationsRate?: number;
  fallbackEscalationsRate?: number;
  escalationsByDesignRate?: number;
  hallucinationRate?: number;
  unknownRate?: number;
  adoptionRate?: number;
  conversationVolume?: number; // monthly

  // Channel volumes (monthly)
  phoneVolume?: number;
  emailVolume?: number;
  otherChannelsVolume?: number;

  // Bot processing split
  nluPercentage?: number;
  llmPercentage?: number;

  integrations?: CustomerIntegration[];

  // Lifecycle
  daysSinceGoLive?: number;
  daysSinceLastReview?: number;
  contractRenewalMonths?: number;

  arrUsage?: number;

  // Feature flags
  exportApiEnabled: boolean;
  authenticationEnabled: boolean;
  llmEnabled: boolean;
  humanChatEnabled: boolean;
  voiceEnabled: boolean;
  proactivityEnabled: boolean;
  customPanel: boolean;
  hasApiIntegrations: boolean;

  // Stakeholder & resources
  hasMainStakeholder: boolean;
  hasAiTrainer: boolean;
  aiTrainerMeetingsPerMonth?: number;
  stakeholderMeetingsPerQuarter?: number;
  kpiMeetingsPerQuarter?: number;
  hasSharedRoadmap: boolean;
  hasTechnicalResource: boolean;
  hasOrgStructureDoc: boolean;
  hasContactList: boolean;
  courseCompletionRate?: number;
  communityAttendanceRate?: number;

  // Cost metrics
  costPerConversation?: number;
  costPerTicketOtherChannels?: number;

  // Conversation analysis
  talkToHumanInTop5: boolean;
  unknownInTop5: boolean;
  longConversationsRate?: number;
  mediumConversationsRate?: number;

  // Partner & segment
  hasPartnerInvolvement: boolean;
  segment: "Strategic" | "Mid-Market" | "Low Touch";

  humanChatProvider: string;

  // Company hierarchy (Planhat-derived; used by the calculator's hierarchy boost)
  companyPhase?: string;
  companyARR?: number;
  instanceCount?: number;

  status?: string;
}

export interface DetectedIssue {
  issueId: number;
  issueName: string;
  detected: boolean;
  severity: number;
  reason: string;
}

export interface DetectIssuesOptions {
  /** Which fields were explicitly set (drives boolean-issue skipping + missing-data prompts). */
  metricsSet?: Record<string, boolean>;
}

// SafeCustomerMetrics: numeric fields filled with non-triggering defaults.
type SafeCustomerMetrics = Required<
  Pick<
    CustomerMetrics,
    | "automationRate"
    | "csatScore"
    | "csatResponseRate"
    | "unsolvedRate"
    | "immediateEscalationsRate"
    | "fallbackEscalationsRate"
    | "escalationsByDesignRate"
    | "hallucinationRate"
    | "unknownRate"
    | "adoptionRate"
    | "conversationVolume"
    | "daysSinceGoLive"
    | "daysSinceLastReview"
    | "contractRenewalMonths"
    | "aiTrainerMeetingsPerMonth"
    | "stakeholderMeetingsPerQuarter"
    | "kpiMeetingsPerQuarter"
    | "courseCompletionRate"
    | "communityAttendanceRate"
    | "costPerConversation"
    | "costPerTicketOtherChannels"
    | "longConversationsRate"
    | "mediumConversationsRate"
  >
> &
  Omit<
    CustomerMetrics,
    | "automationRate"
    | "csatScore"
    | "csatResponseRate"
    | "unsolvedRate"
    | "immediateEscalationsRate"
    | "fallbackEscalationsRate"
    | "escalationsByDesignRate"
    | "hallucinationRate"
    | "unknownRate"
    | "adoptionRate"
    | "conversationVolume"
    | "daysSinceGoLive"
    | "daysSinceLastReview"
    | "contractRenewalMonths"
    | "aiTrainerMeetingsPerMonth"
    | "stakeholderMeetingsPerQuarter"
    | "kpiMeetingsPerQuarter"
    | "courseCompletionRate"
    | "communityAttendanceRate"
    | "costPerConversation"
    | "costPerTicketOtherChannels"
    | "longConversationsRate"
    | "mediumConversationsRate"
  >;

interface IssueRule {
  id: number;
  name: string;
  detect: (m: SafeCustomerMetrics) => boolean;
  severity: (m: SafeCustomerMetrics) => number;
  reason: (m: SafeCustomerMetrics) => string;
}

// ----------------------------------------------------------------------------
// ISSUE DETECTION RULES (ported verbatim from the engine)
// ----------------------------------------------------------------------------

const ISSUE_RULES: IssueRule[] = [
  {
    id: 2,
    name: "Voice Upsell Opportunity",
    detect: (m) => !m.voiceEnabled && m.conversationVolume > 10000,
    severity: () => 0.1,
    reason: () => "High volume customer without voice channel",
  },
  {
    id: 3,
    name: "Chat Upsell Opportunity",
    detect: (m) => !m.humanChatEnabled && m.voiceEnabled,
    severity: () => 0.0,
    reason: () => "Has voice but could benefit from chat channel",
  },
  {
    id: 4,
    name: "LLM Upsell Opportunity",
    detect: (m) =>
      !m.llmEnabled &&
      (m.unknownRate > 0.15 || m.hallucinationRate > 0.03 || m.unsolvedRate > 0.15),
    severity: (m) =>
      Math.min(0.5 + Math.max(m.unknownRate - 0.15, m.unsolvedRate - 0.15, 0) * 2, 1.0),
    reason: (m) =>
      `LLM could improve quality: unknown ${(m.unknownRate * 100).toFixed(0)}%, unsolved ${(m.unsolvedRate * 100).toFixed(0)}%`,
  },
  {
    id: 5,
    name: "Human Chat Upsell Opportunity",
    detect: (m) => !m.humanChatEnabled && (m.csatScore < 7 || m.fallbackEscalationsRate > 0.1),
    severity: () => 0.1,
    reason: (m) =>
      `Human chat could improve CSAT (${m.csatScore.toFixed(1)}) and handle escalations`,
  },
  {
    id: 6,
    name: "Cost Per Conversation",
    detect: (m) => m.costPerConversation > 3 && m.automationRate < 0.5,
    severity: (m) =>
      Math.min(0.1 + (m.costPerConversation - 3) * 0.1 + (0.5 - m.automationRate) * 0.3, 0.5),
    reason: (m) =>
      `High bot cost $${m.costPerConversation.toFixed(2)}/conv with only ${(m.automationRate * 100).toFixed(0)}% automation`,
  },
  {
    id: 7,
    name: "Cost per ticket other channels",
    detect: (m) =>
      m.costPerTicketOtherChannels > m.costPerConversation * 2 && m.adoptionRate < 0.6,
    severity: (m) => Math.min(0.1 + (0.6 - m.adoptionRate) * 0.3, 0.3),
    reason: (m) =>
      `Opportunity: other channels cost $${m.costPerTicketOtherChannels.toFixed(2)} vs $${m.costPerConversation.toFixed(2)} for bot - drive adoption (${(m.adoptionRate * 100).toFixed(0)}%)`,
  },
  {
    id: 8,
    name: "Automation Rate",
    detect: (m) => m.automationRate < 0.5,
    severity: (m) => Math.min(0.15 + (0.5 - m.automationRate), 0.6),
    reason: (m) => `Automation ${(m.automationRate * 100).toFixed(0)}% below 50% target`,
  },
  {
    id: 9,
    name: "Unsolved Rate",
    detect: (m) => m.unsolvedRate > 0.1,
    severity: (m) => Math.min(0.1 + (m.unsolvedRate - 0.1) * 2, 0.6),
    reason: (m) => `Unsolved rate ${(m.unsolvedRate * 100).toFixed(0)}% exceeds 10%`,
  },
  {
    id: 10,
    name: "Immediate Escalations",
    detect: (m) => m.immediateEscalationsRate > 0.15,
    severity: (m) => Math.min(0.2 + (m.immediateEscalationsRate - 0.15), 0.6),
    reason: (m) => `${(m.immediateEscalationsRate * 100).toFixed(0)}% immediately request human`,
  },
  {
    id: 11,
    name: "Fallback escalations",
    detect: (m) => m.fallbackEscalationsRate > 0.1,
    severity: (m) => Math.min(0.1 + (m.fallbackEscalationsRate - 0.1), 0.4),
    reason: (m) => `Fallback escalation ${(m.fallbackEscalationsRate * 100).toFixed(0)}% exceeds 10%`,
  },
  {
    id: 12,
    name: "Escalations by design",
    detect: (m) => m.escalationsByDesignRate > 0.15,
    severity: (m) => Math.min(0.1 + (m.escalationsByDesignRate - 0.15), 0.4),
    reason: (m) =>
      `${(m.escalationsByDesignRate * 100).toFixed(0)}% escalations by design - optimization opportunity`,
  },
  {
    id: 13,
    name: "Human chat provider",
    detect: (m) => m.humanChatEnabled && !m.humanChatProvider,
    severity: () => 0.05,
    reason: () => "Human chat enabled but provider not documented",
  },
  {
    id: 14,
    name: "Export API in use",
    detect: (m) => !m.exportApiEnabled,
    severity: () => 0.23,
    reason: () => "Export API not enabled - missing analytics capabilities",
  },
  {
    id: 15,
    name: "Authentication Enabled",
    detect: (m) => !m.authenticationEnabled && m.segment === "Strategic",
    severity: () => 0.44,
    reason: () => "Strategic customer without authentication - missing personalization",
  },
  {
    id: 16,
    name: "Other API integrations",
    detect: (m) => !m.hasApiIntegrations && m.segment === "Strategic",
    severity: () => 0.49,
    reason: () => "Strategic customer without API integrations",
  },
  {
    id: 17,
    name: "CSAT/NPS/CES",
    detect: (m) => m.csatScore > 0 && m.csatScore < 7,
    severity: (m) => Math.min(0.4 + (7 - m.csatScore) * 0.1, 0.8),
    reason: (m) => `CSAT ${m.csatScore.toFixed(1)} below 7.0 target`,
  },
  {
    id: 18,
    name: "CSAT/NPS/CES response rate",
    detect: (m) => m.csatResponseRate < 0.1,
    severity: (m) => Math.min(0.3 + (0.1 - m.csatResponseRate) * 3, 0.75),
    reason: (m) => `CSAT response rate ${(m.csatResponseRate * 100).toFixed(0)}% below 10%`,
  },
  {
    id: 19,
    name: "Contract renewal date",
    detect: (m) => m.contractRenewalMonths <= 6,
    severity: (m) => {
      if (m.contractRenewalMonths <= 1) return 0.95;
      if (m.contractRenewalMonths <= 2) return 0.8;
      if (m.contractRenewalMonths <= 3) return 0.6;
      if (m.contractRenewalMonths <= 6) return 0.3;
      return 0;
    },
    reason: (m) => `Contract renews in ${m.contractRenewalMonths} months`,
  },
  {
    id: 20,
    name: "Time since last business review",
    detect: (m) => m.daysSinceLastReview > 90,
    severity: (m) => Math.min(0.3 + (m.daysSinceLastReview - 90) / 180, 0.8),
    reason: (m) => `${m.daysSinceLastReview} days since last review (target: 90)`,
  },
  {
    id: 21,
    name: "Main stakeholder",
    detect: (m) => !m.hasMainStakeholder,
    severity: () => 1.0,
    reason: () => "No main stakeholder identified - critical gap",
  },
  {
    id: 22,
    name: "Main AI trainer",
    detect: (m) => !m.hasAiTrainer,
    severity: () => 0.5,
    reason: () => "No AI trainer identified",
  },
  {
    id: 23,
    name: "AI Trainer Meetings Less Than Monthly",
    detect: (m) => m.hasAiTrainer && m.aiTrainerMeetingsPerMonth < 1,
    severity: () => 0.15,
    reason: (m) => `AI trainer meetings ${m.aiTrainerMeetingsPerMonth}/month (target: 1+)`,
  },
  {
    id: 24,
    name: "Stakeholder Meetings Less Than Quarterly",
    detect: (m) => m.hasMainStakeholder && m.stakeholderMeetingsPerQuarter < 1,
    severity: () => 0.2,
    reason: () => "Stakeholder meetings less than quarterly",
  },
  {
    id: 25,
    name: "Low Community Attendance",
    detect: (m) => m.communityAttendanceRate < 0.2,
    severity: (m) => Math.min(0.2 + (0.2 - m.communityAttendanceRate), 0.47),
    reason: (m) => `Community attendance ${(m.communityAttendanceRate * 100).toFixed(0)}% (target: 20%+)`,
  },
  {
    id: 26,
    name: "Course completion",
    detect: (m) => m.courseCompletionRate < 0.5,
    severity: (m) => Math.min(0.3 + (0.5 - m.courseCompletionRate) * 0.6, 0.6),
    reason: (m) => `Course completion ${(m.courseCompletionRate * 100).toFixed(0)}% (target: 50%+)`,
  },
  {
    id: 27,
    name: "Non-Technical AI Trainers",
    detect: (m) => m.hasAiTrainer && !m.hasTechnicalResource && m.segment === "Strategic",
    severity: () => 0.4,
    reason: () => "AI trainers lack technical support for strategic customer",
  },
  {
    id: 28,
    name: "Technical Resources",
    detect: (m) => !m.hasTechnicalResource && m.segment === "Strategic" && m.hasApiIntegrations,
    severity: () => 0.3,
    reason: () => "Has API integrations but no technical resource",
  },
  {
    id: 29,
    name: "KPI Meetings Less Than Quarterly",
    detect: (m) => m.kpiMeetingsPerQuarter < 1,
    severity: () => 0.2,
    reason: () => "KPI review meetings less than quarterly",
  },
  {
    id: 30,
    name: "Shared Initiative Roadmap",
    detect: (m) => !m.hasSharedRoadmap && m.segment !== "Low Touch",
    severity: () => 0.15,
    reason: () => "No shared roadmap with customer",
  },
  {
    id: 31,
    name: "Owners and contact insight",
    detect: (m) => !m.hasContactList,
    severity: () => 0.1,
    reason: () => "Missing key contact documentation",
  },
  {
    id: 32,
    name: "Org Structure Overview",
    detect: (m) => !m.hasOrgStructureDoc && m.segment === "Strategic",
    severity: () => 0.1,
    reason: () => "Missing org structure for strategic customer",
  },
  {
    id: 33,
    name: "Talk to Human in Top 5 Intents",
    detect: (m) => m.talkToHumanInTop5,
    severity: () => 0.3,
    reason: () => '"Talk to human" is a top 5 intent - trust issue',
  },
  {
    id: 34,
    name: "Unknown in Top 5 Intents",
    detect: (m) => m.unknownInTop5,
    severity: () => 0.3,
    reason: () => '"Unknown" is a top 5 intent - coverage gap',
  },
  {
    id: 35,
    name: "Too Many Long Conversations (10+ msg)",
    detect: (m) => m.longConversationsRate > 0.1,
    severity: (m) => Math.min(0.1 + (m.longConversationsRate - 0.1), 0.4),
    reason: (m) => `${(m.longConversationsRate * 100).toFixed(0)}% conversations 10+ messages`,
  },
  {
    id: 36,
    name: "Too Many Medium Conversations (5+ msg)",
    detect: (m) => m.mediumConversationsRate > 0.3,
    severity: (m) => Math.min(0.1 + (m.mediumConversationsRate - 0.3) * 0.5, 0.3),
    reason: (m) => `${(m.mediumConversationsRate * 100).toFixed(0)}% conversations 5+ messages`,
  },
  {
    id: 37,
    name: "Adoption",
    detect: (m) => m.adoptionRate < 0.4,
    severity: (m) => Math.min(0.15 + (0.4 - m.adoptionRate) * 0.5, 0.5),
    reason: (m) => `Adoption ${(m.adoptionRate * 100).toFixed(0)}% below 40% target`,
  },
  {
    id: 38,
    name: "High Hallucination Rate",
    detect: (m) => m.hallucinationRate > 0.03,
    severity: (m) => Math.min(0.2 + (m.hallucinationRate - 0.03) * 5, 0.7),
    reason: (m) => `Hallucination ${(m.hallucinationRate * 100).toFixed(1)}% exceeds 3%`,
  },
  {
    id: 39,
    name: "Volume potential",
    detect: (m) => m.adoptionRate < 0.4 && m.conversationVolume > 5000,
    severity: () => 0.15,
    reason: () => "High volume potential with low adoption",
  },
  {
    id: 40,
    name: "Proactivity enabled",
    detect: (m) => !m.proactivityEnabled && m.segment !== "Low Touch",
    severity: () => 0.15,
    reason: () => "Proactivity feature not enabled",
  },
  {
    id: 41,
    name: "High unknown rate",
    detect: (m) => m.unknownRate > 0.15,
    severity: (m) => Math.min(0.4 + (m.unknownRate - 0.15) * 2, 0.86),
    reason: (m) => `Unknown rate ${(m.unknownRate * 100).toFixed(0)}% exceeds 15%`,
  },
  {
    id: 42,
    name: "Go live date",
    detect: (m) => m.daysSinceGoLive <= 90 || m.daysSinceGoLive >= 365,
    severity: (m) => {
      if (m.daysSinceGoLive <= 30) return 0.3;
      if (m.daysSinceGoLive <= 90) return 0.15;
      if (m.daysSinceGoLive >= 365) return 0.1;
      return 0;
    },
    reason: (m) =>
      m.daysSinceGoLive <= 90
        ? `New customer (${m.daysSinceGoLive} days) - needs onboarding focus`
        : `Mature customer (${m.daysSinceGoLive} days) - annual review due`,
  },
  {
    id: 43,
    name: "Custom chat panel",
    detect: (m) => m.customPanel,
    severity: () => 0.1,
    reason: () => "Using custom chat panel - monitor for compatibility",
  },
  {
    id: 44,
    name: "Customer segment",
    detect: (m) => m.segment === "Low Touch" && m.courseCompletionRate < 0.3,
    severity: () => 0.2,
    reason: () => "Low touch customer with low course completion - enable self-service",
  },
  {
    id: 45,
    name: "Partner involvement",
    detect: (m) => m.hasPartnerInvolvement,
    severity: () => 0.1,
    reason: () => "Partner involved - coordinate activities",
  },
  {
    id: 46,
    name: "Model improvements",
    detect: (m) => m.automationRate < 0.5 || m.unsolvedRate > 0.15 || m.unknownRate > 0.15,
    severity: (m) => {
      const issues = [
        m.automationRate < 0.5 ? 0.5 - m.automationRate : 0,
        m.unsolvedRate > 0.15 ? m.unsolvedRate - 0.15 : 0,
        m.unknownRate > 0.15 ? m.unknownRate - 0.15 : 0,
      ];
      return Math.min(Math.max(...issues) * 2, 0.5);
    },
    reason: (m) =>
      `Model needs work: automation ${(m.automationRate * 100).toFixed(0)}%, unsolved ${(m.unsolvedRate * 100).toFixed(0)}%, unknown ${(m.unknownRate * 100).toFixed(0)}%`,
  },
];

// ----------------------------------------------------------------------------
// DETECTION
// ----------------------------------------------------------------------------

/** Fill undefined numeric fields with neutral (non-triggering) defaults. */
function getSafeMetrics(m: CustomerMetrics): SafeCustomerMetrics {
  return {
    ...m,
    automationRate: m.automationRate ?? 1.0,
    csatScore: m.csatScore ?? 10,
    csatResponseRate: m.csatResponseRate ?? 1.0,
    unsolvedRate: m.unsolvedRate ?? 0,
    immediateEscalationsRate: m.immediateEscalationsRate ?? 0,
    fallbackEscalationsRate: m.fallbackEscalationsRate ?? 0,
    escalationsByDesignRate: m.escalationsByDesignRate ?? 0,
    hallucinationRate: m.hallucinationRate ?? 0,
    unknownRate: m.unknownRate ?? 0,
    adoptionRate: m.adoptionRate ?? 1.0,
    conversationVolume: m.conversationVolume ?? 0,
    daysSinceGoLive: m.daysSinceGoLive ?? 365,
    daysSinceLastReview: m.daysSinceLastReview ?? 0,
    contractRenewalMonths: m.contractRenewalMonths ?? 24,
    aiTrainerMeetingsPerMonth: m.aiTrainerMeetingsPerMonth ?? 4,
    stakeholderMeetingsPerQuarter: m.stakeholderMeetingsPerQuarter ?? 4,
    kpiMeetingsPerQuarter: m.kpiMeetingsPerQuarter ?? 4,
    courseCompletionRate: m.courseCompletionRate ?? 1.0,
    communityAttendanceRate: m.communityAttendanceRate ?? 1.0,
    costPerConversation: m.costPerConversation ?? 0,
    costPerTicketOtherChannels: m.costPerTicketOtherChannels ?? 0,
    longConversationsRate: m.longConversationsRate ?? 0,
    mediumConversationsRate: m.mediumConversationsRate ?? 0,
  };
}

/** Issue IDs whose detection hinges on a boolean field. Skip when the field was never explicitly set. */
const BOOLEAN_ISSUE_FIELDS: Record<number, keyof CustomerMetrics> = {
  14: "exportApiEnabled",
  15: "authenticationEnabled",
  16: "hasApiIntegrations",
  21: "hasMainStakeholder",
  22: "hasAiTrainer",
  30: "hasSharedRoadmap",
  31: "hasContactList",
  32: "hasOrgStructureDoc",
  33: "talkToHumanInTop5",
  34: "unknownInTop5",
  40: "proactivityEnabled",
  43: "customPanel",
  45: "hasPartnerInvolvement",
};

function shouldSkipBooleanIssue(
  issueId: number,
  metricsSet: Record<string, boolean> | undefined,
): boolean {
  if (!metricsSet) return false;
  const field = BOOLEAN_ISSUE_FIELDS[issueId];
  if (!field) return false;
  return metricsSet[field] !== true;
}

export function detectIssues(
  metrics: CustomerMetrics,
  options?: DetectIssuesOptions,
): DetectedIssue[] {
  const safeMetrics = getSafeMetrics(metrics);
  const metricsSet = options?.metricsSet;
  const results: DetectedIssue[] = [];

  for (const rule of ISSUE_RULES) {
    if (shouldSkipBooleanIssue(rule.id, metricsSet)) {
      results.push({ issueId: rule.id, issueName: rule.name, detected: false, severity: 0, reason: "" });
      continue;
    }
    const detected = rule.detect(safeMetrics);
    const severity = detected ? rule.severity(safeMetrics) : 0;
    results.push({
      issueId: rule.id,
      issueName: rule.name,
      detected,
      severity: Math.max(0, Math.min(1, severity)),
      reason: detected ? rule.reason(safeMetrics) : "",
    });
  }

  return results;
}

/** Empty metrics — every numeric field undefined ("not set"), booleans false. */
export function getDefaultMetrics(): CustomerMetrics {
  return {
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
}
