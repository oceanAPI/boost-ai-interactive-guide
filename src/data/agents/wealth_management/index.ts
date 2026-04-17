import type { SpecialistAgent, TopicGroup } from "../_types";

import portfolioManagement from "./portfolio-management";
import tradingAndEquities from "./trading-and-equities";
import investmentFunds from "./investment-funds";
import retirementPlanning from "./retirement-planning";
import taxAndReporting from "./tax-and-reporting";
import advisoryAndPlanning from "./advisory-and-planning";
import myAccount from "./my-account";

// ─── Flat list of all wealth management agents ───

export const WEALTH_MANAGEMENT_AGENTS: SpecialistAgent[] = [
  portfolioManagement,
  tradingAndEquities,
  investmentFunds,
  retirementPlanning,
  taxAndReporting,
  advisoryAndPlanning,
  myAccount,
];

// ─── Topic Groups ───

export const WEALTH_MANAGEMENT_TOPIC_GROUPS: TopicGroup[] = [
  {
    key: "wealth_management_agents",
    label: "Wealth Management",
    icon: "bar-chart",
    agents: WEALTH_MANAGEMENT_AGENTS,
  },
];
