import type { SpecialistAgent, TopicGroup } from "../_types";

// Ordered by right-channelling funnel stage:
//   1. Proactive activities   → proactive-outreach
//   2. Self-service channels  → sales-and-quotes, account-and-my-pages,
//                              claims, billing-and-payments, coverage-and-policy,
//                              pension-and-savings
//   (Manned digital / traditional channels are handled via handover action
//    hooks inside each self-service agent.)
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
