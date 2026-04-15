import type { SpecialistAgent, TopicGroup } from "../_types";

// Ordered by customer-journey stage:
//   1. Outbound / proactive     → proactive-outreach
//   2. Acquisition              → sales-and-quotes
//   3. Account management       → account-and-my-pages
//   4. Core servicing           → claims, billing-and-payments, coverage-and-policy
//   5. Specialty (life/pension) → pension-and-savings
//
// Handover to manned channels (chat, voice, physical meetings) is handled via
// action hooks inside each self-service agent rather than as a separate stage.
import proactiveOutreach from "./proactive-outreach";
import salesAndQuotes from "./sales-and-quotes";
import accountAndMyPages from "./account-and-my-pages";
import claims from "./claims";
import billingAndPayments from "./billing-and-payments";
import coverageAndPolicy from "./coverage-and-policy";
import pensionAndSavings from "./pension-and-savings";

// ─── Flat list of all insurance agents ───

export const INSURANCE_AGENTS: SpecialistAgent[] = [
  proactiveOutreach,
  salesAndQuotes,
  accountAndMyPages,
  claims,
  billingAndPayments,
  coverageAndPolicy,
  pensionAndSavings,
];

// ─── Topic Groups ───

export const INSURANCE_TOPIC_GROUPS: TopicGroup[] = [
  {
    key: "insurance_agents",
    label: "Insurance",
    icon: "umbrella",
    agents: INSURANCE_AGENTS,
  },
];
