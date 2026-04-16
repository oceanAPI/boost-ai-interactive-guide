import type { SpecialistAgent, TopicGroup } from "../_types";

import membershipServices from "./membership-services";
import accountsAndDeposits from "./accounts-and-deposits";
import autoLoans from "./auto-loans";
import homeLoans from "./home-loans";
import personalLoans from "./personal-loans";
import creditAndDebitCards from "./credit-and-debit-cards";
import digitalBanking from "./digital-banking";
import financialWellness from "./financial-wellness";

// ─── Flat list of all credit union agents ───

export const CREDIT_UNION_AGENTS: SpecialistAgent[] = [
  membershipServices,
  accountsAndDeposits,
  autoLoans,
  homeLoans,
  personalLoans,
  creditAndDebitCards,
  digitalBanking,
  financialWellness,
];

// ─── Topic Groups ───

export const CREDIT_UNION_TOPIC_GROUPS: TopicGroup[] = [
  {
    key: "credit_union_agents",
    label: "Credit Union",
    icon: "users",
    agents: CREDIT_UNION_AGENTS,
  },
];
