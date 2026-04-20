import type { SpecialistAgent, TopicGroup } from "../_types";

import membershipServices from "./membership-services";
import accountsAndDeposits from "./accounts-and-deposits";
import autoLoans from "./auto-loans";
import homeLoans from "./home-loans";
import personalLoans from "./personal-loans";
import creditAndDebitCards from "./credit-and-debit-cards";
import digitalBanking from "./digital-banking";
import financialWellness from "./financial-wellness";
import memberRelationship from "./member-relationship";
import generalInquiries from "./general-inquiries";

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
  memberRelationship,
  generalInquiries,
];

// ─── Standalone agents (outside topic groups) ───

export const CREDIT_UNION_STANDALONE: SpecialistAgent[] = [
  memberRelationship,
];

// ─── Topic Groups ───

export const CREDIT_UNION_TOPIC_GROUPS: TopicGroup[] = [
  {
    key: "everyday_banking",
    label: "Everyday banking",
    icon: "bank",
    agents: [
      accountsAndDeposits,
      creditAndDebitCards,
      digitalBanking,
    ],
  },
  {
    key: "loans",
    label: "Loans",
    icon: "balance",
    agents: [
      autoLoans,
      homeLoans,
      personalLoans,
    ],
  },
  {
    key: "financial_wellness",
    label: "Financial wellness",
    icon: "growth-graph",
    agents: [
      financialWellness,
    ],
  },
  {
    key: "member_services",
    label: "Member services",
    icon: "users",
    agents: [
      membershipServices,
      generalInquiries,
    ],
  },
];
