import type { SpecialistAgent, TopicGroup } from "../_types";

import workplacePension from "./workplace-pension";
import personalPension from "./personal-pension";
import investmentFunds from "./investment-funds";
import retirementPlanning from "./retirement-planning";
import payoutsAndWithdrawals from "./payouts-and-withdrawals";
import myAccount from "./my-account";
import customerRelationship from "./customer-relationship";
import generalInquiries from "./general-inquiries";
import joinPension from "./join-pension";
import leaveOrTransfer from "./leave-or-transfer";

// ─── Flat list of all pension agents ───

export const PENSION_AGENTS: SpecialistAgent[] = [
  workplacePension,
  personalPension,
  investmentFunds,
  retirementPlanning,
  payoutsAndWithdrawals,
  myAccount,
  customerRelationship,
  generalInquiries,
  joinPension,
  leaveOrTransfer,
];

// ─── Standalone agents (outside topic groups) ───
// Customer relationship cross-cuts every pension product — surfaced on its own.

export const PENSION_STANDALONE: SpecialistAgent[] = [
  customerRelationship,
];

// ─── Topic Groups ───

export const PENSION_TOPIC_GROUPS: TopicGroup[] = [
  {
    key: "pension_plans",
    label: "Pension plans",
    icon: "bank",
    agents: [
      workplacePension,
      personalPension,
    ],
  },
  {
    key: "plan_and_retire",
    label: "Plan & retire",
    icon: "route",
    agents: [
      retirementPlanning,
      investmentFunds,
      payoutsAndWithdrawals,
    ],
  },
  {
    key: "member_services",
    label: "Member services",
    icon: "users",
    agents: [
      myAccount,
      generalInquiries,
      joinPension,
      leaveOrTransfer,
    ],
  },
];
