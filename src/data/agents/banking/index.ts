import type { SpecialistAgent, TopicGroup } from "../_types";

import accountServices from "./account-services";
import cardsAndPayments from "./cards-and-payments";
import lendingAndMortgages from "./lending-and-mortgages";
import digitalBanking from "./digital-banking";
import generalInquiries from "./general-inquiries";
import customerRelationship from "./customer-relationship";
import creditCards from "./credit-cards";
import mobileBankApplication from "./mobile-bank-application";
import payment from "./payment";
import autoInsurance from "./auto-insurance";
import insuranceGeneral from "./insurance-general";
import carloan from "./carloan";
import consumerLoans from "./consumer-loans";
import bankFraud from "./bank-fraud";
import prices from "./prices";
import pension from "./pension";
import stocksAndFunds from "./stocks-and-funds";

// ─── Flat list of all banking agents ───

export const BANKING_AGENTS: SpecialistAgent[] = [
  accountServices,
  cardsAndPayments,
  lendingAndMortgages,
  digitalBanking,
  generalInquiries,
  customerRelationship,
  creditCards,
  mobileBankApplication,
  payment,
  autoInsurance,
  insuranceGeneral,
  carloan,
  consumerLoans,
  bankFraud,
  prices,
  pension,
  stocksAndFunds,
];

// ─── Standalone agents (outside topic groups) ───

export const BANKING_STANDALONE: SpecialistAgent[] = [
  customerRelationship,
];

// ─── Topic Groups (matches admin panel structure) ───

export const BANKING_TOPIC_GROUPS: TopicGroup[] = [
  {
    key: "everyday_banking",
    label: "Everyday banking",
    icon: "bank",
    agents: [
      accountServices,
      cardsAndPayments,
      creditCards,
      mobileBankApplication,
      payment,
    ],
  },
  {
    key: "bank_insurance",
    label: "Insurance",
    icon: "umbrella",
    agents: [
      autoInsurance,
      insuranceGeneral,
    ],
  },
  {
    key: "loans",
    label: "Loans",
    icon: "balance",
    agents: [
      carloan,
      consumerLoans,
      lendingAndMortgages,
    ],
  },
  {
    key: "other_bank_services",
    label: "Other bank services",
    icon: "cogs",
    agents: [
      bankFraud,
      generalInquiries,
      prices,
    ],
  },
  {
    key: "savings",
    label: "Savings",
    icon: "growth-graph",
    agents: [
      pension,
      stocksAndFunds,
    ],
  },
];
