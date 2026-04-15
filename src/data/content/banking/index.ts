/* ─────────────────────────────────────────────
 *  Banking industry content overrides
 *
 *  Only override what differs from _defaults.ts.
 *  Everything else falls through automatically.
 * ───────────────────────────────────────────── */

import type { IndustryContentOverrides } from "../_types";

export const BANKING_OVERRIDES: IndustryContentOverrides = {
  hero: {
    tagline: "AI-Powered Banking Experience",
    highlights: [
      "80-90% automation across digital banking channels",
      "Pre-built intents for accounts, cards, loans, and payments",
      "PSD2, PCI-DSS, and GDPR compliance built in",
      "Seamless integration with core banking and contact center",
    ],
  },

  "case-studies": {
    featuredIds: ["mortgage-lender"],
  },

  "trust-validation": {
    industryProof: [
      {
        title: "Banking-Native AI",
        description: "Purpose-built for retail and commercial banking — pre-trained on millions of real banking conversations",
        stat: "200+ bank deployments",
      },
      {
        title: "PSD2 & PCI-DSS Ready",
        description: "Payment and card data handling meets the strictest regulatory requirements out of the box",
        stat: "Zero compliance incidents",
      },
      {
        title: "Core Banking Integrations",
        description: "Pre-built connectors for Temenos, FIS, Fiserv, Mambu, and major core banking platforms",
        stat: "15+ pre-built connectors",
      },
    ],
  },

  voice: {
    useCases: [
      {
        title: "Card Services",
        scenario: "Customer calls to report a lost card or dispute a transaction",
        outcome: "AI blocks card instantly, initiates replacement, captures dispute details — 2 min avg",
      },
      {
        title: "Payment & Transfers",
        scenario: "Customer needs to make a payment, check balance, or set up a standing order",
        outcome: "AI authenticates via voice biometrics, processes request end-to-end",
      },
      {
        title: "Loan Inquiries",
        scenario: "Customer calls about mortgage rates, loan status, or application progress",
        outcome: "AI provides personalized rate info, application status, or connects to advisor",
      },
    ],
  },

  "impact-csat": {
    narrative: "Banking customers expect instant, accurate answers about their money. When AI resolves balance checks, card issues, and payment questions in seconds instead of minutes, satisfaction scores jump. Your human agents get to focus on mortgage advice, financial planning, and complex disputes — the work that builds relationships.",
  },

  "auth-impacts": {
    postAuth: {
      title: "After Authentication",
      capabilities: [
        "Account balance and transaction history",
        "Internal transfers and bill payments",
        "Card management (block, replace, PIN reset)",
        "Loan payment and payoff quotes",
        "Statement and tax document requests",
        "Spending categorization and alerts",
      ],
      automationRate: "85-92%",
    },
  },
};
