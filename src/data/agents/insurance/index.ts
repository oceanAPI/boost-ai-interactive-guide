import type { SpecialistAgent, TopicGroup } from "../_types";

import claims from "./claims";
import billingAndPayments from "./billing-and-payments";
import coverageAndPolicy from "./coverage-and-policy";

// ─── Flat list of all insurance agents ───

export const INSURANCE_AGENTS: SpecialistAgent[] = [
  claims,
  billingAndPayments,
  coverageAndPolicy,
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
