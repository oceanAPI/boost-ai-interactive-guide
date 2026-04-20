import type { SpecialistAgent, TopicGroup } from "../_types";

import accountAndOnboarding from "./account-and-onboarding";
import paymentsAndTransfers from "./payments-and-transfers";
import cards from "./cards";
import savingsAndVaults from "./savings-and-vaults";
import investmentsAndCrypto from "./investments-and-crypto";
import bnplAndCredit from "./bnpl-and-credit";
import security from "./security";
import customerRelationship from "./customer-relationship";
import generalInquiries from "./general-inquiries";
import closeAccount from "./close-account";

// ─── Flat list of all fintech agents ───

export const FINTECH_AGENTS: SpecialistAgent[] = [
  accountAndOnboarding,
  paymentsAndTransfers,
  cards,
  savingsAndVaults,
  investmentsAndCrypto,
  bnplAndCredit,
  security,
  customerRelationship,
  generalInquiries,
  closeAccount,
];

// ─── Standalone agents (outside topic groups) ───

export const FINTECH_STANDALONE: SpecialistAgent[] = [
  customerRelationship,
];

// ─── Topic Groups ───

export const FINTECH_TOPIC_GROUPS: TopicGroup[] = [
  {
    key: "money_movement",
    label: "Money movement",
    icon: "banknote",
    agents: [
      paymentsAndTransfers,
      cards,
    ],
  },
  {
    key: "credit_and_savings",
    label: "Credit & savings",
    icon: "growth-graph",
    agents: [
      bnplAndCredit,
      savingsAndVaults,
    ],
  },
  {
    key: "investing",
    label: "Investing",
    icon: "bar-chart",
    agents: [
      investmentsAndCrypto,
    ],
  },
  {
    key: "account_and_trust",
    label: "Account & trust",
    icon: "users",
    agents: [
      accountAndOnboarding,
      security,
      generalInquiries,
      closeAccount,
    ],
  },
];
