/* ─────────────────────────────────────────────
 *  Insurance industry content overrides
 *
 *  Only override what differs from _defaults.ts.
 * ───────────────────────────────────────────── */

import type { IndustryContentOverrides } from "../_types";

export const INSURANCE_OVERRIDES: IndustryContentOverrides = {
  hero: {
    tagline: "AI-Powered Insurance Experience",
    highlights: [
      "80-90% automation across claims, billing, and policy servicing",
      "Pre-built FNOL intake, claim status, and policy change flows",
      "SOC 2, HIPAA-ready, and insurance regulatory compliance",
      "Integrates with Guidewire, Duck Creek, Majesco, and more",
    ],
  },

  "case-studies": {
    featuredIds: ["insurer-nordic"],
  },

  "trust-validation": {
    industryProof: [
      {
        title: "Insurance-Native AI",
        description: "Deep understanding of insurance terminology, workflows, and customer expectations from day one",
        stat: "150+ insurer deployments",
      },
      {
        title: "Claims Automation",
        description: "End-to-end FNOL intake, triage, and status tracking — reducing claim cycle times by 40%",
        stat: "40% faster claims",
      },
      {
        title: "Policy System Integrations",
        description: "Pre-built connectors for Guidewire, Duck Creek, Majesco, and major policy admin platforms",
        stat: "12+ pre-built connectors",
      },
    ],
  },

  voice: {
    useCases: [
      {
        title: "Claims FNOL",
        scenario: "Policyholder calls to report a new claim — auto, property, or health",
        outcome: "AI captures all FNOL details, creates claim record, schedules adjuster — 3 min avg",
      },
      {
        title: "Policy Servicing",
        scenario: "Customer needs to update coverage, add a driver, or change beneficiary",
        outcome: "AI processes endorsement request, confirms premium change, updates policy",
      },
      {
        title: "Billing & Payments",
        scenario: "Customer calls about a premium payment, missed installment, or refund",
        outcome: "AI retrieves billing details, processes payment, or sets up payment plan",
      },
    ],
  },

  "impact-csat": {
    narrative: "Insurance customers reach out during stressful moments — a car accident, a health issue, storm damage. When AI resolves their claim status, billing question, or policy change instantly, it reduces anxiety and builds trust. Your human agents get to focus on complex claims and sensitive situations where empathy makes all the difference.",
  },

  "auth-impacts": {
    postAuth: {
      title: "After Authentication",
      capabilities: [
        "Claim filing and real-time status tracking",
        "Policy details, coverage limits, and deductibles",
        "Premium payments and billing history",
        "Policy endorsements and coverage changes",
        "ID card and certificate of insurance requests",
        "Renewal quotes and coverage recommendations",
      ],
      automationRate: "80-88%",
    },
  },
};
