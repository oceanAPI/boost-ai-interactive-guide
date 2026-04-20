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

// ─── Customer management (firm-level, cross-cuts every product + journey stage) ───
import customerRelationship from "./customer-relationship";
import generalInquiries from "./general-inquiries";
import cancelOrChangePolicy from "./cancel-or-change-policy";

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
  // Customer management
  customerRelationship,
  generalInquiries,
  cancelOrChangePolicy,
];

// ─── Standalone agents (outside topic groups) ───
// Customer relationship cross-cuts every product line and journey stage.

export const INSURANCE_STANDALONE: SpecialistAgent[] = [
  customerRelationship,
];

// ─── Topic Groups ───
//
// Journey agents live under "Customer lifecycle" as the catch-all customer-lifecycle group.
// Product-line agents live under "Personal insurance" and "Business & pension" so they
// present as a proper site-nav-aligned set alongside the journey bucket.
// Firm-level customer management lives under "Customer management".

export const INSURANCE_TOPIC_GROUPS: TopicGroup[] = [
  {
    key: "insurance_journey",
    label: "Customer lifecycle",
    icon: "route",
    agents: [
      proactiveOutreach,
      salesAndQuotes,
      accountAndMyPages,
      claims,
      billingAndPayments,
      coverageAndPolicy,
    ],
  },
  {
    key: "insurance_personal",
    label: "Personal insurance",
    icon: "umbrella",
    agents: [
      motorInsurance,
      homeInsurance,
      lifeInsurance,
      travelInsurance,
      petInsurance,
      healthInsurance,
    ],
  },
  {
    key: "insurance_business_pension",
    label: "Business & pension",
    icon: "hand-protection",
    agents: [
      businessInsurance,
      pensionAndSavings,
    ],
  },
  {
    key: "insurance_customer_management",
    label: "Customer management",
    icon: "users",
    agents: [
      generalInquiries,
      cancelOrChangePolicy,
    ],
  },
];
