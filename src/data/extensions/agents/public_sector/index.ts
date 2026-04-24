import type { SpecialistAgent, TopicGroup } from "../../../agents/_types";

import caseStatus from "./case-status";
import appealsProcess from "./appeals-process";
import benefitsEligibility from "./benefits-eligibility";
import documentSubmission from "./document-submission";
import complaintsFeedback from "./complaints-feedback";

export const PUBLIC_SECTOR_AGENTS: SpecialistAgent[] = [
  caseStatus,
  appealsProcess,
  benefitsEligibility,
  documentSubmission,
  complaintsFeedback,
];

// Case Status sits standalone — it's the universal entry point for any citizen
// regardless of benefits vs appeals context.
export const PUBLIC_SECTOR_STANDALONE: SpecialistAgent[] = [
  caseStatus,
];

export const PUBLIC_SECTOR_TOPIC_GROUPS: TopicGroup[] = [
  {
    key: "ps_appeals",
    label: "Appeals & review",
    icon: "balance",
    agents: [
      appealsProcess,
      documentSubmission,
    ],
  },
  {
    key: "ps_services",
    label: "Citizen services",
    icon: "hand-protection",
    agents: [
      benefitsEligibility,
      complaintsFeedback,
    ],
  },
];
