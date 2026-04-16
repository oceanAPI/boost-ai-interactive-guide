import type { SpecialistAgent, TopicGroup } from "../_types";

import workplacePension from "./workplace-pension";
import personalPension from "./personal-pension";
import investmentFunds from "./investment-funds";
import retirementPlanning from "./retirement-planning";
import payoutsAndWithdrawals from "./payouts-and-withdrawals";
import myAccount from "./my-account";

// ─── Flat list of all pension agents ───

export const PENSION_AGENTS: SpecialistAgent[] = [
  workplacePension,
  personalPension,
  investmentFunds,
  retirementPlanning,
  payoutsAndWithdrawals,
  myAccount,
];

// ─── Topic Groups ───

export const PENSION_TOPIC_GROUPS: TopicGroup[] = [
  {
    key: "pension_agents",
    label: "Pension & Retirement",
    icon: "users",
    agents: PENSION_AGENTS,
  },
];
