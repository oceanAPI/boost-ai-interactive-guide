import type { SpecialistAgent, TopicGroup } from "../_types";

// ─── Journey agents (cross-cut all product lines) ───
//   1. Outbound / proactive     → proactive-outreach
//   2. Acquisition              → sales-and-quotes
//   3. Account management       → account-and-my-pages
//   4. Core servicing           → claims, billing-and-payments, coverage-and-policy
//   5. Specialty (life/pension) → pension-and-savings
//
import proactiveOutreach from "./proactive-outreach";
import salesAndQuotes from "./sales-and-quotes";
import accountAndMyPages from "./account-and-my-pages";
import claims from "./claims";
import billingAndPayments from "./billing-and-payments";
import coverageAndPolicy from "./coverage-and-policy";
import pensionAndSavings from "./pension-and-savings";

// ─── Product-line agents (real insurer website nav) ───
import motorInsurance from "./motor-insurance";
import homeInsurance from "./home-insurance";
import lifeInsurance from "./life-insurance";
import travelInsurance from "./travel-insurance";
import petInsurance from "./pet-insurance";
import healthInsurance from "./health-insurance";
import businessInsurance from "./business-insurance";

// ─── Flat list of all insurance agents ───

export const INSURANCE_AGENTS: SpecialistAgent[] = [
  // Journey
  proactiveOutreach,
  salesAndQuotes,
  accountAndMyPages,
  claims,
  billingAndPayments,
  coverageAndPolicy,
  pensionAndSavings,
  // Product lines
  motorInsurance,
  homeInsurance,
  lifeInsurance,
  travelInsurance,
  petInsurance,
  healthInsurance,
  businessInsurance,
];

// ─── Topic Groups ───
//
// Journey agents live under "Insurance" as the catch-all customer-lifecycle group.
// Product-line agents live under "Product Lines" so they present as a proper
// site-nav-aligned set alongside the journey bucket.

export const INSURANCE_TOPIC_GROUPS: TopicGroup[] = [
  {
    key: "insurance_journey",
    label: "Insurance",
    icon: "umbrella",
    agents: [
      proactiveOutreach,
      salesAndQuotes,
      accountAndMyPages,
      claims,
      billingAndPayments,
      coverageAndPolicy,
      pensionAndSavings,
    ],
  },
  {
    key: "insurance_product_lines",
    label: "Product Lines",
    icon: "hand-protection",
    agents: [
      motorInsurance,
      homeInsurance,
      lifeInsurance,
      travelInsurance,
      petInsurance,
      healthInsurance,
      businessInsurance,
    ],
  },
];
