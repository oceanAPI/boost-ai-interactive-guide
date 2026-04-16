import type { SpecialistAgent, TopicGroup } from "../_types";

import accountAndOnboarding from "./account-and-onboarding";
import paymentsAndTransfers from "./payments-and-transfers";
import cards from "./cards";
import savingsAndVaults from "./savings-and-vaults";
import investmentsAndCrypto from "./investments-and-crypto";
import bnplAndCredit from "./bnpl-and-credit";
import security from "./security";

// ─── Flat list of all fintech agents ───

export const FINTECH_AGENTS: SpecialistAgent[] = [
  accountAndOnboarding,
  paymentsAndTransfers,
  cards,
  savingsAndVaults,
  investmentsAndCrypto,
  bnplAndCredit,
  security,
];

// ─── Topic Groups ───

export const FINTECH_TOPIC_GROUPS: TopicGroup[] = [
  {
    key: "fintech_agents",
    label: "Fintech",
    icon: "desktop-network",
    agents: FINTECH_AGENTS,
  },
];
