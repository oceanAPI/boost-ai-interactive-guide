import type { SpecialistAgent, TopicGroup } from "../_types";

import portfolioManagement from "./portfolio-management";
import tradingAndEquities from "./trading-and-equities";
import investmentFunds from "./investment-funds";
import retirementPlanning from "./retirement-planning";
import taxAndReporting from "./tax-and-reporting";
import advisoryAndPlanning from "./advisory-and-planning";
import myAccount from "./my-account";
import clientRelationship from "./client-relationship";
import generalInquiries from "./general-inquiries";
import becomeAClient from "./become-a-client";
import offboarding from "./offboarding";

// ─── Flat list of all wealth management agents ───

export const WEALTH_MANAGEMENT_AGENTS: SpecialistAgent[] = [
  portfolioManagement,
  tradingAndEquities,
  investmentFunds,
  retirementPlanning,
  taxAndReporting,
  advisoryAndPlanning,
  myAccount,
  clientRelationship,
  generalInquiries,
  becomeAClient,
  offboarding,
];

// ─── Standalone agents (outside topic groups) ───
// Client relationship cross-cuts every wealth product — surfaced on its own.

export const WEALTH_MANAGEMENT_STANDALONE: SpecialistAgent[] = [
  clientRelationship,
];

// ─── Topic Groups ───

export const WEALTH_MANAGEMENT_TOPIC_GROUPS: TopicGroup[] = [
  {
    key: "investments",
    label: "Investments",
    icon: "growth-graph",
    agents: [
      portfolioManagement,
      investmentFunds,
      tradingAndEquities,
    ],
  },
  {
    key: "planning_and_advice",
    label: "Planning & advice",
    icon: "route",
    agents: [
      advisoryAndPlanning,
      retirementPlanning,
    ],
  },
  {
    key: "account_and_tax",
    label: "Account & tax",
    icon: "cogs",
    agents: [
      taxAndReporting,
      myAccount,
    ],
  },
  {
    key: "client_services",
    label: "Client services",
    icon: "users",
    agents: [
      generalInquiries,
      becomeAClient,
      offboarding,
    ],
  },
];
